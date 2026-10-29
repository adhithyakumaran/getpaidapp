# Implementation progress

## Neon connection, supplied coupon importing and brand/ticket refinement (2026-10-29)

Completed the owner's supplied-data workflow and subsequent CSV/design request.
The application is running locally at http://localhost:3000, connected to Neon
PostgreSQL 17. Regular pages show **85 owner-supplied, source-listed coupons**;
**27 ambiguous merchant rows are withheld privately**. The development-only
`/preview` remains a separate synthetic demonstration. No public website host or
deployment has been configured; noindex and crawl restrictions remain in place.

### Database and data actually applied

- Inspected only safe configuration classifications. The first supplied Neon
  endpoint was PostgreSQL 18: queried its version and left it unchanged. The owner
  then supplied a separate PostgreSQL 17 endpoint securely in ignored `.env.local`.
- Changed its TLS binding to `sslmode=verify-full`. Verified the actual client
  TLS socket is encrypted and certificate-authorized, direct endpoint, server
  major 17 and UTC. No URLs, passwords or role identities were printed/committed.
- Applied the existing foundation and additive `0002_supplied_imports.sql`, then
  `0003_multibrand_candidates.sql`. Final migration runs applied **0, 0** changes.
  Existing SQL migration bytes/history were preserved. No application/hosted
  database reset, deletion, conversion or copying of existing data occurred.
  Automated integration resets remain limited to the allowlisted disposable test
  schema, using its independent restricted PostgreSQL 17 credential.
- `MIGRATION_DATABASE_URL` is unset: the authorized migration used the supplied
  credential. Separate least-privilege web/import/migration roles, staging and
  production databases/credentials, hosting secrets and backup/restore checks
  remain pre-deployment requirements. See NEON.md and IMPORTING.md.
- The exact user-supplied file `india_coupon_codes_2026-10-29.csv` contains 112
  candidates. Dry run: created/publishable 85, withheld 27. Apply: created 85,
  published 85, existing 0, withheld 27. Replay: **created 0, published 0, existing
  85, replayed true**. Read-only Neon counts confirmed 1 applied batch, 85 supplied
  offers, 85 published offers and 27 private candidates.

The CSV is operator-supplied data, not instructions and not a collector access
grant. Known merchant aliases are explicit; generic food/grocery/electronics
labels and unidentified bundles are not guessed. Dates without an exact expiry
instant and mixed commercial wording remain source claims with nullable structured
values. Original conditions, source URLs, raw cells, file hashes and private
approval/provenance are retained. No coupon was invented or marked checkout-tested.

### Implementation and changed files

- `src/modules/imports/{schema,csv,service}.ts`: strict JSON/CSV validation,
  2 MiB/500-row bounds, quoted/escaped/multiline CSV handling, explicit operator
  approval, null preservation, merchant matching, conservative duplicate checks,
  stable IDs and immutable content, replay conflicts, dry runs and atomic bulk
  publication. Same-code coupons at different merchants remain distinct; uncertain
  same-merchant candidates are rejected for review, never silently merged.
- `scripts/{db-check,import-coupons}.ts`, package scripts: credential-safe connection
  diagnostics and repeatable `npm run import:coupons -- --file <batch> [--apply]
  [--publish] [--test]`. No page request imports or collects data. No HTTP import
  endpoint or public administrative mutation was introduced.
- `src/modules/database/migrations/000{2_supplied_imports,3_multibrand_candidates}.sql`:
  batch/item provenance, audited supplied-offer approval, synthetic-data constraints
  and private ambiguous candidates. Original foundation migration unchanged.
- `database/{client,repository,catalogue-repository}.ts`: bulk repository insertion,
  bounded transactional writes, sanitized disconnect handling, and explicit safe
  supplied-data public projection. Automatic collection remains gated separately.
  Published, approved, non-synthetic supplied records do not depend on an approved
  collector source. Drafts, review conflicts and raw evidence remain excluded.
- `catalogue/{brands,model,public.server}.ts`: 21 registered brands, broader categories,
  approved display/link URL allowlist, store filtering and accurate supplied-versus-
  observed freshness. A missing code discount is not called an automatic offer;
  cashback is not labelled an immediate discount.
- `components/catalogue/{brand-image,catalogue,chrome,copy-code}.tsx`,
  `app/{page,globals}.tsx/css`, store routes and methodology: real brand images,
  image banners, multi-brand navigation and directory, perforated coupon tickets,
  masked codes, reveal/copy confirmation/manual fallback and smaller dark input
  focus rings. No fake promotion artwork, popup or claim of working verification.
- `public/brands/`: 21 actual website icons plus official Myntra and Rage Coffee
  Open Graph brand images. `manifest.json` records website/asset URLs, hashes and
  retrieval timestamps, including public favicon-cache fallbacks. No affiliation
  or blanket asset reuse license is claimed; review brand requirements before
  public deployment. Remote assets are stored locally, not fetched by page requests.
- `tests/{unit/csv,unit/imports,unit/catalogue,integration/imports,integration/database}`,
  `scripts/{test-browser.mjs,browser-import-fixture.ts}`: import/CLI, bulk rollback,
  duplicate/replay/concurrency, private-candidate, brand filtering and UI checks.
- README, design.md, `docs/{NEON,IMPORTING,SOURCES,PROGRESS}.md`, `.hallmark/` and
  screenshots document the current workflow. No additional runtime dependency,
  database engine or ORM was introduced. Existing pg/Zod/domain schemas are reused.

### Actual corrections and checks

The first row-by-row remote import lost its connection before commit. A separate
read confirmed **0 batches/offers/candidates committed**. Replaced per-record remote
round trips with validated bulk statements in one transaction; the retry and
replay then succeeded. Connection-error listeners and rollback failure handling
now keep connection loss credential-safe rather than emitting an unhandled stack.

TypeScript caught an initial Zod pipeline variance issue; validation now reuses the
domain refinements safely. Production browser seeding exposed malformed/empty URL
handling in a URL refinement; corrected it and reran the suite. One existing CLI
check timed out during concurrent development work; the final isolated checks
passed. A live masking assertion initially matched the user's visible search term
in the heading; it now checks the card value, and detail masking is checked separately.

Fresh-context Hallmark review identified a mobile selector hiding the logo wrapper
and a duplicate “Coupon code” caption. Both were fixed and recaptured. Removed the
banner side stripe flagged by the sweep. The final rendered sweep has **0 Floor
failures / 0 open Reflex findings**, with two reviewed short-footer-caption measure
warnings retained; white surfaces and wrapping content links retain their justified
waivers. Mobile card logos are visible in the refreshed capture.

