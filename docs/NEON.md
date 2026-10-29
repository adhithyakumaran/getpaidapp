# Hosted PostgreSQL provisioning

## Current connection (2026-10-29)

The owner supplied DATABASE_URL securely in ignored `.env.local`. The first
endpoint was PostgreSQL 18; it was only inspected and left unchanged. The owner
then supplied a separate PostgreSQL 17 endpoint. Verified the real application
TLS socket (encrypted and certificate authorized), PostgreSQL major 17 and UTC.
Applied 0001_foundation, 0002_supplied_imports and 0003_multibrand_candidates.
Replay applied zero pending migrations. The endpoint is direct, with verified TLS.
No database was reset or deleted. No credentials are recorded here.

MIGRATION_DATABASE_URL remains unset, so the supplied credential was used for
the explicitly authorized migration. Separate least-privilege application and
migration roles, and separate staging/production bindings, remain deployment
prerequisites. No website host or hosting secret store has been configured.

## Earlier inspection and provisioning policy

Configuration inspection on 2026-10-29 found **local** PostgreSQL endpoints for
DATABASE_URL and TEST_DATABASE_URL; MIGRATION_DATABASE_URL is unset. No credentials
were printed. No hosted provider is connected, and no existing data was migrated
or deleted.

Use Neon PostgreSQL **17** for hosted staging and production. Retain `pg`, domain
schemas, repositories and the checked-in migration history. The official
[Node guide](https://neon.com/docs/guides/node) supports the existing `pg` client.

Provision independent staging and production projects/databases, application
roles and migration roles, with the identities and least-privilege grants in
[POSTGRESQL.md](POSTGRESQL.md). Never reuse local or CI credentials. Bind
DATABASE_URL to the appropriate application secret store and
MIGRATION_DATABASE_URL only to its migration job. Never bind TEST_DATABASE_URL
to a hosted application. CI tests retain their disposable PostgreSQL 17 service.

Start with direct Neon connections and the bounded `pg` pool, using verified TLS
(`sslmode=verify-full`). Verify UTC/session settings, grants, transactions and
migration replay on staging before release. Neon's
[transaction pooling](https://neon.com/docs/connect/connection-pooling) has
different session semantics and requires a separate compatibility check before
substituting a pooled endpoint.

Pending: owner-provided Neon account/project, PostgreSQL 17 databases, restricted
roles/grants, secure secret bindings, backups/restore verification and monitoring.
No existing development data should be copied, reset or migrated during setup.
Deployment, source authorization and reconciliation/publication controls remain
separate launch prerequisites.
