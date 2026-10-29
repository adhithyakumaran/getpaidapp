# Implementation progress

## Completed: repository cleanup and handoff

- Removed legacy calculator routes, components, freelance articles and branding.
- Kept Next.js, React, TypeScript and Tailwind; installed daisyUI 5.
- Added a pre-launch coupon placeholder with global noindex and crawl restriction.
- Imported the specification, plan, SQL example and skill catalogue into docs/.
- Added phase-by-phase agent instructions and AGENTS.md working rules.

## Cleanup validation

- `npm run lint`: passed, no warnings.
- `npm run build`: passed, including TypeScript.
- Production HTTP smoke checks: homepage 200, correct coupon text and noindex;
  robots 200 with disallow-all; retired calculator, guide, about and sitemap paths 404.
- `git diff --check`: passed.
- Saved environment start instructions updated for the coupon foundation.
- No collector or domain tests exist yet; those are Phase 1 work.

## Next: Phase 1

Not implemented: domain/database modules, migrations, tests, sources, daily
worker, admin, public coupon templates, sitemap/public SEO and production hosting.

Append each phase's changed files, exact checks/results and known limitations here.

## Architecture correction: PostgreSQL from day one

The owner requires one production delivery, without v1/v2 product stages. All
engineering steps now target PostgreSQL 17 in development, tests, staging and
production. Updated the specification, plan, agent tasks and SQL example.
Database services and application integration are still Phase 1 implementation work.

Added development compose.yaml, credential-free .env.example and POSTGRESQL.md
covering local setup, isolated real-database tests, CI, staging/production roles,
TLS, pooling, migrations and recovery. Compose configuration and git diff checks
passed. PostgreSQL was not started and the SQL example was not executed on it.
