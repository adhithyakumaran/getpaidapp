<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Coupon Intelligence: working agreement

Read `docs/AGENT-STEPS.md` first, then `docs/IMPLEMENTATION-PLAN.md` and
`docs/PROJECT-SPEC.md`. The former calculator application has been removed by
the owner's request. Do not restore calculator routes or old branding.

- Work incrementally: implement only the milestone requested by the owner.
- State file changes and acceptance criteria before each milestone; finish with
  exact checks, results, limitations and an updated progress record.
- Use this existing isolated checkout. Do not create a worktree unless requested.
- The current homepage is a placeholder, not a completed public coupon product.
- Collectors run outside page requests. No source is approved or integrated yet.
- Missing conditions remain unknown; fixture data must not appear as real offers.
- Preserve provenance, history, replay safety and evidence-based verification.
- Do not merge offers on title or code alone. Do not expire offers after a failed fetch.
- Use `.agents/skills/daisyui` for UI primitives. Use Hallmark when designing the
  public screens in Phase 5, and the installed SEO skills for Phase 6.
- Do not run a full redesign, deploy, publish, or implement later phases as a side
  effect of a foundation task. No automatic account creation or checkout automation.
- Tests use fixtures; approved live-source checks are separate and explicitly reported.
- Keep pre-launch noindex/crawl restrictions until the publication milestone.
- Append milestone results to `docs/PROGRESS.md`. Never mark unrun checks as passed.

- PostgreSQL 17 is required from the first database milestone in development, CI,
  staging and production. Read `docs/POSTGRESQL.md`. Do not introduce SQLite or
  plan a later engine migration. Engineering phases are steps to one production
  release, not v1/v2 products. Test only against a dedicated disposable database.
