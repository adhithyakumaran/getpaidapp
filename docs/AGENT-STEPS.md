# Step-by-step implementation instructions

This is the current execution guide. Read `IMPLEMENTATION-PLAN.md` for the
architecture and `PROJECT-SPEC.md` for the domain requirements. The cleanup is
complete; implement one numbered phase per task. Examples below are starting
contracts, not existing integrations. Commands labelled “add” are proposed work.

These are ordered engineering steps toward one production release, not separate
v1/v2 products. PostgreSQL is required from the first database task.

## Current repository

- Next.js 16.3, React 19, TypeScript, Tailwind 4, daisyUI 5.
- Minimal coupon placeholder only; old calculators, guides and images removed.
- No database, engine, API, live source, admin auth or daily scheduler exists.
- Local skills: daisyUI, seo-plan, seo-programmatic, seo-geo.
- Hallmark is installed globally in this machine. For another machine install:

```sh
npx skills add nutlope/hallmark --agent codex --yes -g
```

Use the installed skill instructions at their implementation phase. Do not
interpret installation as a completed design or SEO audit.

## Standard task protocol

1. Read AGENTS.md, this guide and PROGRESS.md. Inspect Git status.
2. State the phase, exact file list, dependency choices and acceptance criteria.
3. Implement that phase only. Preserve unrelated user changes.
4. Run meaningful checks and record actual outcomes in PROGRESS.md.
5. Report results and stop. Ask only about prerequisites that block further work.

Common existing checks: `npm run lint` and `npm run build`. Phase 1 must add a
real `test` script and `typecheck` script before later tasks rely on them.
Preserve the existing Next.js generated declarations when it regenerates them.

## Phase 1 — Domain and database foundation

**Goal:** persistence and repeatable tests, while the placeholder keeps working.

Files to introduce: `src/modules/domain/`, `src/modules/database/`,
`src/modules/normalize/`, `tests/fixtures/`, `tests/integration/`, migration and
test configuration. Use PostgreSQL 17 in development, CI, staging and production. Read POSTGRESQL.md
for setup and connection policy. Use a pinned PostgreSQL driver/ORM and a migration
ledger; do not treat IF NOT EXISTS as a complete migration system. Integration
tests must exercise real PostgreSQL, not an in-memory substitute.

Add Zod and Vitest as appropriate and implement the following kind of schema:

```ts
import { z } from "zod";

const Paise = z.number().int().nonnegative();
export const OfferInput = z.object({
  retailerId: z.string().min(1),
  title: z.string().trim().min(1),
  kind: z.enum(["CODE", "AUTOMATIC", "BANK", "CASHBACK"]),
  code: z.string().trim().min(1).nullable(),
  minSpendPaise: Paise.nullable(),
  maxDiscountPaise: Paise.nullable(),
  validUntil: z.string().datetime({ offset: true }).nullable(),
  eligibility: z.record(z.string(), z.unknown()),
}).strict().superRefine((offer, ctx) => {
  if (offer.kind === "CODE" && offer.code === null) {
    ctx.addIssue({ code: "custom", path: ["code"], message: "A code offer needs a code" });
  }
});
export type OfferInput = z.infer<typeof OfferInput>;
```

Confirm this API against the Zod version you install. Expand to the complete
model: source permissions, raw observations, commercial terms, source listings,
verification history, runs and publication states. `schema-example.sql` only
illustrates a few important constraints; it is not the complete schema.

Keep money parsing exact. Example for a *previously extracted numeric token*,
not arbitrary page text:

```ts
export function decimalRupeesToPaise(token: string): number {
  if (!/^\d+(?:\.\d{1,2})?$/.test(token)) throw new Error("Invalid money token");
  const [whole, fraction = ""] = token.split(".");
  const paise = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  if (paise > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Money out of range");
  return Number(paise);
}
```

Currency-symbol/grouping interpretation belongs to a separate source-aware
parser. Never convert null into zero. The BigInt constructor avoids bigint-literal syntax under the current ES2017
TypeScript target; Node.js 24 supports this arithmetic at runtime.

Tests must demonstrate null preservation, invalid values, exact paise conversion,
fresh migration, repeat migration, foreign keys and replay constraints. Example:

```ts
import { expect, it } from "vitest";
import { decimalRupeesToPaise } from "@/src/modules/normalize/money";

it("converts decimal money without floating point rounding", () => {
  expect(decimalRupeesToPaise("1000.10")).toBe(100010);
  expect(() => decimalRupeesToPaise("1.001")).toThrow();
});
```

Configure Vitest aliases, don't assume the Next.js alias automatically applies.
Add scripts: `test` → `vitest run`, `typecheck` → `tsc --noEmit`, and a documented
`db:migrate` CLI. Use isolated PostgreSQL databases and the Compose persistent volume. Never run
tests against staging or production. See POSTGRESQL.md for safety checks.

**Gate:** fresh install, migration twice, tests, typecheck, lint and build pass.
No live scraping or production scheduler in this task.

## Phase 2 — One permitted source adapter

**Goal:** one source-specific adapter returns validated evidence without owning
the database. Create `docs/SOURCES.md` with permission/access review evidence.
The original candidate websites remain unapproved until investigated.

Add the adapter registry, context/result types from IMPLEMENTATION-PLAN.md,
request timeout/budget controls and a manual collector CLI. Choose official
API/feed before static HTML, then permitted Playwright only when necessary.
Create fixtures and extraction tests before the live request.

```ts
export interface SourceAdapter {
  readonly sourceId: string;
  collect(ctx: CollectionContext): Promise<CollectionResult>;
}

export const registry: ReadonlyMap<string, SourceAdapter> = new Map([
  // Register the first reviewed, tested adapter here. No fake live sources.
]);
```

Use source allowlists, redirect and destination checks, response-size limits,
bounded retries and cancellation. An HTML layout change is a failed extraction,
not evidence of an empty catalogue. Distinguish complete from partial pagination.

Introduce and document a command such as `npm run collect -- --source <id>`.
Its implementation must create run records and return a nonzero exit on failure;
it must not claim success when extraction never executed.

**Gate:** fixture tests cover codes, automatic offers, missing expiry, malformed
markup, timeouts, 403, pagination and empty snapshots. One approved live run
must pass, or report the precise source-access blocker. Fixture completion alone
does not make the live-source production release ready.

## Phase 3 — Daily reconciliation and reliability

**Goal:** rerunning collection updates evidence rather than multiplying pages.
Implement matching outcomes SAME_OFFER, POSSIBLE_DUPLICATE, DISTINCT_OFFER.
Match source-listing identity separately from commercial offer identity.

Use the orchestration pseudocode in IMPLEMENTATION-PLAN.md. Inside one short
transaction: verify current lock ownership, upsert listing, skip a replayed
observation, resolve identity, preserve historical observation links, update
publication state and write an outbox event. Fetch outside the transaction.

```ts
interface MatchDecision {
  outcome: "SAME_OFFER" | "POSSIBLE_DUPLICATE" | "DISTINCT_OFFER";
  candidateOfferId: string | null;
  reasons: string[];
  ruleVersion: string;
}
```

A code alone never proves SAME_OFFER. Unknown eligibility is not unrestricted
eligibility. Source outages never mass-expire records. Source-reported verification
never upgrades our independent verification. Keep partial-run statistics visible.

Test these integration scenarios:

1. Same run retry: one observation and no duplicated outbox work.
2. Same listing next day: same offer/listing, second observation.
3. Second source, proven same campaign: one offer, two attributions.
4. Same code, different bank/product/dates: review or distinct offer.
5. Reused listing ID: previous observation still references the previous campaign.
6. Failure/partial snapshot: no mass deletion or unsupported expiration.
7. Crash after commit: outbox recovers publication work.
8. Two workers and lease takeover: stale owner cannot write.

**Gate:** these tests plus normal checks pass. Daily CLI dry-run demonstrates a
repeatable report. Production scheduling waits until target-host setup in Phase 7.

## Phase 4 — Private administration

**Goal:** operators can diagnose runs and resolve uncertain data safely.
Choose actual server-side authentication; document deployment requirements.
Build run history, source health, evidence, duplicate review and manual verification.

Every admin read/write checks authorization on the server. Mutations record actor,
timestamp, reason and before/after identity. Add CSRF protections appropriate to
the selected session approach. Hiding buttons is not authorization.

**Gate:** unauthorized requests fail, duplicate resolution retains provenance,
manual verification is dated and scoped, and operational details are not exposed
by public endpoints. Verify browser and API paths independently.

