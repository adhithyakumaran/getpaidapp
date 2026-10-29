import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import { assertPostgres17, transaction } from '../../src/modules/database/client';
import { Repository } from '../../src/modules/database/repository';
import { CollectionError, CollectionResult, errorCode, type CollectionContext, type SourceAdapter } from '../../src/modules/sources/contracts';
import type { SourceRegistration } from '../../src/modules/sources/registry';

export async function runCollection(pool:Pool, registration:SourceRegistration, adapter:SourceAdapter, signal:AbortSignal) {
  await assertPostgres17(pool);
  if(registration.fixture) {
    const actual=await pool.query('SELECT current_database() AS db,current_user AS role');
    if(actual.rows[0].db!=='coupon_integration' || actual.rows[0].role!=='coupon_test')
      throw new CollectionError('FIXTURE_DATABASE_DENIED');
  }
  if(adapter.sourceId!==registration.source.id) throw new CollectionError('SOURCE_ID_MISMATCH');
  const runId=randomUUID();
  await transaction(pool,async client=> {
    const repo=new Repository(client);
    await repo.ensureCollectionSource(registration.source);
    await repo.createRun(runId,registration.source.id,new Date().toISOString());
  });
  let result:CollectionResult;
  try {
    if(!registration.fixture) {
      const approved=await transaction(pool,client=>new Repository(client).sourceApproved(registration.source.id));
      if(registration.blocker || !registration.source.enabled || registration.source.permission!=='APPROVED' || !approved)
        throw new CollectionError('SOURCE_NOT_APPROVED');
    }
    if(signal.aborted) throw new CollectionError('CANCELLED');
    const context:CollectionContext={runId,signal,now:()=>new Date()};
    result=CollectionResult.parse(await adapter.collect(context));
    if(result.listings.some(listing=>listing.sourceId!==registration.source.id)) throw new CollectionError('SOURCE_ID_MISMATCH');
  } catch(error) {
    result={listings:[],errors:[{code:errorCode(error),location:'collection'}],completeness:'PARTIAL',snapshotAuthoritative:false,
      statistics:{requests:0,discovered:0,rejected:0}};
  }
  // A cancellation after the final HTTP response still cannot report success.
  if(signal.aborted && !result.errors.some(error=>error.code==='CANCELLED')) {
    result={...result,completeness:'PARTIAL',errors:[...result.errors,{code:'CANCELLED',location:'collection'}]};
  }
  const status=result.errors.length===0 && result.completeness==='COMPLETE' ? 'SUCCESS' : result.listings.length ? 'PARTIAL_SUCCESS':'FAILED';
  try {
    await transaction(pool,async client=> {
      const repo=new Repository(client);
      for(const listing of result.listings) {
        const listingId=await repo.recordCollectedListing(randomUUID(),listing.sourceId,listing.sourceListingKey,listing.originalUrl,listing.observedAt);
        await repo.appendObservation({id:randomUUID(),sourceId:listing.sourceId,runId,listingId,offerId:null,
          observedAt:listing.observedAt,originalUrl:listing.originalUrl,rawEvidence:listing.rawEvidence,
          normalized:listing.terms,normalizationVersion:listing.normalizationVersion,rawDateText:listing.rawDateText,
          interpretedTimezone:listing.interpretedTimezone,sourceReportedVerification:listing.sourceReportedVerification,
          fieldProvenance:{sourceId:listing.sourceId,rawEvidenceRef:listing.rawEvidenceRef,synthetic:registration.fixture}});
      }
      await repo.finishCollectionRun(runId,{status,discovered:result.statistics.discovered,extracted:result.listings.length,
        rejected:result.statistics.rejected,completeness:result.completeness,errors:result.errors});
    });
  } catch {
    await transaction(pool,client=>new Repository(client).finishCollectionRun(runId,{status:'FAILED',discovered:result.statistics.discovered,
      extracted:0,rejected:result.statistics.rejected,completeness:'PARTIAL',errors:[{code:'PERSISTENCE_FAILED',location:'transaction'}]}));
    throw new CollectionError('PERSISTENCE_FAILED');
  }
  return {runId,sourceId:registration.source.id,mode:registration.fixture?'FIXTURE':'LIVE',status,
    completeness:result.completeness,records:result.listings.length,requests:result.statistics.requests,errors:result.errors,
    exitCode:status==='SUCCESS'?0:1};
}
