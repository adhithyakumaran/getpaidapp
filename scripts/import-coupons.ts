import { existsSync } from 'node:fs';
import { readFile,stat } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';
import { ZodError } from 'zod';
import { createPool } from '../src/modules/database/client';
import { createTestPool } from '../src/modules/database/test-database';
import { ImportError,importBatch } from '../src/modules/imports/service';
import {csvBatch} from '../src/modules/imports/csv';
import {digest} from '../src/modules/imports/schema';
if(existsSync('.env.local'))loadEnvFile('.env.local');
async function main() {
  const args=process.argv.slice(2);const allowed=new Set(['--file','--apply','--publish','--test']);
  let file:string|undefined;const seen=new Set<string>();
  for(let i=0;i<args.length;i++) {
    const arg=args[i];if(!allowed.has(arg) || seen.has(arg))throw new ImportError('INVALID_ARGUMENTS');seen.add(arg);
    if(arg==='--file'){file=args[++i];if(!file || file.startsWith('--'))throw new ImportError('INVALID_ARGUMENTS');}
  }
  if(!file)throw new ImportError('FILE_REQUIRED');
  if((await stat(file)).size>2*1024*1024)throw new ImportError('BATCH_TOO_LARGE');
  const text=await readFile(file,'utf8');
  let input:unknown=file.toLowerCase().endsWith('.csv')?csvBatch(text,seen.has('--publish'),new Date().toISOString()):JSON.parse(text);
  const pool=seen.has('--test')?await createTestPool():createPool(process.env.DATABASE_URL);
  try {
    if(file.toLowerCase().endsWith('.csv')) {
      const batch=input as ReturnType<typeof csvBatch>;
      const id='batch-'+digest([batch.supplierId,batch.batchId]);
      const previous=await pool.query('SELECT payload FROM supplied_batches WHERE id=$1',[id]);
      if(previous.rowCount) input=previous.rows[0].payload;
    }
    console.log(JSON.stringify(await importBatch(pool,input,{apply:seen.has('--apply'),publish:seen.has('--publish')})));
  }
  finally {await pool.end();}
}
main().catch(error=>{
  if(error instanceof ZodError)console.error(JSON.stringify({error:'INVALID_BATCH',issues:error.issues.map(i=>({path:i.path.join('.'),code:i.code}))}));
  else console.error(JSON.stringify({error:error instanceof ImportError?error.code:'IMPORT_FAILED',detail:'No batch committed on failure. Credentials and coupon content omitted.'}));
  process.exitCode=1;
});
