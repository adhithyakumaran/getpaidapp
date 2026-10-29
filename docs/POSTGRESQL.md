# PostgreSQL throughout the production delivery

Use PostgreSQL 17 from the first persistence task. Development, integration
tests, CI, staging and production use the same engine and ordered migrations.
The numbered tasks are engineering checkpoints toward one production product.
There is no temporary database engine or later conversion project.

## Development setup

`compose.yaml` supplies a development-only PostgreSQL service with persistent
storage and a loopback-bound port. Docker must be available. Start from the
repository root:

```sh
cp .env.example .env.local
# Securely set POSTGRES_PASSWORD and DATABASE_URL in the ignored .env.local.
# DATABASE_URL format:
# postgresql://<user>:<URL-encoded-password>@localhost:5432/coupon_development
docker compose --env-file .env.local up -d --wait db
docker compose --env-file .env.local exec -T db \
  sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -c "SELECT current_database(), version();"'
```

Do not print connection strings or passwords in logs. `.env.local` is ignored.
Compose interpolation uses `--env-file`; it does not automatically discover
Next.js's .env.local. Existing initialized volumes retain their original database
password: changing the file does not rotate that password. Use an explicit
database rotation procedure; do not delete a populated volume to fix credentials.

Next.js reads .env.local. The standalone worker and migration/test commands must
explicitly load their configuration or receive environment variables from the
runner. Phase 1 must document this, validate required variables and fail clearly
when DATABASE_URL is absent. Do not assume Node automatically loads Next.js env.

## Phase 1 implementation choices

Use a pinned PostgreSQL driver such as `pg` with a compatible migration library,
or one PostgreSQL ORM with versioned migrations. Choose one approach, explain it,
and implement it consistently. No need to add multiple database abstraction tools.

- `TIMESTAMPTZ` for instants, UTC serialized at application boundaries.
- `JSONB` for structured eligibility and evidence.
- Integer paise (`BIGINT`) for money; define explicit conversion at the driver
  boundary. PostgreSQL bigint may arrive as a string. Check safe numeric range
  rather than converting it blindly to a JavaScript number.
- Foreign keys, uniqueness and check constraints for integrity.
- Bounded pools per process, connection acquisition/statement/lock timeouts and
  transactions that use one checked-out client with release in `finally`.
- Database-backed ownership for collectors; lock/lease semantics must survive
  multiple worker processes. Do not use a process-local boolean as a lock.

`schema-example.sql` now uses PostgreSQL syntax. It is illustrative and incomplete;
the implementation must add full domain tables, ownership, audit history and a
migration ledger. `CREATE TABLE IF NOT EXISTS` alone cannot evolve existing schemas.

Add `db:migrate`, `test`, `test:integration` and `typecheck` commands in Phase 1.
Test both an empty database migration and a no-op repeat of the migration runner.
Concurrent application processes must not run migrations independently on startup.

## Real PostgreSQL integration tests and CI

Use a dedicated disposable test database or isolated test container, never the
development catalogue, staging or production. Configure TEST_DATABASE_URL
separately. Test setup must refuse destructive reset unless the destination
matches an explicit test-only allowlist and uses a restricted test credential.
Do not infer safety from a database name containing the word test alone.

CI must start PostgreSQL 17, wait for readiness, apply the real migrations and run
integration tests against it. Fixture tests must prove transactions, constraints,
deduplication, observation replay and worker concurrency. An in-memory substitute
does not validate the PostgreSQL workflow. Parallel tests need isolated schemas
or databases and bounded connection counts.

## Staging and production

Use separate databases, credentials and secret bindings for every environment.
The committed Compose file is a development convenience, not a production manifest.
For production choose a managed PostgreSQL provider or an explicitly operated
PostgreSQL service with monitoring, durable storage and recovery procedures.

- Private connectivity or restricted ingress; no public unrestricted database port.
- TLS with certificate verification as required by the provider; never disable it.
- Separate least-privilege application role and migration/administrative role.
  The development container's bootstrap role is not the production application role.
- Connection pooling compatible with the chosen host; account for every web and
  worker process in the total database connection budget.
- Controlled deployment migration step; use backward-compatible schema changes
  and rehearsed recovery rather than an automatic destructive down migration.
- Automated backups, retention, point-in-time recovery where supported, and a
  demonstrated restore into an isolated environment before launch.
- Alerts for capacity, connection exhaustion, failed migrations and backup failures.

Production readiness requires the complete pipeline, admin authorization,
publication policy and scheduled worker checks in AGENT-STEPS.md. Database choice
alone does not establish that the system is deployed or production ready.

## Current validation status

The Docker daemon is available. Compose configuration validation passed using
a temporary non-secret interpolation value; no database was started. To validate
your actual local configuration, run
`docker compose --env-file .env.local config --quiet` after securely supplying
the required password. No database password has been requested in chat or saved
in tracked files. PostgreSQL has not been provisioned, the SQL example has not
been executed against PostgreSQL, and application persistence remains Phase 1 work.
