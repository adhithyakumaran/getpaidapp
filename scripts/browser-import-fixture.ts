// Test-only browser harness. Never uses the application DATABASE_URL for writes.
import {existsSync} from 'node:fs';
import {loadEnvFile} from 'node:process';
import {createTestPool} from '../src/modules/database/test-database';
import {importBatch} from '../src/modules/imports/service';
import {offerId} from '../src/modules/imports/schema';
if(existsSync('.env.local'))loadEnvFile('.env.local');
async function main() {
  const [mode,run]=process.argv.slice(2);
  if(!['seed','cleanup'].includes(mode) || !/^[a-f0-9]{12}$/.test(run??''))throw new Error('Invalid test harness invocation');
  const supplier='browser-test-'+run;const pool=await createTestPool();
  const ids=['published','draft','synthetic'].map(id=>offerId(supplier,id));
  try {
    if(mode==='cleanup') {await pool.query("UPDATE offers SET publication_state='DRAFT' WHERE id=ANY($1::text[])",[ids]);return;}
    const now=new Date().toISOString();const code='TEST'+run.toUpperCase();
    const title='Browser policy test: supplied coupon';
    const make=(id:string,index:number,approved:boolean)=>({externalId:id,category:'audio',approved,
      originalUrl:'https://www.amazon.in/dp/B'+run.slice(0,8).toUpperCase()+index,
      evidenceReference:'PRIVATE_BROWSER_TEST_EVIDENCE',
      terms:{retailerId:'amazon-india',title:id==='published'?title:'Browser test hidden '+id,kind:'CODE',code:code+index}});
    const batch={version:1,batchId:'published-'+run,supplierId:supplier,supplierName:'Synthetic browser policy test in disposable database',
      suppliedAt:now,synthetic:false,approval:{actor:'Browser test',reason:'Disposable integration simulation',rightsBasis:'PRIVATE_BROWSER_TEST_RIGHTS',approvedAt:now},
      coupons:[make('published',1,true),make('draft',2,false)]};
    await importBatch(pool,batch,{apply:true,publish:true});
    const replay=await importBatch(pool,batch,{apply:true,publish:true});if(!replay.replayed)throw new Error('Replay failed');
    await importBatch(pool,{...batch,batchId:'synthetic-'+run,synthetic:true,approval:null,coupons:[make('synthetic',3,false)]},{apply:true,publish:false});
    console.log(JSON.stringify({publishedSlug:ids[0],draftSlug:ids[1],syntheticSlug:ids[2],code:code+'1',title}));
  } finally {await pool.end();}
}
main().catch(error=>{console.error('Test-only import harness failed; credentials omitted.');const code=error?.code;if(typeof code==='string' && /^[A-Z0-9_]{2,80}$/.test(code))console.error(code);if(error?.issues)console.error(JSON.stringify(error.issues.map((i:{path:unknown;code:string})=>({path:i.path,code:i.code}))));process.exitCode=1;});