| Check | Actual result |
| --- | --- |
| `npm run db:check -- --neon` | Connected; direct Neon PostgreSQL 17, UTC, TLS encrypted and certificate verified |
| Final Neon `npm run db:migrate` twice | Passed: 0 and 0 pending migrations |
| Real CSV dry run/apply/replay | 85 accepted/published; 27 withheld; replay created/published 0 |
| `npm test` | **89/89 passed**, 11 files, including **38 real PostgreSQL integration tests** |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed, Next.js 16.4.3, including dynamic brand store routes |
| Development browser suite | Passed search, filters, pagination, details, reveal/copy + clipboard fallback, automatic offers, stale/expired/loading/error states, keyboard menu/skip link and 8 viewport widths |
| Production browser suite | Passed noindex/preview guard even with flag enabled; imported test records appeared after build without rebuilding, copied codes, withheld drafts/synthetic/private evidence |
| Read-only real Neon browser check | Passed: 85 total / 19 Myntra; brand/category filtering, pagination, hidden-before-reveal code, clipboard copy, 27-row exclusion sample, loaded brand images, mobile/desktop |
| axe WCAG A/AA | Zero violations on checked home/store/detail desktop/mobile screens, including actual supplied records |
| Hallmark static + rendered | 0 FAIL, 0 open REFLEX; 15 rendered captures, 2 retained footer measure warnings |
| Fresh-context review corrections | 2 findings resolved and recaptured |
| `git diff --check` | Passed |

Real Neon browser checks used only page reads and clipboard interaction, not
database mutations or merchant checkout. Repeatable fixture browser writes are
strictly confined to the disposable test database. Chromium/axe coverage is not
a full screen-reader or cross-browser certification. Hosted CI has not run here.

Actual screenshots: [home](screenshots/live-home-desktop.png),
[home mobile](screenshots/live-home-mobile.png),
[Myntra](screenshots/live-myntra-desktop.png),
[Myntra mobile](screenshots/live-myntra-mobile.png),
[masked offer](screenshots/live-offer-masked.png),
[revealed offer](screenshots/live-offer-revealed.png),
[offer mobile](screenshots/live-offer-mobile.png).

**Remaining:** clarify the 27 ambiguous merchants before publishing those rows;
independently confirm coupon eligibility/expiry/rights; choose a Node.js 24 website
host/domain, provision separate staging/production credentials and restricted roles,
bind server-only secrets, and complete backups/restore, monitoring and launch checks.
No website deployment occurred. Automatic collection authorization, reconciliation,
scheduling and administration remain separate future work; they do not block this
explicit owner-supplied, unverified-claim workflow.

## Frontend task: catalogue screens ahead of source authorization (2026-10-29)

The owner explicitly authorized this frontend task before reconciliation, with
a white/black/blue/lime palette and token/ticket shapes. Scope: homepage search,
Amazon India electronics catalogue, offer details, responsive navigation/footer
and meaningful interface states. No scheduler, global deduplication, admin,
deployment or automatic publication was added.

### Configuration and data boundaries

Safely inspected DATABASE_URL and TEST_DATABASE_URL without printing credentials:
both target **local PostgreSQL**. MIGRATION_DATABASE_URL is unset. Neon is the
chosen future PostgreSQL 17 host for staging/production; no hosted provider was
connected and no existing development data was migrated/deleted. `docs/NEON.md`
records missing account/project/databases, independent restricted roles, secure
bindings, verified TLS, backups and monitoring requirements. Existing SQL
migration history is unchanged.

Pages read the PostgreSQL repositories in a read-only transaction; they never
collect, migrate or write. A literal closed publication gate prevents any public
inventory until permitted live data and reconciliation controls exist. There is
no environment/query override for that gate. Public lookup also excludes drafts,
synthetic/missing provenance, unapproved or disabled sources, unsuccessful listings,
unsafe merchant URLs and unresolved duplicate reviews on either side. Its explicit
projection omits raw evidence, source claims of verification and private eligibility
metadata. Search is parameterized, pagination bounded and ordering stable.

Seven synthetic examples are created only by the server-only development preview
module. `/preview` requires NODE_ENV=development and ENABLE_UI_PREVIEW=1; production
returns 404 even if the flag is set. Every preview screen carries an invented-data
notice. Preview redemption stays on a local explanation page. No preview fixtures
are seeded into the application database. The fixed preview clock is 2026-10-29
08:00 UTC; the older/expired examples are interface demonstrations, not live offers.

### Changed files

- `app/{layout,page,globals,tokens,base,error,not-found}` and routes under
  `app/{search,stores/amazon-india,offers/[offerSlug],preview/[[...path]],methodology}`:
  responsive catalogue, metadata/noindex, loading/empty/error/detail states.
- `components/catalogue/{chrome,catalogue,copy-code,loading}.tsx`: navigation,
  shared ticket/condition layouts, native GET search/filters, URL pagination,
  copy confirmation/manual fallback, safe automatic-offer action and stale/expired
  messaging. Missing commercial conditions remain “Not provided”; observed offers
  are labelled unverified and never treated as checkout tested.
- `src/modules/catalogue/{model,public.server,preview.server}.ts` and
  `src/modules/database/{catalogue-repository,repository}.ts`: validated shopper
  types, preview isolation, safe projection and existing-repository read path.
- `tests/unit/catalogue.test.ts`, `tests/integration/catalogue.test.ts`:
  validation, safe URLs, condition whitelisting, states, public readiness gate,
  PostgreSQL exclusion/projection, literal search, filtering and pagination.
- `scripts/test-browser.mjs`, `package.json`, lockfile and CI workflow: Playwright
  interactions/screenshots and axe accessibility checks; dedicated test database
  binding; production guard check. Added only `@axe-core/playwright` as a QA
  dependency; no unrelated dependency upgrades.
- `next.config.ts`: suppress the development indicator in review captures.
  `eslint.config.mjs`/`vitest.config.mts`: ignore local skill tooling and limit
  the test suite to project tests.
- `public/fonts/{rethink-sans.ttf,OFL.txt}`, `design.md`, `.hallmark/`: self-hosted
  licensed typeface, requested design tokens and recorded Hallmark review.
- `.env.example`, README, `docs/{NEON,POSTGRESQL,PROGRESS}.md` and
  `docs/screenshots/`: preview commands, hosting requirements and actual captures.

### Validation and corrections

The first new integration assertions accidentally put the intended eligible
control offer on the other side of an unresolved duplicate review; the repository
correctly excluded both sides. Corrected the test relationship to use another
already hidden offer. Restricted Windows execution also prevented the tsx CLI
test from reading OS user information (`uv_os_get_passwd`); rerunning outside that
restricted token passed all tests without changing application behavior.

Browser verification found and corrected navigation-wait assumptions in the test
runner. Visual review found a squeezed mobile menu SVG, clipped monetary benefit
and faint control borders. Fixed square-button padding/SVG sizing, monetary type
and safe wrapping, and a 3:1+ control-border token. Hallmark rendering also found
blue focus rings on the black footer; those now use lime. The independent finish
review scored all three findings resolved and returned **ship**.

