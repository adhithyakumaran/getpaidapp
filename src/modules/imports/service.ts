import type {Pool,PoolClient} from 'pg';
import {transaction,assertPostgres17} from '../database/client';
import {Repository} from '../database/repository';
import {CouponBatch,contentHash,digest,identityHash,offerId} from './schema';
import {brandFor} from '../catalogue/brands';
import {categoryNames,ShopperUrl} from '../catalogue/model';

export class ImportError extends Error {constructor(readonly code:string){super(code);}}
const product=(url:string)=>ShopperUrl.safeParse(url).success?new URL(url).pathname.split('/').filter(Boolean).at(-1):null;
async function insertRows(client:PoolClient,table:string,columns:string[],rows:unknown[][]) {
  if(!rows.length)return;
  // Identifiers are internal constants, never supplied batch input.
  const values:unknown[]=[];
  const tuples=rows.map(row=>{const start=values.length;values.push(...row);return '('+row.map((_,i)=>'$'+(start+i+1)).join(',')+')';});
  await client.query(`INSERT INTO ${table}(${columns.join(',')}) VALUES ${tuples.join(',')}`,values);
}
export async function importBatch(pool:Pool,input:unknown,options:{apply:boolean;publish:boolean}) {
  const batch=CouponBatch.parse(input);const now=Date.now()+5*60*1000;
  if(Date.parse(batch.suppliedAt)>now || (batch.approval && Date.parse(batch.approval.approvedAt)>now))throw new ImportError('FUTURE_PROVENANCE_DATE');
  if(options.publish && (batch.synthetic || !batch.approval || !batch.coupons.some(c=>c.approved)))throw new ImportError('PUBLICATION_APPROVAL_REQUIRED');
  const batchId='batch-'+digest([batch.supplierId,batch.batchId]);const hash=digest(batch);
  await assertPostgres17(pool);
  return transaction(pool,async client=>{
    await client.query('SELECT pg_advisory_xact_lock(71302502)');
    const previous=await client.query('SELECT digest,publication_requested FROM supplied_batches WHERE id=$1',[batchId]);
    if(previous.rowCount) {
      if(previous.rows[0].digest!==hash || previous.rows[0].publication_requested!==options.publish)throw new ImportError('BATCH_REPLAY_CONFLICT');
      return {mode:options.apply?'APPLY':'DRY_RUN',replayed:true,created:0,published:0,existing:batch.coupons.length,withheld:batch.withheldCandidates.length};
    }
    const retailers=[...new Set(batch.coupons.map(c=>c.terms.retailerId))];
    const existingOffers=await client.query(`SELECT o.id,o.retailer_id,o.code,o.lifecycle,o.publication_state,
      so.supplier_id,so.external_id,so.content_hash,so.identity_hash,so.synthetic,so.public_approved,so.original_url,
      EXISTS(SELECT 1 FROM duplicate_reviews d WHERE (d.offer_id=o.id OR d.candidate_offer_id=o.id) AND d.resolution IS NULL) AS unresolved
      FROM offers o LEFT JOIN supplied_offers so ON so.offer_id=o.id WHERE o.retailer_id=ANY($1::text[]) LIMIT 50001`,[retailers]);
    if((existingOffers.rowCount??0)>50000)throw new ImportError('DUPLICATE_REVIEW_LIMIT');
    const listings=await client.query(`SELECT sl.current_offer_id,sl.original_url FROM source_listings sl JOIN offers o ON o.id=sl.current_offer_id
      WHERE o.retailer_id=ANY($1::text[]) LIMIT 50001`,[retailers]);
    if((listings.rowCount??0)>50000)throw new ImportError('DUPLICATE_REVIEW_LIMIT');
    const identities=new Set<string>();const codes=new Set<string>();const products=new Set<string>();
    let created=0,published=0,existing=0;
    const prepared=batch.coupons.map(coupon=>{
      const id=offerId(batch.supplierId,coupon.externalId);const identity=identityHash(coupon);const content=contentHash(coupon);
      if(identities.has(identity))throw new ImportError('DUPLICATE_IN_BATCH');identities.add(identity);
      const code=coupon.terms.code?.trim().toUpperCase()??null;
      const codeKey=code?coupon.terms.retailerId+':'+code:null;const productKey=product(coupon.originalUrl);
      if((codeKey&&codes.has(codeKey))||(productKey&&products.has(productKey)))throw new ImportError('DUPLICATE_REVIEW_REQUIRED');
      if(codeKey)codes.add(codeKey);if(productKey)products.add(productKey);
      const row=existingOffers.rows.find(r=>r.supplier_id===batch.supplierId&&r.external_id===coupon.externalId);
      if(row&&(row.content_hash!==content||row.synthetic!==batch.synthetic))throw new ImportError('EXISTING_IDENTITY_CHANGED');
      const conflict=existingOffers.rows.some(r=>r.id!==id&&r.retailer_id===coupon.terms.retailerId&&
        (r.identity_hash===identity||(code&&r.code?.trim().toUpperCase()===code)||(productKey&&
          (product(r.original_url??'')===productKey||listings.rows.some(l=>l.current_offer_id===r.id&&product(l.original_url)===productKey)))));
      if(conflict)throw new ImportError('DUPLICATE_REVIEW_REQUIRED');
      const publish=options.publish&&coupon.approved;
      if(publish&&coupon.terms.validUntil&&Date.parse(coupon.terms.validUntil)<=Date.now())throw new ImportError('EXPIRED_RECORD_NOT_PUBLISHABLE');
      if(publish&&row&&(['EXPIRED','INACTIVE'].includes(row.lifecycle)||['WITHHELD','REVIEW_REQUIRED'].includes(row.publication_state)||row.unresolved))throw new ImportError('PUBLICATION_REVIEW_REQUIRED');
      if(row)existing++;else created++;if(publish&&!row?.public_approved)published++;
      return {id,coupon,identity,content,row,publish};
    });
    if(options.apply) {
      await insertRows(client,'supplied_batches',['id','supplier_id','external_batch_id','supplier_name','digest','supplied_at','synthetic','publication_requested','approval','payload'],
        [[batchId,batch.supplierId,batch.batchId,batch.supplierName,hash,batch.suppliedAt,batch.synthetic,options.publish,batch.approval,input]]);
      await insertRows(client,'supplied_candidates',['batch_id','external_id','reason','input'],batch.withheldCandidates.map(c=>[batchId,c.externalId,c.reason,c.raw]));
      const fresh=prepared.filter(p=>!p.row);
      const stores=[...new Set(fresh.map(p=>p.coupon.terms.retailerId))].map(id=>({id,name:brandFor(id).name}));
      const cats=[...new Set(fresh.map(p=>p.coupon.category))].map(id=>({id,name:categoryNames[id]}));
      await client.query("INSERT INTO stores(id,name,slug) SELECT id,name,id FROM jsonb_to_recordset($1::jsonb) AS x(id text,name text) ON CONFLICT(id) DO NOTHING",[JSON.stringify(stores)]);
      await client.query("INSERT INTO categories(id,name,slug) SELECT id,name,id FROM jsonb_to_recordset($1::jsonb) AS x(id text,name text) ON CONFLICT(id) DO NOTHING",[JSON.stringify(cats)]);
      await new Repository(client).createOffers(fresh.map(p=>({id:p.id,slug:p.id,terms:p.coupon.terms})));
      await insertRows(client,'offer_categories',['offer_id','category_id'],fresh.map(p=>[p.id,p.coupon.category]));
      await insertRows(client,'supplied_offers',['offer_id','supplier_id','external_id','content_hash','identity_hash','batch_id','original_url','evidence_reference','synthetic'],
        fresh.map(p=>[p.id,batch.supplierId,p.coupon.externalId,p.content,p.identity,batchId,p.coupon.originalUrl,p.coupon.evidenceReference,batch.synthetic]));
      await insertRows(client,'supplied_batch_items',['batch_id','offer_id','input'],prepared.map(p=>[batchId,p.id,p.coupon]));
      const publishIds=prepared.filter(p=>p.publish&&!p.row?.public_approved).map(p=>p.id);
      if(publishIds.length) {
        await client.query('UPDATE supplied_offers SET public_approved=true,approved_batch_id=$2 WHERE offer_id=ANY($1::text[])',[publishIds,batchId]);
        await client.query("UPDATE offers SET publication_state='PUBLISHED',content_version=content_version+1,content_updated_at=clock_timestamp() WHERE id=ANY($1::text[])",[publishIds]);
      }
      await insertRows(client,'offer_audit',['id','offer_id','actor','reason','before_state','after_state'],prepared.filter(p=>!p.row||(p.publish&&!p.row.public_approved)).map(p=>[
        digest([batchId,p.id]),p.id,batch.approval?.actor??'supplied-import',batch.approval?.reason??'Supplied batch imported as draft',
        p.row?{publicApproved:p.row.public_approved}:null,{batchId,publicApproved:p.publish,contentHash:p.content}]));
    }
    return {mode:options.apply?'APPLY':'DRY_RUN',replayed:false,created,published,existing,withheld:batch.withheldCandidates.length};
  });
}
