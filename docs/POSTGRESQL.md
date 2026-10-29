# PostgreSQL throughout the production delivery

Use PostgreSQL 17 from the first persistence task. Development, integration
tests, CI, staging and production use the same engine and ordered migrations.
The numbered tasks are engineering checkpoints toward one production product.

Hosted staging/production will use **Neon PostgreSQL 17**. The current database
is local; no hosted connection or data migration was made. See [NEON.md](NEON.md)
for separate roles/databases, verified TLS and missing provisioning requirements.
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

## Implemented Phase 1 workflow

The driver is pinned `pg`; schemas use pinned Zod 4, tests pinned Vitest 4, and
the migration CLI runs with pinned tsx. There is one SQL migration history under
`src/modules/database/migrations/`. The runner holds a PostgreSQL advisory
transaction lock, verifies engine major 17 and the applied filename/checksum
prefix, and commits DDL with its ledger entries atomically. Edited or removed
applied migrations fail. Add a new ordered `NNNN_description.sql` migration;
never edit one after it has been applied. No down/reset command is shipped for
application databases. The runner never runs implicitly during web startup.

Generate two independent random passwords securely, copy `.env.example` to
`.env.local`, and fill both connection URLs. Do not use the same password for
development and tests. Example endpoint shapes (passwords must be URL encoded):

- Development: `postgresql://coupon_dev:<password>@localhost:5432/coupon_development`
- Test: `postgresql://coupon_test:<different-password>@localhost:55433/coupon_integration`

```sh
docker compose --env-file .env.local --profile test up -d --wait db test-db
npm run db:migrate
npm run db:migrate
npm test
npm run test:integration
npm run typecheck
npm run lint
npm run build
```

`db` uses a persistent named volume; `test-db` has a separate ephemeral tmpfs.
The test bootstrap creates `coupon_test` with NOSUPERUSER, NOCREATEDB and
NOCREATEROLE, owning only `coupon_integration`. Its bootstrap password is test-only.
Test setup permits only the exact localhost/127.0.0.1, 55433 (local Compose) or
5432 (CI native service), coupon_integration, coupon_test destination tuple.
It also queries the real connected database/user and rejects privileged roles
before dropping the disposable public schema. The application database must
have a different name. This is deliberately stricter than a name containing test.
The tests reset that schema; never place persistent data in the test service.
Stop with `docker compose --env-file .env.local --profile test stop`; remove the
test container to reinitialize its ephemeral data. Do not delete the dev volume.
If 55433 is busy, free it or deliberately update both the safety allowlist and
configuration; merely changing an environment variable does not expand the allowlist.

Standalone commands explicitly load `.env.local` using Node 24's loadEnvFile;
already supplied environment bindings take precedence. They do not import Next.js.
Migrations prefer MIGRATION_DATABASE_URL and fall back to DATABASE_URL for local
bootstrap. Application pools use DATABASE_URL. Test pools use only TEST_DATABASE_URL.
URLs and credentials are omitted from CLI failure output; use secure operator
PostgreSQL diagnostics for detail. Pool size is five, acquisition 5 seconds,
idle 10 seconds, statement 15 seconds, lock 5 seconds; sessions use UTC.
Remote URLs require sslmode=verify-full and a trusted CA (provider SSL root
configuration as needed); never pass a setting that disables certificate checks.

Repositories accept a checked-out transaction client. SQL is parameterized.
Money BIGINT values cross the read boundary through a safe-range converter;
unknown values remain null and instants serialize to UTC ISO strings.
Keep fetches outside transactions. The lease primitive increments durable tokens
on takeover; assertLease locks the ownership row before writes. The future worker
must call it within each short write transaction. This phase tests those primitives;
it does not implement the reconciliation or heartbeat/scheduler workflow.

Identity, evidence and publication are separate: stores/categories, offers,
source listings, raw/normalized observations, source permissions, run counts/errors,
verification history, source leases, duplicate reviews, audit records and an outbox.
Historical observations retain their offer ID after a listing is relinked.
There is no unique constraint on codes or titles and no automatic commercial
matching. Source claims cannot become independent verification through that method.
Publication policy, duplicate resolution, audit-writing services and outbox delivery
are later steps. Fixture offers remain DRAFT and no live sources are seeded.

## Environment and deployment contract

CI generates new independent credentials for each job and starts the same
PostgreSQL 17 Compose services. `.github/workflows/ci.yml` installs the lockfile,
runs the migration twice, real integration tests, TypeScript, lint and build.
Hosted CI execution is separate from local verification.

Staging and production must each provision their own database, migration role,
application role and secret bindings. Suggested identities:

| Environment | Database | Migration role | Application role |
| --- | --- | --- | --- |
| staging | coupon_staging | coupon_staging_migrator | coupon_staging_app |
| production | coupon_production | coupon_production_migrator | coupon_production_app |

Never reuse local or CI passwords. Bind MIGRATION_DATABASE_URL only to the
controlled deployment migration job, DATABASE_URL to the application/worker,
and no TEST_DATABASE_URL on either host. Both run the same checked-in migrations
against PostgreSQL 17. A migration credential owns its database/schema; an app
credential has CONNECT, schema USAGE, and required table SELECT/INSERT/UPDATE
privileges without schema CREATE, role management or superuser privileges.
Grant default privileges as the migrator so future migration tables remain
accessible; exclude the migration ledger from application writes. Grant DELETE
only if a later audited retention implementation requires it. Configure and
verify these grants on the chosen host before launch.

No staging or production host/secret store has been supplied. No remote database,
credential or deployment was fabricated or provisioned in this engineering step.
The existing backup, restore, pooling and monitoring requirements above remain
launch prerequisites. See PROGRESS.md for commands actually executed locally.

## Phase 2 collector commands

`npm run db:migrate -- --test` uses the same non-destructive migration runner,
with the exact disposable database/role allowlist shared by integration tests
and fixture collection. It does not reset the schema. Tests remain the only
commands that reset their dedicated disposable schema.

`npm run collect -- --source amazon-in-promotions --fixture` never uses
DATABASE_URL and never calls the network. It writes labelled synthetic source
listings, observations and run records to TEST_DATABASE_URL. The corresponding
live command uses DATABASE_URL but currently records SOURCE_NOT_APPROVED before
any HTTP request. See SOURCES.md for the external access and reuse blockers.
Phase 2 requires no new SQL migration: it reuses the Phase 1 ledger and tables.
