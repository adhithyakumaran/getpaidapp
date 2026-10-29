# Coupon Intelligence

An incremental replacement of the previous calculator website. Initial scope:
Amazon India electronics, one permitted source, then daily reconciliation and
a public coupon catalogue. The current homepage is a pre-launch placeholder;
there are no live coupons, collectors, database or scheduled jobs yet.
The database architecture is PostgreSQL 17 from development through production;
see [PostgreSQL setup](docs/POSTGRESQL.md). There is one production delivery,
implemented in ordered steps, without an intermediate database engine.

## Start here

1. Read [agent instructions](AGENTS.md).
2. Follow [the ordered implementation tasks](docs/AGENT-STEPS.md), one phase at a time.
3. Consult [the architecture and pipeline plan](docs/IMPLEMENTATION-PLAN.md).
4. Use [the original product specification](docs/PROJECT-SPEC.md) for domain rules.

## Development

Verified runtime: Node.js 24, npm 11.

```sh
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run dev -- --hostname 0.0.0.0
npm run lint
npm run build
```

For local browser checks use the hostname `localhost`; the current Next.js
development-origin check rejects numeric loopback origins under this binding.
daisyUI 5 is installed with Tailwind 4. Project skills are in `.agents/skills`;
Hallmark is currently installed globally in the onboarding machine. Its portable
installation command is recorded in the agent task guide.

The pre-launch page is noindexed, robots disallows crawling, and there is no
public sitemap. Configure production identity and replace these policies only
after the publication acceptance checks in Phase 6 pass.

## Cleanup

Removed legacy calculator pages/components, old articles, branding images,
metadata and sitemap. Kept the Next.js toolchain and installed skills. See
[the cleanup record](docs/CLEANUP.md). Historical implementation remains in Git.
