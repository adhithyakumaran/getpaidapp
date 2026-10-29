# Cleanup record

The owner requested that the repository retain only the coupon project.

Removed legacy application paths:

- `app/tools/`, `app/guides/`, `app/about/`
- `components/` (all former calculator/layout components)
- `lib/` (calculator functions, old content and brand configuration)
- `public/logo.png`, `app/icon.png`, `app/favicon.ico`, `app/opengraph-image.png`
- Old `app/sitemap.ts` (it advertised calculator URLs)

Replaced root page, layout, CSS, robots policy and README with the coupon
foundation. Retained framework configuration, package lockfile and installed
skills; installed daisyUI 5 and renamed package metadata to coupon-intelligence.

Before removal, tracked files had no local changes. Their previous versions
remain in Git. A verified tracked-file archive was also created outside the
checkout at `/workspace/backups/getpaid-before-coupon-cleanup.tar`. That archive
is local to this machine, not a portable backup or a Git commit.

Removed public routes now return 404. There were no supplied traffic/backlink
measurements or equivalent replacements to justify redirects. Before deployment
to an existing public domain, review URL history and add only relevant redirects
or intentional retirement responses. Do not redirect every retired URL to home.
