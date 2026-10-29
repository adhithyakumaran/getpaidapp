# Coupon Intelligence

Pre-launch coupon application with a PostgreSQL foundation, supplied-data imports,
brand catalogues and masked reveal/copy screens. Automatic collection is separate.

Use Node.js 24 and PostgreSQL 17 in every environment. Install with `npm ci`.
Follow [PostgreSQL setup](docs/POSTGRESQL.md) to create `.env.local`, start the
persistent development database and separate disposable test service, then run:

```sh
npm run db:migrate
npm run db:migrate
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

`npm test` includes real PostgreSQL integration tests and refuses to skip them
when configuration is missing. All data in `tests/fixtures/` is synthetic and
never loaded into the development catalogue or application catalogue.
See [progress](docs/PROGRESS.md) and [engineering steps](docs/AGENT-STEPS.md).

Manual collection is implemented for an Amazon seller Promotions API contract,
but live use is blocked pending seller authorization and reviewed data rights.
See [source permissions and prerequisites](docs/SOURCES.md). After PostgreSQL setup:

```sh
npm run db:migrate -- --test
npm run collect -- --source amazon-in-promotions --fixture
```

This offline command stores clearly marked synthetic observations only in the
dedicated disposable database. The live command without `--fixture` records a
FAILED run and exits nonzero while the source is unapproved. It never silently
falls back to fixtures. No scheduler or automatic collected inventory
has been enabled.

The frontend has home, search, brand/store and offer-detail screens. Approved supplied
records can appear independently of collector permission and reconciliation.
Pages never run collection. All pages remain noindexed.

For labelled synthetic demonstrations, set `ENABLE_UI_PREVIEW=1` in your ignored
local `.env.local`, run `npm run dev`, and open `/preview`. Production returns 404
even with this flag enabled. Demos are never seeded into the application database;
their redemption links stay inside the preview. Public pages never show fixtures
or drafts.

Install Chromium with `npx playwright install chromium`, then run
`npm run test:browser` for development interactions, responsive screenshots and
automated accessibility checks. After building, `npm run test:browser:production`
checks the production preview guard. Both use the disposable test database.
Screenshots: `docs/screenshots/`. Hosted provisioning: [Neon](docs/NEON.md).

Owner-supplied coupons can be validated and imported independently of collectors.
See [the batch format and dry-run/publication commands](docs/IMPORTING.md).
Start with `npm run db:check -- --neon`; keep connection strings in ignored
`.env.local` and server-only host secrets. Never paste them into chat or commits.

The application is now connected to Neon PostgreSQL 17. The owner's supplied CSV
has 85 source-listed coupons available in regular pages and 27 ambiguous merchant
rows retained privately. They are unverified claims, not checkout-tested coupons.
Run `npm run dev` and open `http://localhost:3000`; the separate `/preview` still
contains synthetic demonstrations only. Brand pages include real website images,
and coupon codes use masked reveal/copy controls. Website hosting remains pending.
