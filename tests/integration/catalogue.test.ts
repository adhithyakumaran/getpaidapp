import { beforeAll, afterAll, expect, it } from 'vitest';
import type { Pool } from 'pg';
import { testPool } from './safety';
import { migrate } from '@/src/modules/database/migrate';
import { transaction } from '@/src/modules/database/client';
import { Repository } from '@/src/modules/database/repository';
import { parseCatalogueQuery } from '@/src/modules/catalogue/model';
import fixture from '../fixtures/offer.json';
let pool:Pool;let serial=0;
beforeAll(async()=> {
  pool=await testPool();await pool.query('DROP SCHEMA public CASCADE');await pool.query('CREATE SCHEMA public');await migrate(pool);
  await transaction(pool,async client=> {
    const repo=new Repository(client);
    await client.query("INSERT INTO stores VALUES('amazon-india','Amazon India','amazon-india')");
    await client.query("INSERT INTO categories VALUES('audio','Audio','audio')");
    for(const id of ['ui-approved','fixture-ui-approved','ui-unreviewed']) await repo.addSource({id,name:'Policy test source',enabled:id!=='ui-unreviewed',
      permission:id==='ui-unreviewed'?'UNREVIEWED':'APPROVED',permissionEvidence:id==='ui-unreviewed'?null:'Synthetic policy test, no real access grant',
      reviewedAt:id==='ui-unreviewed'?null:'2026-10-29T00:00:00Z',accessMethod:'API',allowedHosts:['www.amazon.in'],attribution:'Policy test only',requestBudget:1,timeoutMs:1000});
  });
});
afterAll(async()=>{if(pool)await pool.end();});
async function addOffer(id:string,options:{source?:string;draft?:boolean;synthetic?:boolean;url?:string;missingMarker?:boolean;review?:boolean}={}) {
  await transaction(pool,async client=> {
    const repo=new Repository(client);const sourceId=options.source??'ui-approved';const runId=`ui-run-${id}`;
    await repo.createOffer(id,id,{...fixture,retailerId:'amazon-india',title:`Policy test ${id}`,eligibility:{products:'Selected item only.',rawEvidence:'PRIVATE_INTERNAL_MARKER',credential:'PRIVATE_INTERNAL_MARKER'}});
    if(!options.draft) await client.query("UPDATE offers SET publication_state='PUBLISHED' WHERE id=$1",[id]);
    await client.query('INSERT INTO offer_categories VALUES($1,$2)',[id,'audio']);
    await repo.createRun(runId,sourceId,new Date(Date.UTC(2026,9,29,0,serial++)).toISOString());
    const url=options.url??'https://www.amazon.in/dp/B000FAKE01';
    const listing=await repo.recordCollectedListing(`ui-listing-${id}`,sourceId,`key-${id}`,url,'2026-10-29T08:00:00Z');
    await client.query('UPDATE source_listings SET current_offer_id=$1 WHERE id=$2',[id,listing]);
    await repo.appendObservation({id:`ui-observation-${id}`,runId,sourceId,listingId:listing,offerId:id,originalUrl:url,observedAt:'2026-10-29T08:00:00Z',
      normalized:{...fixture,retailerId:'amazon-india'},normalizationVersion:'policy-test',rawEvidence:options.missingMarker?{raw:'PRIVATE_INTERNAL_MARKER'}:{synthetic:options.synthetic??false,raw:'PRIVATE_INTERNAL_MARKER'},
      fieldProvenance:{synthetic:options.synthetic??false,private:'PRIVATE_INTERNAL_MARKER'},rawDateText:null,interpretedTimezone:null,sourceReportedVerification:'PRIVATE_INTERNAL_MARKER'});
    if(options.review) await client.query("INSERT INTO duplicate_reviews(id,offer_id,candidate_offer_id,rule_version,evidence) VALUES($1,$2,'hidden-draft','test','{}')",[`review-${id}`,id]);
  });
}
it('returns a narrow validated shopper projection while omitting operational evidence and metadata',async()=> {
  await addOffer('eligible-offer');
  const page=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({})));
  expect(page.total).toBe(1);expect(page.offers[0].slug).toBe('eligible-offer');
  expect(page.offers[0].terms.minSpendPaise).toBeNull();
  expect(page.offers[0].terms.eligibility).toEqual({});
  expect(page.offers[0].conditions).toEqual(['Selected item only.']);
  expect(JSON.stringify(page)).not.toContain('PRIVATE_INTERNAL_MARKER');
});
it('excludes drafts, fixture sources/data, unapproved sources, missing provenance and API URLs',async()=> {
  await addOffer('hidden-draft',{draft:true});
  await addOffer('hidden-fixture-source',{source:'fixture-ui-approved'});
  await addOffer('hidden-fixture-record',{synthetic:true});
  await addOffer('hidden-unreviewed',{source:'ui-unreviewed'});
  await addOffer('hidden-missing-marker',{missingMarker:true});
  await addOffer('hidden-api-link',{url:'https://sellingpartnerapi-eu.amazon.com/promotions/2025-12-01/promotions'});
  await addOffer('hidden-review',{review:true});
  const page=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({})));
  expect(page.total).toBe(1);expect(page.offers.map(o=>o.slug)).toEqual(['eligible-offer']);
  for(const slug of ['hidden-draft','hidden-fixture-source','hidden-fixture-record','hidden-unreviewed','hidden-api-link','hidden-review']) {
    const detail=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({}),slug));
    expect(detail.offers).toEqual([]);
  }
});
it('supports bounded literal search, filters and stable pagination in PostgreSQL',async()=> {
  for(const id of Array.from({length:9},(_,i)=>'eligible-page-'+i)) await addOffer(id);
  const page=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({category:'audio',page:'2'})));
  expect(page.total).toBe(10);expect(page.pages).toBe(2);expect(page.offers).toHaveLength(3);
  const first=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({page:"1"})));expect(first.offers).toHaveLength(7);expect(first.relatedOffers).toHaveLength(3);
  const clamped=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({page:"999"})));expect(clamped.page).toBe(2);expect(clamped.offers).toHaveLength(3);
  const none=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({q:"%' OR 1=1 --"})));
  expect(none.total).toBe(0);
  const filtered=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({kind:'CODE'})));
  expect(filtered.total).toBe(0);
});

it('supports category families and payment-condition discovery without changing offer claims',async()=>{
  await pool.query(`UPDATE offers SET eligibility=jsonb_set(eligibility,'{payment}','"UPI payment only"') WHERE id='eligible-page-0'`);
  const electronics=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({category:'electronics'})));
  expect(electronics.total).toBe(10);
  const payment=await transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({scope:'payment'})));
  expect(payment.total).toBe(1);expect(payment.offers[0].slug).toBe('eligible-page-0');
  expect(payment.offers[0].conditions).toContain('UPI payment only');
  expect(JSON.stringify(payment)).not.toContain('PRIVATE_INTERNAL_MARKER');
});

