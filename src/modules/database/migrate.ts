import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";
import { assertPostgres17, transaction } from "./client";

export const migrationDirectory = fileURLToPath(new URL("./migrations/", import.meta.url));

export async function migrate(pool: Pool, directory = migrationDirectory): Promise<number> {
  return transaction(pool, async (client) => {
    await assertPostgres17(client);
    await client.query("SELECT pg_advisory_xact_lock(71302501)");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
    const names = (await readdir(directory)).filter(n => /^\d{4}_[a-z0-9_]+\.sql$/.test(n)).sort();
    if (!names.length) throw new Error("No migration files found");
    const applied = await client.query<{ name: string; checksum: string }>("SELECT name, checksum FROM schema_migrations ORDER BY name");
    if (applied.rows.some((row, i) => row.name !== names[i])) throw new Error("Migration history diverged");
    let count = 0;
    for (const name of names) {
      const sql = await readFile(`${directory}/${name}`, "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const previous = applied.rows.find(row => row.name === name);
      if (previous) {
        if (previous.checksum !== checksum) throw new Error(`Migration checksum mismatch: ${name}`);
        continue;
      }
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations(name, checksum) VALUES ($1,$2)", [name, checksum]);
      count++;
    }
    return count;
  });
}
