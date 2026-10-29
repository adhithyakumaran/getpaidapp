import {beforeAll,afterAll,expect,it} from 'vitest';
import type {Pool} from 'pg';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {testPool} from './safety';
import {migrate} from '@/src/modules/database/migrate';
import {transaction} from '@/src/modules/database/client';
import {Repository} from '@/src/modules/database/repository';
import {parseCatalogueQuery} from '@/src/modules/catalogue/model';
import {importBatch} from '@/src/modules/imports/service';
import {offerId} from '@/src/modules/imports/schema';
import fixture from '../fixtures/supplied-batch.json';
let pool:Pool;
const approval={actor:'Integration test operator',reason:'Disposable database policy test only',rightsBasis:'Synthetic integration simulation; no actual live promotion',approvedAt:'2026-10-29T08:00:00Z'};
const batch=(id:string,approved=false)=>({...fixture,batchId:id,synthetic:false,approval:approved?approval:null,coupons:[{...fixture.coupons[0],approved}]});
const catalogue=()=>transaction(pool,client=>new Repository(client).catalogue(parseCatalogueQuery({}),undefined,false));
beforeAll(async()=>{pool=await testPool();await pool.query('DROP SCHEMA public CASCADE');await pool.query('CREATE SCHEMA public');await migrate(pool);});
afterAll(async()=>{if(pool){await pool.query("UPDATE offers SET publication_state='DRAFT' WHERE id LIKE 'supplied-%'");await pool.end();}});
it('dry runs without writes, imports drafts atomically and replays safely',async()=>{
  const input=batch('draft');expect((await importBatch(pool,input,{apply:false,publish:false})).created).toBe(1);
  expect((await pool.query('SELECT * FROM offers')).rowCount).toBe(0);
  await importBatch(pool,input,{apply:true,publish:false});expect((await catalogue()).total).toBe(0);
  expect((await importBatch(pool,input,{apply:true,publish:false})).replayed).toBe(true);
  expect((await pool.query('SELECT * FROM supplied_batches')).rowCount).toBe(1);
  expect((await pool.query('SELECT * FROM offers')).rows[0].valid_until).toBeNull();
  await expect(importBatch(pool,{...input,supplierName:'Changed supplier'}, {apply:true,publish:false})).rejects.toThrow('BATCH_REPLAY_CONFLICT');
});
it('publishes approved supplied data through the existing listing/detail repository without an approved collector',async()=>{
  const input=batch('approve',true);await importBatch(pool,input,{apply:true,publish:true});
  const page=await catalogue();expect(page.total).toBe(1);expect(page.offers[0].origin).toBe('supplied');
  expect(page.offers[0].terms.minSpendPaise).toBeNull();expect(JSON.stringify(page)).not.toContain('rightsBasis');expect(JSON.stringify(page)).not.toContain('Hand-authored');
  const detail=await transaction(pool,c=>new Repository(c).catalogue(parseCatalogueQuery({}),offerId(input.supplierId,input.coupons[0].externalId),false));
  expect(detail.offers).toHaveLength(1);expect((await pool.query('SELECT * FROM sources')).rowCount).toBe(0);
  expect((await pool.query('SELECT * FROM offer_audit')).rowCount).toBe(2);
  await expect(importBatch(pool,fixture,{apply:true,publish:true})).rejects.toThrow('PUBLICATION_APPROVAL_REQUIRED');
});
it('rejects changed identities and possible duplicates without merging or partial writes',async()=>{
  const input=batch('changed');input.coupons[0].terms.title='Changed immutable input';
  await expect(importBatch(pool,input,{apply:true,publish:false})).rejects.toThrow('EXISTING_IDENTITY_CHANGED');
  const duplicate=batch('duplicate');duplicate.coupons[0].externalId='different-id';
  await expect(importBatch(pool,duplicate,{apply:true,publish:false})).rejects.toThrow('DUPLICATE_REVIEW_REQUIRED');
  const partial=batch('partial');partial.coupons=[{...partial.coupons[0],externalId:'new-item',originalUrl:'https://www.amazon.in/dp/B000FAKE02',terms:{...partial.coupons[0].terms,code:'NEWITEM'}},duplicate.coupons[0]];
  await expect(importBatch(pool,partial,{apply:true,publish:false})).rejects.toThrow('DUPLICATE_REVIEW_REQUIRED');
  expect((await pool.query('SELECT * FROM offers')).rowCount).toBe(1);expect((await pool.query('SELECT * FROM supplied_batches')).rowCount).toBe(2);
});
it('serializes concurrent identical imports and preserves provenance without duplication',async()=>{
  const input=batch('concurrent');input.coupons[0]={...input.coupons[0],externalId:'concurrent',originalUrl:'https://www.amazon.in/dp/B000FAKE03',terms:{...input.coupons[0].terms,code:'CONCURRENT'}};
  const results=await Promise.all([importBatch(pool,input,{apply:true,publish:false}),importBatch(pool,input,{apply:true,publish:false})]);
  expect(results.filter(r=>r.replayed)).toHaveLength(1);
  const rows=await pool.query('SELECT input FROM supplied_batch_items WHERE offer_id=$1',[offerId(input.supplierId,'concurrent')]);expect(rows.rowCount).toBe(1);expect(rows.rows[0].input.evidenceReference).toContain('Hand-authored');
});
it('enforces synthetic publication constraints and never publishes expired data',async()=>{
  const expired=batch('expired',true);expired.coupons[0]={...expired.coupons[0],externalId:'expired',originalUrl:'https://www.amazon.in/dp/B000FAKE04',terms:{...expired.coupons[0].terms,code:'EXPIRED',validUntil:'2020-01-01T00:00:00Z'}} as typeof expired.coupons[0];
  await expect(importBatch(pool,expired,{apply:true,publish:true})).rejects.toThrow('EXPIRED_RECORD_NOT_PUBLISHABLE');
  await expect(pool.query("UPDATE supplied_offers SET synthetic=true WHERE public_approved")).rejects.toThrow();
  expect((await catalogue()).total).toBe(1);
});
it('runs the real import CLI as a dry run, apply and replay without exposing provenance',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'supplied-cli-'));const file=join(directory,'batch.json');
  const input={...fixture,supplierId:'cli-policy-test',batchId:'cli-policy-test',coupons:[{...fixture.coupons[0],externalId:'cli-example',originalUrl:'https://www.amazon.in/dp/B000FAKE05',terms:{...fixture.coupons[0].terms,code:'CLIPOLICY'}}]};
  await writeFile(file,JSON.stringify(input));const exec=promisify(execFile);
  const args=['node_modules/tsx/dist/cli.mjs','scripts/import-coupons.ts','--file',file,'--test'];
  try {
    const dry=await exec(process.execPath,args,{env:process.env,timeout:15000});expect(JSON.parse(dry.stdout).mode).toBe('DRY_RUN');
    await exec(process.execPath,[...args,'--apply'],{env:process.env,timeout:15000});
    const replay=await exec(process.execPath,[...args,'--apply'],{env:process.env,timeout:15000});expect(JSON.parse(replay.stdout).replayed).toBe(true);expect(replay.stdout).not.toContain('Hand-authored');
    await expect(exec(process.execPath,[...args,'--publish'],{env:process.env,timeout:15000})).rejects.toMatchObject({code:1});
  } finally {await unlink(file);await rmdir(directory);}
},60000);
it('keeps same-code campaigns at different merchants distinct and supports store filtering',async()=>{
  const make=(retailerId:string,source:string)=>({externalId:retailerId,category:'fashion',originalUrl:source,evidenceReference:'PRIVATE_BRAND_EVIDENCE',approved:true,
    terms:{retailerId,title:'Brand policy test '+retailerId,kind:'CODE',code:'SHAREDCODE'}});
  const input={...fixture,batchId:'brands',supplierId:'brand-policy',synthetic:false,approval,coupons:[make('myntra','https://www.grabon.in/myntra-coupons/'),make('ajio','https://zoutons.com/ajio-coupons')]};
  await importBatch(pool,input,{apply:true,publish:true});
  for(const store of ['myntra','ajio']) {
    const result=await transaction(pool,c=>new Repository(c).catalogue(parseCatalogueQuery({store}),undefined,false));
    expect(result.total).toBe(1);expect(result.offers[0].terms.retailerId).toBe(store);expect(JSON.stringify(result)).not.toContain('PRIVATE_BRAND_EVIDENCE');
  }
});
it('retains ambiguous candidate rows privately without creating an offer',async()=>{
  const input={...fixture,batchId:'withheld',supplierId:'brand-policy',synthetic:false,approval:null,
    coupons:[{...fixture.coupons[0],externalId:'brand-draft',originalUrl:'https://www.amazon.in/dp/B000FAKE09',terms:{...fixture.coupons[0].terms,code:'BRANDDRAFT'}}],
    withheldCandidates:[{externalId:'ambiguous-row',reason:'MERCHANT_NOT_IDENTIFIED',raw:{store:'Food delivery listing',code:'PRIVATE_UNATTRIBUTED'}}]};
  await importBatch(pool,input,{apply:true,publish:false});
  expect((await pool.query("SELECT * FROM supplied_candidates WHERE external_id='ambiguous-row'")).rowCount).toBe(1);
  const publicData=await catalogue();expect(JSON.stringify(publicData)).not.toContain('PRIVATE_UNATTRIBUTED');
});
