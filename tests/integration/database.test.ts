import { afterAll, beforeAll, expect, it } from 'vitest';
import type { Pool } from 'pg';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate, migrationDirectory } from '@/src/modules/database/migrate';
import { transaction } from '@/src/modules/database/client';
import { Repository } from '@/src/modules/database/repository';
import { testPool } from './safety';
import fixture from '../fixtures/offer.json';
let pool: Pool;
const at = '2026-10-29T00:00:00Z';
const observation = (id='obs',runId='run',offerId='offer') => ({id,runId,offerId,listingId:'listing',sourceId:'fixture-source',observedAt:at,
  originalUrl:'https://fixture.invalid/offer',rawEvidence:{synthetic:true,title:'Original fixture'},normalized:fixture,
  normalizationVersion:'fixture-1',rawDateText:null,interpretedTimezone:null,sourceReportedVerification:'verified by fixture source',fieldProvenance:{title:'fixture'}});
beforeAll(async () => {
  pool = await testPool();
  await pool.query('DROP SCHEMA public CASCADE');
  await pool.query('CREATE SCHEMA public');
});
afterAll(async () => { if(pool) await pool.end(); });

it('migrates a fresh PostgreSQL 17 database, repeats safely and serializes concurrent runners', async () => {
  expect(await migrate(pool)).toBe(3);
  expect(await migrate(pool)).toBe(0);
  expect(await Promise.all([migrate(pool),migrate(pool)])).toEqual([0,0]);
  expect((await pool.query('SELECT * FROM schema_migrations')).rowCount).toBe(3);
});
it('refuses changed migration history and rolls back a failed migration with its ledger entry', async () => {
  const dir = await mkdtemp(join(tmpdir(),'coupon-migrations-'));
  try {
    const original = await readFile(join(migrationDirectory,'0001_foundation.sql'),'utf8');
    await writeFile(join(dir,'0001_foundation.sql'),original+'\n-- tamper');
    await writeFile(join(dir,'0002_supplied_imports.sql'),await readFile(join(migrationDirectory,'0002_supplied_imports.sql'),'utf8'));
    await writeFile(join(dir,'0003_multibrand_candidates.sql'),await readFile(join(migrationDirectory,'0003_multibrand_candidates.sql'),'utf8'));
    await expect(migrate(pool,dir)).rejects.toThrow('checksum');
    await writeFile(join(dir,'0001_foundation.sql'),original);
    await writeFile(join(dir,'0004_failure.sql'),'CREATE TABLE should_rollback(id text); SELECT 1/0;');
    await expect(migrate(pool,dir)).rejects.toThrow();
    expect((await pool.query("SELECT to_regclass('should_rollback') AS t")).rows[0].t).toBeNull();
    expect((await pool.query('SELECT * FROM schema_migrations')).rowCount).toBe(3);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
it('persists synthetic fixtures, exact bigint money, nulls and safe observation/outbox replay', async () => {
  await transaction(pool,async client => {
    const repo = new Repository(client);
    await client.query("INSERT INTO stores VALUES('fixture-store','Synthetic store','fixture-store')");
    await repo.addSource({id:'fixture-source',name:'Synthetic only',enabled:false,permission:'UNREVIEWED',permissionEvidence:null,
      reviewedAt:null,accessMethod:null,allowedHosts:[],attribution:null,requestBudget:10,timeoutMs:1000});
    await repo.createRun('run','fixture-source',at);
    await repo.createOffer('offer','synthetic-offer',fixture);
    expect(await repo.upsertListing('listing','fixture-source','key','offer','https://fixture.invalid/offer',at)).toBe('listing');
    expect(await repo.upsertListing('ignored','fixture-source','key','offer','https://fixture.invalid/offer',at)).toBe('listing');
    expect(await repo.appendObservation(observation())).toBe(true);
    expect(await repo.appendObservation(observation('retry'))).toBe(false);
    await repo.enqueue('event','offer',1);
    await repo.enqueue('event-retry','offer',1);
    const offer = await repo.getOffer('offer');
    expect(offer?.discount_paise).toBe(100010);
    expect(offer?.min_spend_paise).toBeNull();
    expect(offer?.valid_until).toBeNull();
    expect(offer?.publication_state).toBe('DRAFT');
  });
  expect((await pool.query('SELECT * FROM source_listings')).rowCount).toBe(1);
  expect((await pool.query('SELECT * FROM observations')).rowCount).toBe(1);
  expect((await pool.query('SELECT * FROM publication_outbox')).rowCount).toBe(1);
});
it('records a later run of the same fixture without multiplying offers or listings', async () => {
  await transaction(pool, async client => {
    const repo = new Repository(client);
    await repo.createRun('run-daily','fixture-source','2026-10-30T00:00:00Z');
    await repo.upsertListing('ignored','fixture-source','key','offer','https://fixture.invalid/offer','2026-10-30T00:00:00Z');
    await repo.appendObservation({...observation('obs-daily','run-daily'),observedAt:'2026-10-30T00:00:00Z'});
  });
  expect((await pool.query('SELECT * FROM offers')).rowCount).toBe(1);
  expect((await pool.query('SELECT * FROM source_listings')).rowCount).toBe(1);
  expect((await pool.query('SELECT * FROM observations')).rowCount).toBe(2);
});
it('preserves prior campaign links when a listing is reused', async () => {
  await transaction(pool,async client => {
    const repo = new Repository(client);
    await repo.createOffer('offer-next','synthetic-next',fixture);
    await repo.createRun('run-next','fixture-source','2026-10-31T00:00:00Z');
    await repo.upsertListing('ignored','fixture-source','key','offer-next','https://fixture.invalid/next','2026-10-31T00:00:00Z');
    await repo.appendObservation({...observation('obs-next','run-next','offer-next'),observedAt:'2026-10-31T00:00:00Z'});
  });
  expect((await pool.query("SELECT offer_id FROM observations WHERE id='obs'")).rows[0].offer_id).toBe('offer');
  expect((await pool.query('SELECT * FROM observations')).rowCount).toBe(3);
});
it('rolls back multi-table work including outbox and releases the client', async () => {
  await expect(transaction(pool,async client => {
    const repo = new Repository(client);
    await repo.createOffer('rollback','rollback',fixture);
    await repo.enqueue('rollback-event','rollback',1);
    throw new Error('simulated failure');
  })).rejects.toThrow('simulated failure');
  expect((await pool.query("SELECT * FROM offers WHERE id='rollback'")).rowCount).toBe(0);
  expect((await pool.query("SELECT * FROM publication_outbox WHERE id='rollback-event'")).rowCount).toBe(0);
});
it.each([
  ["UPDATE offers SET min_spend_paise=-1 WHERE id='offer'",'23514'],
  ["UPDATE offers SET discount_paise=9007199254740992 WHERE id='offer'",'23514'],
  ["UPDATE offers SET kind='CODE',code=NULL WHERE id='offer'",'23514'],
  ["UPDATE offers SET retailer_id='missing' WHERE id='offer'",'23503'],
  ["UPDATE offers SET valid_from='2026-10-30',valid_until='2026-10-29' WHERE id='offer'",'23514'],
  ["UPDATE offers SET publication_state='INVENTED' WHERE id='offer'",'23514'],
  ["UPDATE offers SET public_slug='changed' WHERE id='offer'",'P0001'],
  ["UPDATE sources SET enabled=true WHERE id='fixture-source'",'23514'],
  ["INSERT INTO source_listings(id,source_id,source_listing_key,original_url,first_seen_at,last_seen_at) VALUES('duplicate','fixture-source','key','https://fixture.invalid',now(),now())",'23505'],
  ["UPDATE observations SET source_id='missing' WHERE id='obs'",'23503'],
])('enforces SQL integrity: %s', async (sql,code) => {
  await expect(pool.query(sql)).rejects.toMatchObject({code});
});
it('rejects cross-source evidence and keeps source claims distinct from independent verification', async () => {
  await transaction(pool,async client => {
    const repo = new Repository(client);
    await repo.addSource({id:'other',name:'Other fixture',enabled:false,permission:'UNREVIEWED',permissionEvidence:null,
      reviewedAt:null,accessMethod:null,allowedHosts:[],attribution:null,requestBudget:1,timeoutMs:1000});
    await repo.createRun('other-run','other',at);
    await repo.appendVerification({id:'verification',offerId:'offer',method:'SOURCE',status:'SOURCE_REPORTED',attemptedAt:at,actor:'fixture',evidence:{claim:'verified'},failureReason:null,verifierVersion:'1'});
  });
  await expect(transaction(pool,client => new Repository(client).appendObservation(observation('cross-source','other-run')))).rejects.toMatchObject({code:'23503'});
  await expect(pool.query("UPDATE verification_records SET status='CHECKOUT_VERIFIED' WHERE id='verification'")).rejects.toMatchObject({code:'23514'});
});
it('allows recurring codes in distinct commercial campaigns',async () => {
  await transaction(pool,async client => {
    const repo=new Repository(client);
    await repo.createOffer('code-a','code-a',{...fixture,kind:'CODE',code:'SYNTHETIC',eligibility:{bank:'A'}});
    await repo.createOffer('code-b','code-b',{...fixture,kind:'CODE',code:'SYNTHETIC',eligibility:{bank:'B'}});
  });
});
it('fences two workers and rejects the stale owner after simulated expiry and takeover', async () => {
  const claims = await Promise.all(['worker-a','worker-b'].map(owner => transaction(pool, async client => ({owner,token:await new Repository(client).claimLease('fixture-source',owner)}))));
  expect(claims.filter(c=>c.token!==null)).toHaveLength(1);
  const winner=claims.find(c=>c.token!==null)!;
  await transaction(pool,client=>new Repository(client).assertLease('fixture-source',winner.owner,winner.token!));
  await pool.query("UPDATE source_leases SET expires_at=clock_timestamp()-interval '1 second' WHERE source_id='fixture-source'");
  const next=await transaction(pool,client=>new Repository(client).claimLease('fixture-source','successor'));
  expect(BigInt(next!)).toBe(BigInt(winner.token!)+BigInt(1));
  await expect(transaction(pool,async client=> {
    await new Repository(client).assertLease('fixture-source',winner.owner,winner.token!);
    await client.query("UPDATE offers SET title='stale write' WHERE id='offer'");
  })).rejects.toThrow('lease lost');
  expect((await pool.query("SELECT title FROM offers WHERE id='offer'")).rows[0].title).toBe(fixture.title);
});