| Check | Actual result |
| --- | --- |
| `npm test` | **74/74 passed**, 8 files; all existing 66 tests plus 8 catalogue tests |
| Real PostgreSQL coverage | **30 integration tests passed**, including migrations/replay, constraints, transactions, collector and new catalogue policy tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, no application warnings |
| `npm run build` | Passed, Next.js 16.4.3 |
| Development browser interactions | Passed: search, category/type filters, pagination, details, clipboard success/fallback, automatic-offer preview, stale/expired/loading/error states |
| Keyboard/mobile checks | Passed: menu open/Escape, skip link, focus; no horizontal overflow at 320, 375, 414, 768, 1024, 1280, 1440 and 1920px |
| axe WCAG A/AA checks | Zero violations on home/store/detail at desktop and mobile sizes |
| Production browser check | Passed: noindex, empty public results, public fixture slug rejected, previews blocked despite ENABLE_UI_PREVIEW=1 |
| Hallmark static + rendered sweep | 0 Floor failures, 0 open Reflex findings; 15 rendered captures. White palette and wrapping content-title links explicitly waived; two short-footer measure warnings reviewed and retained |
| Fresh-context design review | Ship; 3 findings, 3 resolved |
| `git diff --check` | Passed (Git emitted line-ending normalization notices only) |

Browser commands use a test-only DATABASE_URL override, a loopback server and
owned-process cleanup. A temporary review server was also used for Hallmark
captures and stopped after review. CI browser steps are configured but hosted CI
has not been executed here. Automated axe checks are not a full screen-reader or
cross-browser certification; browser execution used Chromium.

Screenshots: [home desktop](screenshots/homepage-desktop.png),
[home mobile](screenshots/homepage-mobile.png),
[store desktop](screenshots/store-preview-desktop.png),
[store mobile](screenshots/store-preview-mobile.png),
[detail desktop](screenshots/offer-preview-desktop.png),
[detail mobile](screenshots/offer-preview-mobile.png),
[expired preview](screenshots/expired-preview.png).

The frontend task is implemented. The public catalogue intentionally remains
empty/noindexed. Live source authorization, daily reconciliation, deduplication,
publication controls and Neon staging/production provisioning remain outstanding;
fixture UI success does not establish live-source or production readiness.

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

## Phase 1: PostgreSQL domain and database foundation (29 October 2026)

Implemented only the database foundation. The pre-launch placeholder and its
noindex/crawl restrictions remain in place. No live source, collector, commercial
matcher, admin UI, public API, scheduler or deployment was added.

Changed files and choices:

- `src/modules/domain/schemas.ts`: strict Zod schemas for offers/commercial terms,
  permissions, observations, runs, listing identity, lifecycle/publication and
  verification. Unknown conditions remain null; source claims stay separate.
- `src/modules/normalize/money.ts`: exact decimal-token conversion using BigInt,
  safe-range PostgreSQL BIGINT reads and null preservation.
- `src/modules/database/{client,migrate,repository}.ts` and
  `migrations/0001_foundation.sql`: bounded pg pools, UTC, transactions,
  PostgreSQL 17 enforcement, advisory-locked checksum migration ledger,
  repositories, replay constraints, provenance, history, immutable public slugs,
  source leases/fencing, review/audit tables and a transactional outbox foundation.
- `scripts/migrate.ts`, `scripts/init-test-db.sh`, `compose.yaml`, `.env.example`,
  `.gitattributes`: explicit standalone env loading, persistent development DB,
  separate ephemeral test service with restricted role, byte-stable migrations.
- `tests/fixtures/offer.json`, `tests/unit/`, `tests/integration/`,
  `vitest.config.mts`: synthetic fixtures only, real PostgreSQL tests and explicit
  endpoint/database/role checks before disposable-schema reset.
- `package.json`, `package-lock.json`: pinned pg 8.16.3, Zod 4.6.7,
  Vitest 4.1.12, tsx 4.21.0 and pg types 8.15.6; Node 24 requirement;
  migrate, test, integration and typecheck scripts.
- `.github/workflows/ci.yml`, `README.md`, `docs/POSTGRESQL.md`: same PostgreSQL 17
  migrations in CI and documented separate environment/database/role bindings.

Local setup: generated independent random dev/test credentials in ignored
`.env.local`; started PostgreSQL 17 development and disposable test services.
Port 5433 was occupied, so the test service uses loopback port 55433. Development
uses 5432 and a persistent volume. No populated volume was removed.

Initial validation exposed a SQL UTF-8 BOM, causing the first migration and its
dependent integration assertions to fail. Removed the BOM; the migration then
applied once and repeated with zero changes. Subsequent tests passed (30/30 at
that stage), as did TypeScript, lint and build. Final validation follows below.

Dependency audit: upgraded the newly introduced Zod/Vitest versions to patched
versions and applied compatible transitive fixes. The audit then reported one
remaining critical package: existing Next.js 16.3.0. Its suggested update is
16.4.3, outside the existing exact pin. Framework upgrade is deferred from this
foundation step and remains a pre-launch security prerequisite.

Limitations: no staging/production host or secret bindings were supplied, so
those databases/roles were documented rather than provisioned. CI workflow is
added but has not been run on hosted CI. Lease/outbox/review/audit persistence is
foundation only; the collector's reconciliation, heartbeat, publication policy,
admin authorization, event delivery and restore rehearsal remain later steps.


### Final Phase 1 validation

Executed locally with Node 24.21.0 and real PostgreSQL 17.11:

| Check | Actual result |
| --- | --- |
| `npm ci --no-audit --no-fund` | Passed, clean lockfile install (413 packages) |
| `docker compose --env-file .env.local --profile test up -d --wait db test-db` | Both services healthy |
| `docker compose --env-file .env.local config --quiet` | Passed |
| `npm run db:migrate` on fresh development DB | Passed, applied 1 migration |
| Second migration and final repeat after clean install | Passed, applied 0 migrations |
| Fresh/repeated/concurrent migrations in isolated integration DB | Passed |
| Checksum tampering and failed-migration DDL/ledger rollback | Passed |
| `npm test` on final files/dependencies | Passed: 33 tests across 3 files |
| `npm run test:integration` | Passed: 19 real PostgreSQL tests |
| `npm run typecheck` | Passed |
| `npm run lint` on final files | Passed |
| `npm run build` | Passed; homepage, not-found and robots generated |
| Development database inspection | PostgreSQL 17.11, 1 migration, 0 offers |
| `git diff --check` | Passed |

The tests verify null preservation, exact paise and unsafe-range rejection,
source approval, code requirements, dates, validation failures, SQL constraints,
foreign keys including cross-source evidence, same-run observation/outbox replay,
unchanged next-day fixture persistence, historical links after listing reuse,
transaction rollback, recurring codes with distinct conditions and concurrent
lease claims with stale-owner rejection. Configuration tests reject missing URLs,
unverified remote TLS and non-allowlisted destructive test destinations.

