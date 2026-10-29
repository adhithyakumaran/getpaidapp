import 'server-only';
import { createPool, assertPostgres17 } from '../database/client';
import {readEligibleCatalogue} from '../database/catalogue-repository';
import {resolveSearchIntent} from './search-intent';
import {cache} from 'react';
import { PUBLIC_PUBLICATION_READY, parseCatalogueQuery, type CataloguePage, type RawQuery } from './model';
import type { Pool } from 'pg';
const shared=globalThis as typeof globalThis & {couponWebPool?:Pool;couponWebVersion?:Promise<void>};
function webPool() {
  if(!shared.couponWebPool) {
    shared.couponWebPool=createPool(process.env.DATABASE_URL);
    shared.couponWebPool.on('error',()=>console.error('Catalogue database connection unavailable.'));
  }
  return shared.couponWebPool;
}
const read=cache(async(serialized:string,slug?:string)=>{
  const pool=webPool();
  shared.couponWebVersion??=assertPostgres17(pool).catch(error=>{shared.couponWebVersion=undefined;throw error;});
  await shared.couponWebVersion;
  // One SELECT gives count and page the same database snapshot, with no network
  // round trips for BEGIN/SET/COMMIT. No cross-request data cache hides imports.
  return readEligibleCatalogue(pool,JSON.parse(serialized),slug,PUBLIC_PUBLICATION_READY);
});
export async function loadPublicCatalogue(raw:RawQuery={},slug?:string):Promise<CataloguePage> {
  let query;
  try { query=parseCatalogueQuery(raw); }
  catch {return {offers:[],total:0,page:1,pages:1,query:parseCatalogueQuery({}),preview:false,now:new Date().toISOString(),error:'Use one value per filter, a search of 120 characters or fewer, and a page between 1 and 1000.'};}
  const empty={offers:[],total:0,page:1,pages:1,query,preview:false,now:new Date().toISOString()};
  try {
    const data=await read(JSON.stringify(resolveSearchIntent(query)),slug);
    return {...empty,...data};
  } catch { return {...empty,error:'Offers could not be loaded. Please try again.'}; }
}
