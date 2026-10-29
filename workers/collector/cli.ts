import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createPool } from '../../src/modules/database/client';
import { createTestPool } from '../../src/modules/database/test-database';
import type { CollectionContext } from '../../src/modules/sources/contracts';
import { Requester } from '../../src/modules/sources/http';
import { fixtureRegistration, registry } from '../../src/modules/sources/registry';
import { fixtureTransport } from './fixtures';
import { runCollection } from './run';

if(existsSync('.env.local')) loadEnvFile('.env.local');
export function parseArguments(args:string[]) {
  let source:string|undefined; let fixture=false;
  for(let i=0;i<args.length;i++) {
    if(args[i]==='--source' && source===undefined && args[i+1] && !args[i+1].startsWith('--')) source=args[++i];
    else if(args[i]==='--fixture' && !fixture) fixture=true;
    else throw new Error('Usage: npm run collect -- --source <id> [--fixture]');
  }
  if(!source || !registry.has(source)) throw new Error('Choose a registered source; see docs/SOURCES.md');
  return {source,fixture};
}
async function main() {
  const args=parseArguments(process.argv.slice(2));
  const registration=args.fixture?fixtureRegistration(args.source):registry.get(args.source)!;
  const pool=args.fixture?await createTestPool():createPool(process.env.DATABASE_URL);
  const controller=new AbortController();
  const cancel=()=>controller.abort();
  process.once('SIGINT',cancel); process.once('SIGTERM',cancel);
  try {
    const basePolicy={...registration.requestPolicy,requestBudget:Math.min(registration.requestPolicy.requestBudget,registration.source.requestBudget),
      timeoutMs:Math.min(registration.requestPolicy.timeoutMs,registration.source.timeoutMs)};
    const policy=args.fixture?{...basePolicy,minIntervalMs:0}:basePolicy;
    const requester=new Requester(policy,controller.signal,args.fixture?fixtureTransport:undefined);
    // Real ASINs and credentials are used only after the reviewed live gate passes.
    const asins=args.fixture?['B000FAKE01']:process.env.AMAZON_ELECTRONICS_ASINS?.split(',').map(s=>s.trim());
    // With no approval, defer credential/scope validation until after recording the failed run.
    const adapter={sourceId:registration.source.id,collect: async (context: CollectionContext) => {
      if(!args.fixture && !process.env.AMAZON_SP_API_ACCESS_TOKEN) throw new Error('Missing SP-API token');
      return registration.createAdapter({requester,asins,accessToken:args.fixture?undefined:process.env.AMAZON_SP_API_ACCESS_TOKEN}).collect(context);
    }};
    const summary=await runCollection(pool,registration,adapter,controller.signal);
    console.log(JSON.stringify(summary));
    if(summary.errors.some(error=>error.code==='SOURCE_NOT_APPROVED')) console.error(registration.blocker);
    process.exitCode=summary.exitCode;
  } finally {
    process.removeListener('SIGINT',cancel); process.removeListener('SIGTERM',cancel);
    await pool.end();
  }
}
main().catch(()=> {
  console.error('Collector failed: check source/configuration, PostgreSQL connectivity and applied migrations. Credentials omitted.');
  process.exitCode=1;
});
