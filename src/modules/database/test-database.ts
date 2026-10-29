import type { Pool } from 'pg';
import { createPool, assertPostgres17 } from './client';

// Exact endpoint + database + role allowlist; no production-capable reset credential.
export async function createTestPool(): Promise<Pool> {
  const raw = process.env.TEST_DATABASE_URL;
  if (!raw) throw new Error('TEST_DATABASE_URL is required; integration tests are never skipped');
  const url = new URL(raw);
  if (!['localhost','127.0.0.1'].includes(url.hostname) ||
      !['55433','5432'].includes(url.port || '5432') || url.pathname !== '/coupon_integration' ||
      decodeURIComponent(url.username) !== 'coupon_test')
    throw new Error('Test destination is outside the explicit disposable allowlist');
  if (process.env.DATABASE_URL && new URL(process.env.DATABASE_URL).pathname === url.pathname)
    throw new Error('Test and application databases must differ');
  const pool = createPool(raw);
  try {
    await assertPostgres17(pool);
    const result = await pool.query(`SELECT current_database() AS db, current_user AS role,
      rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls FROM pg_roles WHERE rolname=current_user`);
    const r = result.rows[0];
    if (r.db !== 'coupon_integration' || r.role !== 'coupon_test' || r.rolsuper || r.rolcreatedb || r.rolcreaterole || r.rolreplication || r.rolbypassrls)
      throw new Error('Unsafe integration database role');
    return pool;
  } catch (e) { await pool.end(); throw e; }
}
