import { Pool, type PoolClient } from "pg";

export function validatedConnectionString(connectionString: string | undefined): string {
  if (!connectionString) throw new Error("DATABASE_URL is required");
  let url: URL;
  try { url = new URL(connectionString); } catch { throw new Error("Invalid database configuration"); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.username || !url.password || !url.pathname.slice(1))
    throw new Error("PostgreSQL database and credentials are required");
  // Neon supplies sslmode=require by default. Strengthen it instead of rejecting
  // an otherwise valid production configuration; never disable certificate checks.
  const remote=!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if(remote && url.searchParams.get('sslmode')==='require')url.searchParams.set('sslmode','verify-full');
  if (["disable", "no-verify", "prefer"].includes(url.searchParams.get("sslmode") ?? "") && remote)
    throw new Error("Remote PostgreSQL requires certificate-verified TLS");
  if (remote && url.searchParams.get("sslmode") !== "verify-full")
    throw new Error("Remote PostgreSQL requires sslmode=verify-full");
  return url.toString();
}
export function createPool(connectionString: string | undefined): Pool {
  const pool=new Pool({ connectionString:validatedConnectionString(connectionString), max: 5, connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000, statement_timeout: 15000, lock_timeout: 5000,
    options: "-c timezone=UTC" });
  pool.on('error',()=>console.error('Database connection unavailable; credentials omitted.'));
  return pool;
}

export async function transaction<T>(pool: Pool, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  const handleConnectionError=()=>{};
  client.on('error',handleConnectionError);
  let failed=false;
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    failed=true;
    try {await client.query("ROLLBACK");} catch { /* A disconnected transaction is rolled back by PostgreSQL. */ }
    throw error;
  } finally { client.release(failed?new Error('Transaction aborted'):undefined);client.removeListener('error',handleConnectionError); }
}

export async function assertPostgres17(client: Pool | PoolClient) {
  const result = await client.query("SHOW server_version_num");
  if (Math.floor(Number(result.rows[0].server_version_num) / 10000) !== 17)
    throw new Error("PostgreSQL 17 is required");
}
