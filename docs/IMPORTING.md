# Owner-supplied coupons

## Supplied CSV and multiple brands (2026-10-29)

The owner supplied `india_coupon_codes_2026-10-29.csv` and requested publication.
Of 112 candidate rows, **85** have identifiable merchants and were published as
unverified source-listed claims; **27** with ambiguous merchant labels are retained
privately in supplied_candidates. No checkout verification, expiry instant,
guaranteed saving or merchant identity was invented. Original CSV cell values are
retained in sourceRecord/candidate JSON; SHA-256 references identify the input.
Mixed promotional wording stays source text, not unsupported exact numeric terms.

```sh
npm run import:coupons -- --file /path/to/india_coupon_codes_2026-10-29.csv --publish
npm run import:coupons -- --file /path/to/india_coupon_codes_2026-10-29.csv --apply --publish
```

CSV uses that file's exact 14-column contract, supporting quoted commas, escaped
quotes, embedded newlines and UTF-8. Cells are data, never instructions or executed
formulas. Duplicate row identities, unexpected headers, oversized files or invalid
known records reject the batch. Pizza Hut Gift Cards and Zepto listing have explicit
brand mappings. Generic food/grocery/electronics labels and unidentified bundles
remain withheld. CSV --publish records the owner's supplied-data instruction, not
a third-party collection license or independent verification.

JSON now supports the brand IDs in catalogue/brands.ts and categories in
catalogue/model.ts. Reviewed display/link URLs include the exact GrabOn/Zoutons
listing pages in this CSV, registered merchant URLs and Amazon product URLs.
They are not permission to fetch these sources. CSV hashes and stored first
payloads preserve replay timestamps. Same codes at different merchants remain
distinct; same-merchant conflicts require review. Shared third-party listing URLs
alone are not duplicate evidence. Bulk writes make each applied batch one short,
atomic transaction; all private provenance and offer audit records commit together.

The app is connected to Neon PostgreSQL 17; no website host is deployed. The earlier
PostgreSQL 18 endpoint was inspected only and preserved. All migrations are additive.
The expanded registry/category/URL rules supersede the initial Amazon-only JSON
scope described below.

This workflow is independent of automatic collection and Amazon API authorization.
It imports files supplied by an operator; it does not fetch any source URL or claim
that the coupons were independently verified. There is no public import endpoint.

Store private batches under ignored `.data/imports/`, not in source control.
The documented synthetic example is `tests/fixtures/supplied-batch.json`; it is
safe only as a draft demonstration and cannot be published with synthetic=true.
Do not change that flag on an example to pretend it is a real offer.

## Batch format

JSON object, version=1, batchId and supplierId (lowercase letters/digits/hyphens,
at most 80 characters), supplierName, suppliedAt (ISO timestamp with offset),
explicit synthetic boolean, approval (null or the object below), and coupons
(1–500 records, whole file at most 2 MiB). Unknown JSON keys are rejected.

Each coupon needs externalId, category (audio/computers/phones/accessories),
originalUrl (an HTTPS Amazon India `/dp/ASIN` or `/gp/product/ASIN` product URL,
no query, hash or credentials), evidenceReference (your private evidence/file
reference), approved (defaults false), and terms. Do not submit a credential or
private evidence URL as the public originalUrl.

Terms require retailerId=amazon-india, title and kind (CODE/AUTOMATIC/BANK/CASHBACK).
CODE requires code. Other kinds must have code=null. Optional description, code,
discountType, discountBps, discountPaise, minSpendPaise, maxDiscountPaise, currency,
validFrom and validUntil default to **null**, not zero or unrestricted. Eligibility
defaults to an empty object, with optional customer-facing products, customers,
payment and redemption strings only. Missing expiry stays unknown. Use integer
paise and basis points (1000 = 10%); no floating-point money conversions occur.
PERCENTAGE requires discountBps; FIXED requires discountPaise and currency=INR.

For publication, the batch must be real (synthetic=false), individual records must
have approved=true, and approval must contain actor, reason, rightsBasis and
approvedAt. These are the operator's explicit review/rights attestation; they do
not turn into a “verified” badge. Approval/provenance dates may not be in the future.
Do not attest to rights or invent conditions that have not been supplied.

## Commands

```sh
npm run db:check -- --neon
npm run db:migrate
npm run import:coupons -- --file .data/imports/my-batch.json
npm run import:coupons -- --file .data/imports/my-batch.json --publish
npm run import:coupons -- --file .data/imports/my-batch.json --apply --publish
```

Without --apply this is a validating, database-backed **dry run** with no data
writes. --apply without --publish stores drafts. --apply --publish publishes only
approved records through the existing home/search/store/detail pages. Review the
dry-run report first. The CLI prints counts/reason codes, never coupon contents,
credentials or raw database errors. --test targets only the allowlisted disposable
test database; it never falls back to DATABASE_URL and does not reset any schema.

Each applied batch is atomic. The same supplierId/batchId, normalized payload and
publication choice replay as a no-op. Reusing that batch identity with changed
content or a different publication choice is rejected. To approve an existing
draft, submit a **new batchId**, retaining supplierId, externalId and exact coupon
content, with approval and approved=true. Existing published records are never
demoted by a later draft batch. Original supplied content is immutable in this
workflow; corrections require a future audited amendment workflow, not overwrites.

Duplicate detection uses stable supplier/external identities, exact commercial
fingerprints and conservative same-code/product candidates, including collected
offers. It never merges on code/title alone. Ambiguous candidates are rejected
with DUPLICATE_REVIEW_REQUIRED; no partial batch or destructive update is made.
Review legitimate campaigns with reused codes before importing them. The initial
command deliberately has no unsafe force/skip-duplicate switch.

Supplied evidence references, normalized payloads, batch digest, supplier,
submission timestamps and dated approval remain private in PostgreSQL. Publishing
writes an offer audit record. Public pages expose only validated conditions,
supplier attribution, public product URL and submission freshness. “Submitted on”
is distinct from a source observation or checkout verification. Expired supplied
records cannot be newly published. Synthetic imports cannot be public. Automatic
collected offers remain gated pending their separate authorization/reconciliation.

## Before hosting

No website host/domain is configured or deployed. The app requires a Node.js 24
Next.js host, `npm ci`/`npm run build`, `npm start`, and secure server-only
DATABASE_URL bindings. Provision separate Neon PostgreSQL 17 databases and
credentials for staging/production and a separate least-privilege migration job.
Never set TEST_DATABASE_URL or ENABLE_UI_PREVIEW on a public host. Current local
Neon credentials have no separate MIGRATION_DATABASE_URL binding; role separation
and grants must be verified before public deployment.

Keep noindex/robots restrictions until launch review. Before deployment verify
the actual supplied inventory, rights/attribution, duplicate decisions, stale and
expired behavior, safe outbound URLs, authenticated operator access, backups and
restore, error monitoring, connection limits and staging migration replay. Choose
the host/domain and review its exact runtime/secret settings separately. Daily
collection and source authorization do not block this manual supplied-data path.
