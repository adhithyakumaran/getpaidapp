import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createPool,assertPostgres17,validatedConnectionString } from '../src/modules/database/client';
if(existsSync('.env.local'))loadEnvFile('.env.local');
async function main() {
  const configured=process.env.DATABASE_URL;
  if(!configured)throw new Error('DATABASE_NOT_CONFIGURED');
  const url=new URL(validatedConnectionString(configured));
  const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  const neon=url.hostname.endsWith('.neon.tech');
  console.log(JSON.stringify({provider:local?'local PostgreSQL':neon?'Neon PostgreSQL':'other hosted PostgreSQL',endpointMode:url.hostname.includes('-pooler.')?'pooled':'direct',verifiedTLS:url.searchParams.get('sslmode')==='verify-full',migrationCredential:!!process.env.MIGRATION_DATABASE_URL}));
  if(process.argv.includes('--neon') && !neon)throw new Error('NEON_DATABASE_URL_REQUIRED');
  const pool=createPool(configured);
  try {
    const version=await pool.query('SHOW server_version_num');
    console.log(JSON.stringify({postgresMajor:Math.floor(Number(version.rows[0].server_version_num)/10000)}));
    await assertPostgres17(pool);
    const probe=await pool.connect();
    try {
      const result=await probe.query("SELECT current_setting('TimeZone') AS timezone");
      // A hosting proxy may terminate TLS before the PostgreSQL backend. Inspect
      // the application's actual TLS socket, not pg_stat_ssl behind that proxy.
      const stream=(probe as unknown as {connection:{stream:{encrypted?:boolean;authorized?:boolean}}}).connection.stream;
      if(!local && (!stream.encrypted || !stream.authorized))throw new Error('TLS_VERIFICATION_FAILED');
      console.log(JSON.stringify({connected:true,postgresMajor:17,timezone:result.rows[0].timezone,tls:stream.encrypted===true,certificateVerified:stream.authorized===true}));
    } finally {probe.release();}
  } finally {await pool.end();}
}
main().catch(error=>{const code=error?.code;console.error(error instanceof Error && ['DATABASE_NOT_CONFIGURED','NEON_DATABASE_URL_REQUIRED','PostgreSQL 17 is required'].includes(error.message)?error.message:'Database verification failed; credentials omitted.');if(typeof code==='string' && /^[A-Z0-9_]{2,60}$/.test(code))console.error('Database error code: '+code);process.exitCode=1;});
