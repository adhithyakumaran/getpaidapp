import { afterAll, beforeAll, expect, it } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Pool } from 'pg';
import { testPool } from './safety';
import { migrate } from '@/src/modules/database/migrate';
import { transaction } from '@/src/modules/database/client';
import { Repository } from '@/src/modules/database/repository';
import { AmazonPromotionsAdapter, amazonPolicy, AMAZON_ENDPOINT, extractPromotion } from '@/src/modules/sources/amazon-promotions';
import { Requester } from '@/src/modules/sources/http';
import { fixtureRegistration, registry } from '@/src/modules/sources/registry';
import { runCollection } from '@/workers/collector/run';
import { fixtureTransport } from '@/workers/collector/fixtures';
import { CollectionError } from '@/src/modules/sources/contracts';
import type { SourceAdapter } from '@/src/modules/sources/contracts';
import first from '../fixtures/amazon-promotions/page-1.json';
let pool:Pool;
const registration=fixtureRegistration('amazon-in-promotions');
function adapter(signal:AbortSignal) {
  return new AmazonPromotionsAdapter(registration.source.id,new Requester({...amazonPolicy,minIntervalMs:0},signal,fixtureTransport),['B000FAKE01'],true);
}
beforeAll(async()=> {
  pool=await testPool();
  await pool.query('DROP SCHEMA public CASCADE'); await pool.query('CREATE SCHEMA public'); await migrate(pool);
});
afterAll(async()=>{if(pool) await pool.end();});
it('records fixture collection statistics and traceable unmatched observations in real PostgreSQL',async()=> {
  const signal=new AbortController().signal;
  const summary=await runCollection(pool,registration,adapter(signal),signal);
  expect(summary).toMatchObject({mode:'FIXTURE',status:'SUCCESS',records:2,requests:2,exitCode:0});
  const run=(await pool.query('SELECT * FROM collection_runs WHERE id=$1',[summary.runId])).rows[0];
  expect(run).toMatchObject({status:'SUCCESS',records_discovered:2,records_extracted:2,records_normalised:2,records_rejected:0,
    completeness:'COMPLETE',snapshot_authoritative:false,errors:[]});
  expect(run.finished_at).toBeInstanceOf(Date);
  const observation=(await pool.query('SELECT * FROM observations WHERE run_id=$1 ORDER BY normalized->>\'kind\'',[summary.runId])).rows[0];
  expect(observation.offer_id).toBeNull(); expect(observation.raw_evidence.synthetic).toBe(true);
  expect(observation.field_provenance.rawEvidenceRef).toMatch(/^sha256:/);
  expect(observation.source_reported_verification).toBeNull();
  expect((await pool.query('SELECT * FROM offers')).rowCount).toBe(0);
  expect((await pool.query('SELECT * FROM verification_records')).rowCount).toBe(0);
  expect((await pool.query('SELECT * FROM publication_outbox')).rowCount).toBe(0);
});
it('repeats a fixture run as new evidence without multiplying source listings',async()=> {
  const signal=new AbortController().signal;
  await runCollection(pool,registration,adapter(signal),signal);
  expect((await pool.query('SELECT * FROM source_listings')).rowCount).toBe(2);
  expect((await pool.query('SELECT * FROM observations')).rowCount).toBe(4);
});
it('failed extraction preserves every existing offer, campaign link and observation',async()=> {
  await transaction(pool,async client=> {
    const repo=new Repository(client);
    await client.query("INSERT INTO stores VALUES('amazon-india','Synthetic test store','amazon-india')");
    const listing=extractPromotion(first.promotions[0],registration.source.id,AMAZON_ENDPOINT,new Date().toISOString(),true);
    await repo.createOffer('existing-offer','existing-offer',listing.terms);
    await client.query("UPDATE offers SET lifecycle='ACTIVE' WHERE id='existing-offer'");
    await client.query("UPDATE source_listings SET current_offer_id='existing-offer' WHERE source_listing_key='synthetic-code-promotion'");
  });
  const broken:SourceAdapter={sourceId:registration.source.id,collect:async()=>{throw new CollectionError('SCHEMA_CHANGED');}};
  const summary=await runCollection(pool,registration,broken,new AbortController().signal);
  expect(summary).toMatchObject({status:'FAILED',exitCode:1,errors:[{code:'SCHEMA_CHANGED'}]});
  expect((await pool.query("SELECT lifecycle FROM offers WHERE id='existing-offer'")).rows[0].lifecycle).toBe('ACTIVE');
  expect((await pool.query("SELECT current_offer_id FROM source_listings WHERE source_listing_key='synthetic-code-promotion'")).rows[0].current_offer_id).toBe('existing-offer');
  expect((await pool.query('SELECT * FROM observations')).rowCount).toBe(4);
});
it('persists valid partial evidence and a non-success run without relinking commercial offers',async()=> {
  let count=0; const signal=new AbortController().signal;
  const request=new Requester({...amazonPolicy,minIntervalMs:0},signal,async()=>++count===1?
    {status:200,headers:{'content-type':'application/json'},body:JSON.stringify(first)}:{status:403,headers:{'content-type':'application/json'},body:''});
  const partial=new AmazonPromotionsAdapter(registration.source.id,request,['B000FAKE01'],true);
  const summary=await runCollection(pool,registration,partial,signal);
  expect(summary).toMatchObject({status:'PARTIAL_SUCCESS',records:1,exitCode:1,errors:[{code:'ACCESS_DENIED'}]});
  expect((await pool.query("SELECT current_offer_id FROM source_listings WHERE source_listing_key='synthetic-code-promotion'")).rows[0].current_offer_id).toBe('existing-offer');
  expect((await pool.query('SELECT * FROM observations')).rowCount).toBe(5);
});
it('records the permission blocker before invoking any live adapter',async()=> {
  let called=false;
  const live:SourceAdapter={sourceId:'amazon-in-promotions',collect:async()=>{called=true;throw new Error('must not fetch');}};
  const summary=await runCollection(pool,registry.get(live.sourceId)!,live,new AbortController().signal);
  expect(called).toBe(false);
  expect(summary).toMatchObject({status:'FAILED',requests:0,exitCode:1,errors:[{code:'SOURCE_NOT_APPROVED'}]});
  expect((await pool.query('SELECT status FROM collection_runs WHERE id=$1',[summary.runId])).rows[0].status).toBe('FAILED');
});
it('rolls back evidence writes on persistence failure while recording a failed run',async()=> {
  const listing=extractPromotion({...first.promotions[0],promotionId:'rollback-source-key'},registration.source.id,AMAZON_ENDPOINT,new Date().toISOString(),true);
  const data:SourceAdapter={sourceId:registration.source.id,collect:async()=>({listings:[listing],errors:[],completeness:'COMPLETE',snapshotAuthoritative:false,statistics:{requests:1,discovered:1,rejected:0}})};
  await pool.query("CREATE FUNCTION reject_observation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic persistence failure'; END $$");
  await pool.query('CREATE TRIGGER reject_observation BEFORE INSERT ON observations FOR EACH ROW EXECUTE FUNCTION reject_observation()');
  try {
    await expect(runCollection(pool,registration,data,new AbortController().signal)).rejects.toThrow('PERSISTENCE_FAILED');
    expect((await pool.query("SELECT * FROM source_listings WHERE source_listing_key='rollback-source-key'")).rowCount).toBe(0);
    expect((await pool.query('SELECT * FROM observations')).rowCount).toBe(5);
    const failed=await pool.query("SELECT * FROM collection_runs WHERE errors @> '[{\"code\":\"PERSISTENCE_FAILED\"}]'::jsonb");
    expect(failed.rowCount).toBe(1); expect(failed.rows[0].status).toBe('FAILED');
  } finally { await pool.query('DROP TRIGGER reject_observation ON observations'); await pool.query('DROP FUNCTION reject_observation()'); }
});
it('records cancellation as failed instead of leaving a successful or running record',async()=> {
  const controller=new AbortController(); controller.abort();
  expect(await runCollection(pool,registration,adapter(controller.signal),controller.signal)).toMatchObject({status:'FAILED',exitCode:1,errors:[{code:'CANCELLED'}]});
});
it('executes the fixture CLI and rejects a live attempt with a recorded nonzero result',async()=> {
  const exec=promisify(execFile);
  const args=['node_modules/tsx/dist/cli.mjs','workers/collector/cli.ts','--source','amazon-in-promotions'];
  const fixture=await exec(process.execPath,[...args,'--fixture'],{env:process.env,timeout:20000});
  expect(JSON.parse(fixture.stdout)).toMatchObject({mode:'FIXTURE',status:'SUCCESS',records:2});
  try {
    // The CLI live gate is tested only on the dedicated disposable PostgreSQL DB.
    await exec(process.execPath,args,{env:{...process.env,DATABASE_URL:process.env.TEST_DATABASE_URL},timeout:20000});
    throw new Error('Expected source gate failure');
  } catch(error) {
    const failure=error as {code:number;stdout:string;stderr:string};
    expect(failure.code).toBe(1);
    expect(JSON.parse(failure.stdout)).toMatchObject({status:'FAILED',requests:0,errors:[{code:'SOURCE_NOT_APPROVED'}]});
    expect(failure.stderr).toContain('seller-authorized');
    expect(failure.stdout+failure.stderr).not.toContain(new URL(process.env.TEST_DATABASE_URL!).password);
  }
});