## Phase 5 — Public API and professional design

**Goal:** a polished representative listing/detail before expanding templates.
Use Hallmark and daisyUI skills. Existing placeholder may be replaced in this
phase. Read the applicable daisyUI component guides and Hallmark review workflow.
Keep the page noindexed until Phase 6 passes.

Build database-backed store listing, offer detail, bounded search/filter API and
accessible copy/view interactions. No page-triggered scraping. No invented
inventory, verification badges or statistics. Handle empty, stale and expired states.

Route pattern, not complete implementation:

```tsx
// app/offers/[offerSlug]/page.tsx
import { notFound } from "next/navigation";
import { getPublishedOfferBySlug } from "@/src/modules/search/public-offers";

export default async function OfferPage({
  params,
}: { params: Promise<{ offerSlug: string }> }) {
  const { offerSlug } = await params;
  const offer = await getPublishedOfferBySlug(offerSlug);
  if (!offer) notFound();
  return <main><h1>{offer.title}</h1>{/* Complete terms and evidence UI here. */}</main>;
}
```

The helper is a contract to implement. It must exclude drafts, apply canonical
slug handling and use explicit fresh reads initially. Validate rendering/caching
APIs against installed Next.js docs. Do not freeze the catalogue to build-time IDs.

**Gate:** mobile/desktop design review, accessible controls, search/filter/detail/
copy/original-offer journeys pass with real stored data. Add a new eligible record
after build and verify that it renders without rebuilding.

## Phase 6 — SEO/GEO and publication policy

**Goal:** only useful canonical pages become indexable. Use installed seo-plan,
seo-programmatic and seo-geo. Their scores are heuristics, not ranking promises.

First set the real production brand/origin. Add unique metadata, canonical URLs,
truthful structured data, breadcrumbs, eligible sitemap entries and reviewed guides.
Use database-driven lastmod from actual content changes. Never use crawl time as
universal content freshness. Search/filter variants and drafts remain noindexed.

```ts
// Publication decision sketch; implement with reason codes and policy version.
function eligibleForIndex(offer: PublicationCandidate): boolean {
  return offer.publicationState === "PUBLISHED"
    && offer.hasTraceableEvidence
    && offer.hasUsefulDistinctConditions
    && !offer.unresolvedConflict
    && !offer.possibleDuplicate;
}
```

Share this policy between metadata and sitemap/read-model decisions. Handle
archive/expired records separately; a boolean is not the whole lifecycle policy.
Remove the placeholder's global noindex and disallow-all only as part of the
validated launch change. Keep admin authentication regardless of robots rules.

**Gate:** rendered metadata and HTML, redirects/404, crawler rules, sitemap,
new-record discovery and exclusion of draft/thin/duplicate records pass. Review
a small initial sample manually. Establish performance baseline; do not fabricate
rankings, traffic or citation metrics.

## Phase 7 — Second source and unattended deployment

**Goal:** prove extensibility and real daily operation.
Add a second approved adapter and cross-source tests. Choose persistent hosting;
use the PostgreSQL setup established in Phase 1. Test migrations
and integration behavior on the selected production DB.

Add the target host's scheduler: proposed 06:30 Asia/Kolkata = 01:00 UTC. Follow
the deployment example and locking rules in IMPLEMENTATION-PLAN.md. Configure
actual launcher paths, runtime activation, credentials, logs, timeouts, retries,
backup/restore, monitoring and missed-run alerts. Never assume the Codex dev
process is a production scheduler.

**Gate:** a scheduled run and repeated run succeed on target host, concurrent jobs
cannot duplicate writes, failure alerts work, outbox recovery works, backup restore
is exercised and successful sources survive another source's failure. Report any
external access/hosting prerequisite still missing.

## Copy-paste first task

```text
Read AGENTS.md, docs/AGENT-STEPS.md, docs/PROGRESS.md and the project specification.
Implement Phase 1 only. The old calculator cleanup is already complete.
State your file list and dependency/migration choices before editing. Keep the
coupon placeholder working. Add domain validation, exact money handling, PostgreSQL
migrations/repositories and fixture integration tests. Do not scrape sources,
build later screens, deploy or schedule jobs. Run migration twice, tests,
typecheck, lint and build. Update docs/PROGRESS.md with actual outcomes and stop.
```
