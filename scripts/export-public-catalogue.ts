import {existsSync} from 'node:fs';
import {writeFile,rename} from 'node:fs/promises';
import {loadEnvFile} from 'node:process';
import {createPool,assertPostgres17,transaction} from '../src/modules/database/client';
import {readEligibleCatalogue} from '../src/modules/database/catalogue-repository';
import {parseCatalogueQuery} from '../src/modules/catalogue/model';
import {PublicCatalogueSnapshot} from '../src/modules/catalogue/snapshot';
if(existsSync('.env.local'))loadEnvFile('.env.local');
async function main(){
 if(process.argv.length>2)throw new Error('NO_ARGUMENTS_SUPPORTED');
 const pool=createPool(process.env.DATABASE_URL);
 try{
  await assertPostgres17(pool);
  const snapshot=await transaction(pool,async client=>{
   await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY');
   const first=await readEligibleCatalogue(client,parseCatalogueQuery({}),undefined,false);
   if(first.total>5000)throw new Error('SNAPSHOT_TOO_LARGE');
   const offers=[...first.offers];
   for(let page=2;page<=first.pages;page++)offers.push(...(await readEligibleCatalogue(client,parseCatalogueQuery({page:String(page)}),undefined,false)).offers);
   return PublicCatalogueSnapshot.parse({version:1,capturedAt:new Date().toISOString(),offers});
  });
  const path='src/content/public-offers.json';
  await writeFile(path+'.tmp',JSON.stringify(snapshot,null,2)+'\n',{encoding:'utf8'});
  await rename(path+'.tmp',path);
  console.log(JSON.stringify({exported:snapshot.offers.length,capturedAt:snapshot.capturedAt,file:path}));
 }finally{await pool.end();}
}
main().catch(()=>{console.error('Public catalogue export failed; existing snapshot unchanged. Check database configuration and approval policy.');process.exitCode=1;});
