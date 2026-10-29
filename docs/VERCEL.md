# Vercel catalogue availability

## Incident verified on 29 October 2026

Fresh HTTPS requests to both getpaid.co.in and www.getpaid.co.in returned the
coupon application on Vercel, but zero offer cards and the catalogue error.
The apex redirects to www. The securely supplied local Neon connection passed
PostgreSQL 17, UTC, encrypted/certificate-verified connectivity checks. This
establishes a deployed server-side read failure; it does not establish which
private Vercel environment variable, grant or log entry is responsible. No Vercel
CLI login, token, linked project or connected Vercel management tool was available.

One reproducible application issue was corrected: standard Neon URLs containing
`sslmode=require` were previously rejected before connecting. The client now
normalizes that mode to `verify-full`, preserving certificate/hostname checks.
Explicitly weakened remote TLS and remote URLs without the required TLS setting
remain rejected. PostgreSQL 17, schema/migrations and existing data are preserved.

## Saved public listings

The owner authorized keeping supplied coupons in the application when the hosted
DB is unavailable. `src/content/public-offers.json` contains 85 approved public
supplied-offer projections, exported in one read-only repeatable-read transaction.
It excludes drafts, synthetic rows, unapproved/withheld offers, raw evidence,
batch/approval internals and credentials. Public attribution, original submission
dates, conditions, null commercial fields and unverified status are retained.

Production pages first query PostgreSQL. Only a read/configuration failure can
select the saved file. A successful empty result stays empty; the file is never
merged into live results. Development/test pages do not use it. Saved listings
show their capture date and a warning on listings and details. Search, filters,
seven-item pagination, detail routes, copy and expired/upcoming guards still work.
Snapshots do not claim a new observation, successful checkout or live-source
readiness. No collection is triggered by requests or build.

Refresh deliberately after approved import/withdrawal changes:

```
npm run catalogue:export
npm run test:browser:fallback
```

Review and commit the generated public JSON, then push/redeploy. The export
requires a configured PG17 DATABASE_URL and applies the existing public approval
policy; it never publishes additional rows or writes to the database. It is not
automatically regenerated in CI/build and never uses the disposable test DB as
a public seed. The last export contains 85 offers; no ambiguous CSV rows were
reclassified or published.

The file is a static, dated copy, not reconciliation. During a DB outage, later
withdrawals cannot be discovered from an old copy. Refresh/redeploy after changes,
or set `PUBLIC_CATALOGUE_SNAPSHOT=0` and redeploy to fail closed. Offer expiry is
still calculated against the current time; unknown expiry is not invented.

## Configure the actual hosted connection

In the Vercel project, Settings > Environment Variables, set DATABASE_URL for the
Production environment using the intended Neon PostgreSQL17 application role.
Use `sslmode=verify-full` (standard `require` is now securely strengthened).
Do not use NEXT_PUBLIC_DATABASE_URL, localhost, a CI/test DB, or a database18
endpoint. Apply the existing migration history with the separate migration role
if this is a new empty production database; never reset existing data.

Redeploy after changing secrets. Ignored .env.local does not travel in a Git push.
Do not paste credentials into issues, source files or chat. Server logs now show
only fixed diagnostic codes, including DATABASE_NOT_CONFIGURED,
DATABASE_TLS_CONFIGURATION, DATABASE_AUTHENTICATION, DATABASE_SCHEMA_MISSING,
DATABASE_PERMISSION, DATABASE_VERSION_UNSUPPORTED and DATABASE_UNREACHABLE.
Raw exception messages, URLs, credentials and operational details stay off pages.

[Vercel environment variable documentation](https://vercel.com/docs/environment-variables/managing-environment-variables)
confirms that environment changes affect new deployments and require redeploying.
No secret settings were changed by this task because account access was absent.

## Verification

`npm test` covers schema/privacy safeguards, saved-mode pagination/search/detail,
unknown/expired terms, secure TLS normalization and sanitized failure codes, in
addition to existing PostgreSQL integration tests. `npm run test:browser:fallback`
starts production with an explicitly empty DATABASE_URL, then an unreachable
synthetic endpoint, then fallback disabled. It verifies source-date warnings,
search/filter/pagination/detail/copy, fixture exclusion, mobile/desktop axe and
sanitized logs without any DB writes. The normal production browser suite also
verifies live DB reads and successful-empty/draft/synthetic isolation. CI runs
both suites; no deployment job is added.

## Observed rollout

Commit09e2c22 was pushed and the public Vercel domain recovered. Fresh HTTP and
real browser checks confirmed85 saved offers, seven main cards, Myntra page2,
exact-code search, detail/copy and mobile accessibility. Saved mode is visibly
active: private Vercel DB configuration remains unverified and still needs
attention for live updates, while the authorized bundled catalogue works.