Renamed the Vitest config to `.mts` to use native ESM and remove its configuration
warning. An intervening lint invocation raced that rename; the final lint run
completed successfully after the filesystem changes finished. All final test,
TypeScript, lint and build results above use the final dependency set.

Phase 1 foundation acceptance checks are complete locally. Hosted CI execution,
remote role provisioning and the existing framework advisory remain explicitly
unverified/deferred as described above; this does not claim a production launch.

## Security prerequisite for Phase 2 (29 October 2026)

Resolved the Phase 1 critical advisory before collector implementation:
`next` 16.3.0 -> 16.4.3, with matching `eslint-config-next` 16.4.3.
Only those direct pins and their required lockfile dependencies changed for this fix.
The existing React, database, Zod and test-tool pins remain unchanged.

Confirmed the affected ranges and patched releases against maintainer advisories:
[GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)
(cache typed-array RCE) and
[GHSA-2464-fhr4-w9xw](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw)
(image optimization/upstream RCE), alongside the
[16.4.3 release](https://github.com/vercel/next.js/releases/tag/v16.4.3).
The installed version lies beyond the affected <=16.4.0 ranges and also covers
older advisories affecting 16.3.0. Read the installed 16.4.3 upgrade documentation;
AGENTS.md already points to the bundled version-matched docs.

Before collector code changes: `npm test` passed all 33 existing tests against
PostgreSQL; `npm run typecheck`, `npm run lint` and `npm run build` passed.
`npm audit` passed with zero vulnerabilities. The earlier framework advisory
limitation is resolved. This is not a production deployment.

## Phase 2: first source adapter and manual collection (29 October 2026)

Investigated all six specification candidates using primary terms/API documents;
recorded evidence URLs, limitations, access/reuse prerequisites, attribution and
request scope in `docs/SOURCES.md`. No candidate was granted live approval.
GrabOn/GoPaisa restrict reuse/automation; CouponDunia's direct terms response was
region-restricted; DesiDime's accessible merchant terms do not license the public
catalogue; Zoutons does not establish a collection/republication entitlement.
No accounts were created, no third parties contacted and no retail catalogue crawled.

Selected a conditional official Amazon India seller Promotions API contract,
2025-12-01. This is seller-scoped, not a public marketplace coupon feed. Live
execution remains disabled until an authorized SP-API seller/app with Pricing
or Product Listing access, a valid LWA access token, reviewed electronics ASINs,
and explicit collection/retention/republication rights and attribution are supplied.
The API model's licence is not permission to republish seller data. A token alone
cannot bypass approval. No invented endpoint, permission grant or live success.

Files introduced/changed for Phase 2 (in addition to the security pins above):

- `src/modules/sources/contracts.ts`: adapter/context/result contracts and strict
  listing/result validation using existing domain schemas.
- `src/modules/sources/amazon-promotions.ts`: official response-contract extraction,
  exact commercial normalization, original API URL, UTC collection/validity times,
  raw JSON and SHA-256 evidence reference; pagination and partial/error outcomes.
- `src/modules/sources/http.ts`: exact HTTPS destination/query allowlist, public-IP
  checks, DNS pinning with normal TLS verification, credential-safe redirects,
  response-size cap, cancellation/timeouts, serial request spacing, total request
  budget and bounded retries/Retry-After handling.
- `src/modules/sources/registry.ts`: source registration, adapter factory and
  permission blocker; explicitly separate fixture registration.
- `workers/collector/{cli,fixtures,run}.ts`: manual command, offline fixture
  transport, PostgreSQL run records, unmatched listings and immutable evidence.
  Fetching/extraction runs outside SQL transactions; persistence and run completion
  commit together. A persistence rollback is followed by a separate failed-run record.
- `src/modules/database/repository.ts`: source registration without overriding
  permission decisions, permission check, evidence-only listing updates that
  preserve existing commercial links, and terminal run statistics/errors.
- `src/modules/database/test-database.ts`, `tests/integration/safety.ts`,
  `scripts/migrate.ts`: shared exact disposable destination/role safety and an
  explicit non-destructive `db:migrate -- --test` path. No new SQL migration and
  no changes to the applied Phase 1 migration/checksum.
- `tests/fixtures/amazon-promotions/`: hand-authored, clearly marked code/automatic,
  empty, malformed JSON and changed-HTML fixtures with provenance README.
- `tests/sources/{amazon-promotions,http}.test.ts` and
  `tests/integration/collector.test.ts`: extraction, transport controls, real
  PostgreSQL run/evidence persistence, partial/failure/cancellation behavior and CLI.
- `package.json`: manual collect command; no new collector dependencies.
- `.env.example`, `README.md`, `docs/POSTGRESQL.md`, `docs/SOURCES.md` and this log:
  commands, empty secret bindings, request ceilings and unresolved live prerequisites.

The collector stores unmatched observations only. It never creates commercial
campaigns, globally deduplicates, deletes/expires offers, relinks existing matches,
publishes inventory or upgrades verification. COUPON/clipping and unavailable
individual-code redemption are rejected rather than mislabeled automatic.
Source API lifecycle claims remain raw source evidence, not independent assurance.

Initial new-suite verification passed 65/66 tests; the one failure was an assertion
expecting an ISO timestamp without milliseconds instead of canonical `.000Z`.
Corrected that assertion. A subsequent run passed all 66 tests. TypeScript also
caught an inferred union for a mocked HTTP header; corrected the mock's header
shape. These were test issues; no unknown commercial values were fabricated.

Manual checks already executed: `npm run db:migrate -- --test` applied zero pending
migrations. The fixture collector returned FIXTURE/SUCCESS with two observations
and two canned request attempts. The command without --fixture returned LIVE/FAILED,
SOURCE_NOT_APPROVED, zero requests and exit 1, with a persisted failed run. Fixture
request counts represent canned transport attempts, not HTTP calls to Amazon.

No daily scheduler, global matching, admin screens, public redesign or deployment
was implemented. Staging/production provisioning remains pending by agreement.
Hosted CI and permitted live collection have not run; fixture success does not
establish live-source readiness. A forced process kill may leave a RUNNING record;
lease recovery/heartbeat and reconciliation are Phase 3 work, not a scheduler here.

### Final Phase 2 validation

| Check | Actual result |
| --- | --- |
| Security prerequisite `npm test` before collector changes | Passed all 33 existing tests |
| Security prerequisite TypeScript, lint and build | Passed on Next.js 16.4.3 |
| Final `npm test` | Passed all 66 tests across 6 files, including the original 33 |
| Real PostgreSQL coverage within that suite | Passed all 27 integration tests, including 8 collector/CLI tests |
| Final `npm run typecheck` | Passed |
| Final `npm run lint` | Passed |
| Final `npm run build` | Passed on Next.js 16.4.3; placeholder/robots retained |
| Final `npm audit` | Passed: zero vulnerabilities |
| `npm run db:migrate -- --test` | Passed: 0 pending migrations |
| `npm run collect -- --source amazon-in-promotions --fixture` | Passed: FIXTURE/SUCCESS, 2 synthetic observations, exit 0 |
| `npm run collect -- --source amazon-in-promotions` | Expected refusal: persisted FAILED, SOURCE_NOT_APPROVED, 0 HTTP requests, exit 1 |
| Production HTTP smoke on loopback | Passed: homepage 200, coupon placeholder/noindex; robots 200 with Disallow: / |
| `git diff --check` | Passed |

The first short HTTP smoke attempts could not reach the local process before
startup completed. A longer bounded Node HTTP smoke passed; the temporary local
server was stopped afterward. No deployment/publication occurred.

New tests cover codes and automatic offers, optional/null terms, exact money,
UTC timestamps and raw-date preservation, malformed JSON, unexpected HTML,
schema changes, explicit empty and partial results, empty intermediate pages,
pagination loops/totals, timeouts, cancellation, 401/403, rate limits, Retry-After,
retry/request/response bounds, URL/redirect/private-address restrictions, persisted
run outcomes and rollback, unchanged campaign links, evidence references and CLI
exit behavior. Automated tests use canned source responses and a real isolated
PostgreSQL 17 database; they never call a live retailer/API. The native external
HTTPS path has not been exercised against Amazon without the missing authorization.

**Phase 2 outcome:** fixture-backed adapter/manual collection engineering is
implemented and verified. Live-source acceptance uses the explicit external-blocker
path, not a claim of permitted live access or live-source readiness. See SOURCES.md
for the exact seller/app/token, ASIN scope, retention, republication and attribution
prerequisites. Stop here; later phases and remote provisioning remain pending.

## Ticket layout, discovery content and supplied contact details (2026-10-29)

Implemented the owner's requested refinement in the existing application. The
canonical origin is **https://getpaid.co.in**; this is configuration, not a claim
that DNS or a website host is connected. Contact & report shows the supplied
email as a `mailto:` link and phone as `tel:+919965985951`. No email or call was
sent. Neon PostgreSQL 17 and all existing data/migration files were preserved.
The real catalogue remains **85 supplied, source-listed offers**, including 19
Myntra offers, with 27 ambiguous source rows withheld. There were no application
or Neon database writes in this frontend task.

### Changes delivered

- Exactly **seven main coupon tickets per page**, bounded pagination and a
  separate three-offer related rail. Real circular alpha-mask cuts replace fake
  edge circles. Stable blue, lime and neutral-paper tones use existing tokens.
  Code fields and reveal/copy controls wrap safely; mobile stacks controls.
- A capped central list with left category/reserved-ad space and right related
  coupons/reserved-ad space on desktop. Below 1200px, rails are hidden and the list
  has one column. No paid ads, ad network or misleading sponsored endorsements.
- Removed the Design preview navigation link. Explicitly enabled development
  preview URLs still work and are labelled synthetic; production returns 404.
  Preview-only samples increased from seven to fifteen to test 7/7/1 pagination;
  they were not imported into any database.
- One SQL statement reads count, clamped page and related offers in one snapshot.
  PostgreSQL major-version validation runs once per process, rather than for each
  page. Request-scoped React deduplication, Link prefetch and a pending indicator
  reduce navigation delay without a cross-request catalogue cache or collection
  from page requests. Publication, duplicate-review and evidence checks remain.
- Validated the two supplied attachments as draft content, excluded embedded
  agent instructions, and integrated eight categories, eight guides and eight
  FAQs. Added About, Contact/report, Disclosure, an explicitly unreviewed Privacy
  draft, guide directory and human sitemap: **23 new content routes**, plus XML
  sitemap. Existing merchant/detail routes were reused; coupon data was untouched.
- Search resolves **147 distinct merchant/intent phrases**, brand/coupon
  misspellings, category synonyms and actual codes using the existing catalogue.
  No keyword doorway pages, fabricated coupons, verification, savings claims,
  local offices, affiliate partnerships or source permissions were added.
- Added unique metadata, clean page canonicals, internal category/store/guide
  links, safely escaped Article/WebSite structured data and Indian English
  language. Filter/search URLs and the privacy draft remain nonindexable. The
  launch-gated XML sitemap excludes previews, search, privacy draft, expired
  offers and empty merchants; errors do not invent sitemap data. No fake daily
  modification dates. See **docs/SEO-STRATEGY.md** for route and release details.

### Files changed in this task

- Presentation: `app/globals.css`, `app/tokens.css`, `app/layout.tsx`, `app/page.tsx`,
  `components/catalogue/{catalogue,chrome,workspace,page-link}.tsx`,
  `components/content/{editorial,report-form}.tsx`, `design.md`, `.hallmark/log.json`.
- Routes: `app/[slug]/page.tsx`, `app/{guides,faq,contact-report-an-offer,site-map}/page.tsx`,
  `app/stores/[storeSlug]/{page,loading}.tsx`, `app/stores/amazon-india/page.tsx`,
  `app/offers/[offerSlug]/page.tsx`, `app/{robots,sitemap}.ts`.
- Data/search: `src/content/{pack.json,model.ts}`,
  `src/modules/catalogue/{model,search-intent,preview.server,public.server}.ts`,
  `src/modules/database/catalogue-repository.ts`, `src/modules/seo/config.ts`.
- Verification/documentation: `tests/unit/{catalogue,discovery}.test.ts`,
  `tests/integration/catalogue.test.ts`, `scripts/test-browser.mjs`, `.env.example`,
  `docs/SEO-STRATEGY.md`, this progress entry and `docs/screenshots/` captures.

### Checks and measured results

- `npm test`: **94 tests / 12 files passed**, including **39 real PostgreSQL 17
  integration tests**. New coverage checks seven-item pagination, related rows,
  out-of-range clamping, category families, payment conditions, literal search,
  private-field exclusion, intent mapping, unique content routes and indexing
  configuration. Existing import, migration replay, constraints and transactions
  remain in the complete regression suite.
- `npm run typecheck`, `npm run lint`, `npm run build`: passed. The initial lint
  finding (internal anchor instead of Next Link) was corrected.
- `npm run test:browser`: passed search, filters, 7/7/1 preview pagination,
  detail/reveal/clipboard/fallback, automatic offers, stale/expired/loading/error,
  keyboard access, eight viewport widths and axe desktop/mobile. Expanded checks
  cover guides/canonicals, category empty state, FAQ, contact mailto and prepared
  reports. Scoped the error assertion to main content so Next's route announcer
  cannot cause a false strict-locator failure.
- `npm run test:browser:production`: passed noindex, blocked synthetic previews,
  post-build supplied import visibility in the dedicated disposable test DB,
  listing/detail/copy, private evidence exclusion and draft/synthetic isolation,
  plus new content/contact checks. Test fixture records were cleaned up.
- Read-only live Neon browser check: passed 85 total /19 Myntra, actual images,
  store/category filters, page 2 of 3, seven main tickets, masked/revealed copy,
  withheld-code exclusion, no overflow at 320/375/414/768/1024/1280/1440/1920,
  and axe on home/store/detail desktop and mobile. No database writes.
- Production/Neon content smoke: all 23 content routes returned 200 with noindex
  and no synthetic offer leak; robots blocks crawling and sitemap has no URLs
  before release. Typo search returned 19 Myntra offers with seven main cards;
  payment category returned actual offers; page-2 canonical matched the public
  domain. Category/contact/FAQ mobile axe checks passed. No database writes.
- Hallmark `sloplint app components --scope app --genre editorial --render` over
  store/category/guide/contact: **20 screenshots, zero FAIL, zero open REFLEX**.
  Fixed tiny sidebar captions, mobile note gutters and long control-like guide
  labels. Two short-footer-measure warnings were reviewed as appropriate short
  captions; existing palette and content-title wrapping waivers are documented.
  Fresh-context finish reviewer found no Floor issues and one self-recommending
  guide link; excluded the current guide and recaptured desktop/mobile, resolved.
- Production HTTP pagination benchmark against the same Neon endpoint, warmed
  `/stores/myntra?page=2`, five full response reads: before
  **1487/1490/1700/1495/1528 ms (median 1495)**; after
  **304/300/285/295/287 ms (median 295)**, about 80% lower in this local sample.
  This is not a production latency guarantee or cold-start measurement.
- `git diff --check`: passed (Git reported normal LF/CRLF conversion notices).

Screenshots: `live-myntra-desktop.png`, `live-myntra-mobile.png`,
`live-offer-masked.png`, `live-offer-revealed.png`, `category-mobile.png`,
`contact-desktop.png`, `contact-mobile.png`, `faq-mobile.png`, and
`guide-final-how-to-use-coupon-codes-india-{desktop,phone}.png` in
`docs/screenshots/`. Hallmark's twenty render captures remain in ignored local
`.hallmark/shots/`.

### Remaining release limits

No public deployment, DNS/host binding, Search Console verification or production
indexing release was performed. `PUBLIC_INDEXING_ENABLED=0` is the default; both
build and runtime must deliberately enable it only after the host, HTTPS/domain,
secure Neon secrets, privacy review and publication checks are complete. The
privacy text and image reuse need operator review. No rankings or AI citations
are promised. Daily reconciliation, global deduplication and permitted live
collection remain outstanding and do not block approved supplied-data pages.
This task stops at the requested frontend/content refinement.

## Pagination, WhatsApp submission link, source credits and favicon (2026-10-29)

- Replaced joined pagination controls with separate flex buttons, explicit gap,
  nonshrinking labels and wrapping at narrow widths. Previous and Next now have
  independent hit targets and cannot share DaisyUI joined borders/margins.
- Added a top-right, mobile-visible **List promo codes** link with the number
  underneath. It opens `https://wa.me/919965985951`; it does not automatically
  send a message or publish a submitted coupon.
- Added `/terms`, linked in the footer/human sitemap and launch-gated XML sitemap.
  Terms and the existing privacy draft identify the owner-supplied batch's
  references to publicly accessible third-party websites, credit the linked
  sources and promotion owners, preserve their rights, disclaim affiliation and
  provide correction/removal contact. Public accessibility is explicitly not a
  reuse permission. Unknown terms and unverified source claims remain unchanged.
  Privacy also describes the external email/WhatsApp contact channels. These
  pages still require operator review before public launch.
- Created a 96x96 PNG and PNG-backed ICO from the existing blue ticket brand mark,
  using the installed image encoder, not a new or fabricated merchant logo.
  Next's file conventions supply the icon links. Both icon URLs return 200.
  The PNG/ICO formats and size follow Google's current favicon guidance:
  https://developers.google.com/search/docs/appearance/favicon-in-search
- SEO/GEO remains the documented useful-content, metadata, canonical, structured
  data, language and internal-link foundation. Noindex and crawl restrictions
  remain deliberate pre-launch settings. Hosting/domain binding, a deliberate
  indexing release and Search Console verification are still pending. Google
  must crawl the homepage and icon after release; showing the favicon is not
  guaranteed and no ranking/AI-citation promise is made.

Files: `components/catalogue/{catalogue,page-link,chrome}.tsx`, `app/globals.css`,
`src/content/model.ts`, `app/sitemap.ts`, `app/icon.png`, `app/favicon.ico`,
`scripts/test-browser.mjs`, this record and `docs/SEO-STRATEGY.md`.

Checks: `npm test` **94/94 passed**, including the existing real PostgreSQL 17
integration coverage; `npm run typecheck` and `npm run lint` passed;
`npm run build` passed with finalized PNG/ICO assets;
`npm run test:browser:production` passed existing search/detail/copy, content,
contact, noindex and draft/fixture isolation checks. The first build overlapped
replacement of the temporary SVG by PNG/ICO and could not read that removed
file; the final build with stable files passed. A local browser-harness context
setup error was corrected before the successful live layout run.

Read-only live UI verification passed button bounding-box nonintersection at
320/375/414/768/1024/1280/1440/1920, navigation both directions, WhatsApp URL and
visibility, no horizontal overflow, terms/privacy attribution text, favicon link
and PNG/ICO HTTP responses, zero browser errors, and axe desktop/mobile.
Screenshots: `docs/screenshots/pagination-whatsapp-375.png` and
`docs/screenshots/pagination-whatsapp-1440.png`. Persistent browser assertions now
check the WhatsApp URL, icon link and pagination nonintersection at all eight
widths. No migrations, coupon imports, application database writes, external
messages or deployment were performed.

Final development regression: npm run test:browser passed with the new WhatsApp/icon assertions and pagination geometry at all eight widths; follow-up npm run lint passed. The local Neon-backed development server was restored on localhost:3000.


## Final header label and authorized GitHub delivery (2026-10-29)

The header now displays only **List promo codes**. Removed the visible WhatsApp
number and the number-bearing accessible label, while preserving the direct
`https://wa.me/919965985951` destination. The contact page's previously requested
phone/email links remain. Updated the browser selector to the concise label.

Final checks: 94 tests /12 files passed; TypeScript, lint and production build
passed. Read-only browser checks at 320/375/1440 verified the exact button text,
no number in the header, correct WhatsApp destination and no horizontal overflow.
A scan of 258 prospective tracked files found no configured secret values,
private-key/access-token patterns or included local environment/data files.
`.env.local`, `.data`, dependencies and runtime outputs remain ignored.

The owner explicitly requested committing and pushing all completed application
work to the existing `origin` GitHub repository on `main`. Remote state was
fetched and matched local HEAD before committing. No deployment is part of this
push; the existing CI workflow performs checks and has no deployment job.

## Homepage offer-focused wording (2026-10-29)

Changed the hero to **Find offers. Shop smarter.**, with **Explore coupon codes
and discounts from your favourite brands.** The primary search CTA now says
**Find offers** on the hero; other search forms retain Search. The adjacent
brand ticket now says **Your brands. Your next deal.** No savings, verification
or popularity claims were invented and existing conditions remain visible.
Updated browser selectors for both valid search labels.

TypeScript, lint and build passed. Read-only live browser checks verified the
new copy and CTA at320/375/1440, no horizontal overflow, mobile/desktop axe with
zero violations and a working Myntra search returning19 real supplied listings.
Screenshots: docs/screenshots/hero-offers-375.png and hero-offers-1440.png.
No database, collector, indexing or deployment changes. Committed and pushed
under the owner's standing GitHub-delivery instruction.

## Vercel offer-load incident and approved saved-data fallback (2026-10-29)

Verified fresh requests to getpaid.co.in and www.getpaid.co.in: Vercel served the
current coupon app but zero cards and the catalogue-load error. Verified the
existing Neon connection separately: PostgreSQL17, UTC and certificate-verified
TLS all healthy. No connected Vercel management tool/project/login was available
for inspecting Production secrets or function logs, so the exact hosted
configuration failure cannot be claimed. Ignored .env.local is not uploaded by
Git. The old client also rejected standard Neon sslmode=require before making a
connection, a reproducible compatibility defect now fixed by upgrading that mode
to verify-full (not weakening TLS). Other unsafe remote TLS modes stay rejected.

The owner explicitly authorized keeping supplied public coupons in the app when
DB reads fail. Added an export of **85 approved public supplied offers** at
src/content/public-offers.json, from a read-only repeatable-read PostgreSQL17
transaction using the existing public repository. No database writes, resets,
imports or migrations occurred. The 27 withheld rows remain withheld. No drafts,
synthetic fixtures, raw evidence, private eligibility/batch/approval metadata or
credentials were exported. The actual source timestamps, conditions, null terms,
source URLs and unverified status are preserved.

Production reads still prefer PostgreSQL. Only read/configuration errors select
the bundled saved data; a successful empty result remains empty. Development and
tests never silently use this data. Saved listings display the capture date and
an honest not-freshly-checked notice on lists and details, and reuse seven-item
pagination, search, filters, detail pages, copy and expiry/start-date guards.
PUBLIC_CATALOGUE_SNAPSHOT=0 disables this fallback. Changes after snapshot export,
including withdrawals, require export/redeploy or disabling fallback: this dated
copy is not daily reconciliation and never implies a fresh source check.

Added npm run catalogue:export and npm run test:browser:fallback. Export is manual,
not part of CI/build/page requests, requires configured PG17 and applies the
existing approval policy. Server-side failures now log only allowlisted diagnostic
codes; credentials, URLs, exception text and operational details stay off pages.
See docs/VERCEL.md for the exact Production DATABASE_URL/redeploy checklist and
saved-data refresh/revocation limits. No Vercel secrets were changed without
account access. Added the outage browser suite to the existing CI checks.

Files: src/modules/database/{client,diagnostics}.ts,
src/modules/catalogue/{public.server,model,snapshot}.ts,
src/content/public-offers.json, components/catalogue/{catalogue,snapshot-notice}.tsx,
app/offers/[offerSlug]/page.tsx, app/globals.css,
scripts/{export-public-catalogue.ts,test-fallback-browser.mjs,db-check.ts},
tests/unit/snapshot.test.ts, package.json, .env.example,
.github/workflows/ci.yml, docs/VERCEL.md and this progress record.

Checks actually run:
- npm run db:check -- --neon: connected, PG17/UTC, encrypted/authorized TLS.
- npm run catalogue:export (equivalent tsx script invocation):85 narrow public
  offers exported; read-only transaction, existing database preserved.
- npm test: **100 tests /13 files passed**, including existing real PostgreSQL17
  integration suites and six new snapshot/TLS/privacy/diagnostic behavior tests.
- npm run typecheck, npm run lint, npm run build: passed.
- npm run test:browser:fallback: passed production with missing credentials,
  unreachable synthetic endpoint, and fallback disabled. Tested85 saved offers,
  seven per page, saved-date warning, search/filter/pagination/detail/copy,
  fixture exclusion, zero page errors and mobile/desktop axe. No DB writes.
- npm run test:browser:production: passed normal DB publication policy,
  successful-empty response, supplied import visibility, draft/fixture/private
  exclusion, search/detail/copy, content/contact, noindex and preview isolation.
- Screenshots: docs/screenshots/saved-offers-{desktop,mobile}.png.

Pushing this requested fix to the existing GitHub main branch can trigger the
owner's configured Vercel integration. Actual live results are checked separately;
local production tests alone are not proof of a completed hosted rollout.

### Hosted rollout actually verified

Pushed application fix09e2c22 to origin/main. Fresh HTTPS checks then confirmed
www.getpaid.co.in returned200, seven main offer cards, saved-listing notice and
no catalogue-load error. The apex still redirects to www. This is a verified
hosted recovery, not just a successful local build.

Real deployed browser checks passed:85 saved listings, seven per page, Myntra
page2 of3, exact MYNTRA300 search, detail saved-date notice, reveal/clipboard copy,
mobile no-overflow and axe, and zero page errors. Captures:
docs/screenshots/vercel-recovered-desktop.png and vercel-recovered-mobile.png.
No data writes or external messages occurred. The live site is currently using
saved mode, confirming that live database access still needs Vercel-side
configuration attention. The safe snapshot is the owner's authorized working
alternative, not a claim that the hosted database secret has been repaired.

## Remove the requested Unverified badges (2026-10-29)

Removed the observed-state Unverified badge from coupon cards and details.
Expired, upcoming and older-submission/observation warnings remain. Original
source attribution, Not checkout tested disclosure, publication state and actual
verification data are unchanged; no records were relabelled as verified.

TypeScript, lint and production build passed. Refreshed-development browser check
passed cards/detail without the removed badge, preserved checkout-test disclosure
and a disabled expired-offer action. The initial local check saw a stale dev
render; restarting only the owned dev server resolved it, and the check passed.
No database changes or environment-file edits. User was informed to rotate a
credential exposed by their IDE selection; no credential is repeated here.

## Optional visible ad placements (2026-10-29)

Implemented the supplied native,300x250 and728x90 scripts across existing regular
public pages, preserving coupon functionality, PostgreSQL and saved-offer data.
Refused fake/automated/deceptive click generation. The supplied popunder/Social
Bar snippets were not installed: no floating overlays, page-click hooks or
accidental-click placement was introduced. No real ad provider script was
requested or clicked by automated QA.

Placements: one responsive top banner below navigation/preferences (728x90 at
800px+,300x250 on smaller screens), one desktop-only300x250 catalogue sidebar
at1200px+, and one lazy native block below content before footer. Two slots on
ordinary/mobile pages; up to three on desktop catalogues. Slots are labelled
Advertisement, reserve their space and stay separate from search, code-copy and
pagination controls. Hidden sidebars never request ads; scrolling does not
refresh a loaded unit. Existing related coupons remain a distinct design.

An inline nonmodal preference control requests visitor permission before any
third-party scripts. Allow/keep-off is stored for30days, with Ad settings for
revocation, corrupt/expired storage treated as unknown, and memory-only fallback
when localStorage is blocked. Turning off unmounts frames and prevents future
loads. This is not presented as a certified consent-management/legal solution.
Development/test and synthetic previews have no ad UI/requests by default.
NEXT_PUBLIC_ADS_ENABLED=0 plus rebuild/redeploy disables everything.

Each supplied banner uses its exact window.atOptions object in an isolated frame,
not the attachment's incorrect global array/placeholder URL. An allowlisted frame
route with sandbox/CSP, no parent/same-origin permissions, noindex/nofollow and
origin-only cross-site referrers contains third-party script execution. Native
height messages require the actual frame source and a bounded numeric height.
No script can overwrite main-page banner options or access parent coupon DOM.
FAQ, disclosure and privacy draft now describe optional advertising and potential
provider data flow; no fake affiliate partnership or independent verification.
The attached text was reference material and did not override project behavior.

Files: components/ads/advertising.tsx, src/modules/ads/config.ts,
app/advertising/frame/route.ts, app/{layout.tsx,globals.css,robots.ts},
components/catalogue/workspace.tsx, src/content/model.ts, tests/unit/ads.test.ts,
scripts/test-ads-browser.mjs, package.json, .env.example,
.github/workflows/ci.yml, docs/ADVERTISING.md, docs/SEO-STRATEGY.md, this record and
mocked/updated screenshots. No new dependencies, database edits or migrations.

Checks actually run:
- npm test: **105 tests /14 files passed**, including existing real PostgreSQL17
  integration suites and five ad configuration/privacy/isolation tests.
- npm run typecheck, npm run lint, npm run build: passed. Fixed an initial generic
  inference error on the AdPreference external-store type.
- npm run test:browser:ads: passed with **all provider requests mocked**, zero
  live impressions/clicks. Tested no scripts before permission/after revocation,
  exact per-frame banner options, native viewport loading, parent isolation,
  no duplicates on navigation, visible page coverage, blocked-script resilience,
  working real coupon copy, eight widths, and mobile/desktop axe. Corrected a
  Playwright service-worker-blocking instrumentation error in opaque frames;
  provider requests stayed intercepted throughout.
- npm run test:browser:production: passed normal publication/data-isolation,
  search/detail/copy, content/contact, noindex and preview checks.
- npm run test:browser:fallback: passed production outage fallback,85 saved offers,
  pagination/filter/detail/copy, fixture exclusion, mobile/desktop axe and kill
  switch. Ads stayed unloaded because QA had not granted permission.
- Screenshots: docs/screenshots/ads-mocked-{desktop,mobile}.png. They show mocks
  and not-yet-visible native placeholders, not real ad fill or revenue evidence.

Provider/account approval, actual creative fill, sandbox compatibility, supplied
ads.txt lines if required, campaign categories and full privacy/retention review
remain operator/provider checks. Ads are not guaranteed to serve or earn revenue.
No bot, timer refresh, incentivised or accidental clicks were implemented.

### Advertising rollout verified without live ad traffic

Pushed c600fa7 to origin/main. A fresh HTTP-only request to www.getpaid.co.in
returned200 with the Advertising preferences/Allow ads UI, seven coupon cards
and no catalogue-load error. No browser scripts or ad-provider URLs were executed
by this deployment check. Real creative fill and provider/account approval remain
unverified. Removed two harmless extra EOF blank lines reported by staged
whitespace checking; subsequent diff check is clean.

## Default-on advertising and sidebar loading fix (2026-10-30)

Removed the ad preference bar and localStorage preference handling as requested.
Production placements now load automatically when visible; development/test and
synthetic previews remain disabled. The build-time kill switch remains available.
Desktop catalogues now show the rectangle and native units in the right sidebar,
separated by related coupons. Each supplied ad key appears once per page. Mobile
and non-catalogue layouts retain a responsive top banner and native content slot.
Failed/blocked scripts and a 12-second timeout show an honest unavailable notice.

Diagnosis: all three supplied script URLs returned HTTP 200 when fetched once as
text. Replaying those cached tags with all subsequent outbound requests blocked
identified a native document.cookie SecurityError caused by the old opaque frame.
Automatic approval review rejected executing native JS directly in the coupon
page because it could expose cookies/page data. The accepted alternative keeps
banners opaque and uses an independent HTTPS origin for native frames, defaulting
to Vercel's unique VERCEL_URL hostname. Cookie API access is granted only on that
foreign document; getpaid.co.in and all its subdomains are rejected as native
hosts. The parent DOM/cookies remain inaccessible. Native frames request the
credentialless attribute in supporting browsers. No protected deployment bypass,
database edits, migrations, fake clicks, overlays or timer refreshes were added.

Changed files: app/{layout.tsx,globals.css,advertising/frame/route.ts},
components/{ads/advertising.tsx,catalogue/workspace.tsx},
src/modules/ads/config.ts, src/content/model.ts, tests/unit/ads.test.ts,
scripts/test-{ads-browser,browser,fallback-browser}.mjs, .env.example,
docs/{ADVERTISING.md,SEO-STRATEGY.md,PROGRESS.md} and generated QA screenshots.
Disclosures and the privacy draft now describe default loading. QA blocks or
mocks advertising requests to prevent live impressions; ad links are never clicked.

Checks actually completed:
- npm test: 107 tests / 14 files passed, including real PostgreSQL 17 suites.
- npm run typecheck and npm run lint: passed.
- npm run build: passed after correcting a test AdPlacement inference error and
  the React boolean credentialless attribute.
- npm run test:browser:production: passed, including post-build supplied imports,
  search/detail/copy and draft/private/synthetic record exclusion.
- npm run test:browser:fallback: passed, including 85 saved offers, seven per page,
  search/filter/pagination/detail/copy, mobile/desktop axe and disabled fallback.

Limitations: live creative fill is not proven by mock tests. The native host must
be publicly accessible, serve this app without redirecting to the coupon origin,
and be accepted by the ad account. A protected deployment alias needs an approved
independent public host via NATIVE_AD_FRAME_ORIGIN. Provider/site approval, ads.txt
if required and privacy/retention review remain operator requirements.

- npm run test:browser:ads: passed with mocked creatives only; default loading,
  no preference UI, two distinct sidebar units, no duplicate keys, native cookie
  API compatibility with parent isolation, blocked status, real coupon copy,
  eight widths and desktop/mobile axe. Initial run caught the missing boolean
  iframe attribute; corrected it and reran successfully.
- Screenshots: docs/screenshots/ads-default-sidebar-desktop.png and
  ads-default-mobile.png (mock inventory), plus refreshed regular/fallback QA views.
- Configured-secret scan: 282 tracked/prospective files, zero findings.
