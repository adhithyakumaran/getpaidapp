import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
import { createPool } from "../src/modules/database/client";
import { createTestPool } from "../src/modules/database/test-database";
import { migrate } from "../src/modules/database/migrate";

if (existsSync(".env.local")) loadEnvFile(".env.local");
async function main() {
  const args=process.argv.slice(2);
  if(args.length>1 || (args.length===1 && args[0]!=='--test')) throw new Error('Usage: db:migrate [--test]');
  const pool = args[0]==='--test' ? await createTestPool() : createPool(process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL);
  try { console.log(`Applied ${await migrate(pool)} migration(s)`); }
  finally { await pool.end(); }
}
main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  const safeMessages = ['DATABASE_URL is required', 'Invalid database configuration',
    'PostgreSQL database and credentials are required', 'PostgreSQL 17 is required',
    'Remote PostgreSQL requires sslmode=verify-full', 'Remote PostgreSQL requires certificate-verified TLS',
    'Migration history diverged', 'No migration files found'];
  console.error(safeMessages.includes(message) ? message :
    'Migration failed; check connectivity and migration history. Credentials omitted.');
  process.exitCode = 1;
});
