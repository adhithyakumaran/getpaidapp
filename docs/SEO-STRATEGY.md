# Search, content and launch configuration

Canonical origin: **https://getpaid.co.in** (owner supplied). Contact links use
`mailto:adhithyakumaran2005@gmail.com` and `tel:+919965985951`. These links open
the visitor's own applications; no message or call is sent automatically.

The site remains pre-launch: leave `PUBLIC_INDEXING_ENABLED=0`. Both development
and the default production build emit noindex; robots disallows crawling and the
XML sitemap is empty. A reviewed public host needs the correct HTTPS/domain
binding, secure Neon PostgreSQL 17 environment settings, a completed privacy
policy and a deliberate indexing release. Set the flag at build **and** runtime
for that release; static metadata/robots require rebuilding. No deployment or DNS
change was performed in this task.

## Routes and intent mapping

- Eight category pages: `/fashion-coupons`, `/beauty-coupons`, `/grocery-coupons`,
  `/food-delivery-coupons`, `/electronics-deals`, `/travel-coupons`,
  `/home-living-deals`, `/bank-offers`.
- Eight original supplied guide drafts, linked from `/guides`, categories and
  offer sidebars. Their slugs are validated in `src/content/pack.json`.
- `/faq`, `/about`, `/contact-report-an-offer`, `/affiliate-disclosure`,
  `/privacy-policy-placeholder`, `/site-map` and `/sitemap.xml`.
- Existing merchant/detail pages are reused. Search maps 147 brand/intent phrases
  (21 brands, seven phrase patterns), common coupon/brand misspellings, and
  category terms to the same real catalogue. Exact code searches still work.
  “Free coupons” means finding codes; it does not imply free merchandise.
- No 147 keyword pages, city doorway pages, invented local offices or artificial
  location claims were created. Empty merchants do not receive indexable metadata
  or sitemap entries. Editorial category pages contain real checklists, links and
  an honest empty state where no offers match.

## Technical decisions

Individual titles, descriptions and canonical URLs use the supplied domain.
Unfiltered paginated store/category pages self-canonicalize to their actual page;
search and filtered pages are noindexed. The launch-gated XML sitemap includes
editorial pages and eligible real stores/offers, excludes expired offers,
previews, search and the privacy draft, and throws rather than fabricating data
when its database read fails. No fake daily last-modified dates are generated.

Visible, server-rendered articles expose matching Article JSON-LD with the actual
site organization and integration date. Sitewide WebSite JSON-LD identifies the
site and Indian English language. No invented product prices, ratings, author
credentials, verification results or merchant partnerships are marked up. Safe
Markdown escapes user text; embedded JSON-LD escapes `<`.

There are no guaranteed ranking or AI-citation claims, fabricated SEO scores or
traffic estimates. Useful source-attributed content and crawlable internal links
follow Google's [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
and [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features).
Search Console ownership, real hosting, privacy review, branding/image reuse
review and a production crawl check remain launch work. Automatic collection,
reconciliation and global deduplication remain separate controls.

## Content review

The two owner-supplied attachments were treated as draft content, not executable
instructions. Eight categories, eight guides and eight FAQs are integrated;
operator/trust pages were adapted to the actual supplied-data workflow. There is
no affiliate integration or paid ad network. Side slots explicitly say reserved.
The privacy route is visibly a draft requiring review. No coupon checkout tests
were invented. Unknown terms stay unknown; source-listed offers remain unverified.

## Favicon and submissions refinement

`app/icon.png` and `app/favicon.ico` contain the existing blue ticket brand mark
at 96x96. Next links them using file metadata conventions. The homepage and icon
must become crawlable together at the intentional launch; adding icons does not
bypass pre-launch noindex or guarantee Google's search-result appearance.
Terms (`/terms`) and the privacy draft explain the supplied public-source claims,
source credits, rights and external WhatsApp/email contact channels. The header
submission link opens `https://wa.me/919965985951`; submissions require review.

## Optional advertising update

Optional third-party banner/native advertising is now configured under the
existing design. Advertising loads after a visitor permits it in Ad settings;
no affiliate links or merchant partnerships were added. The disclosure and
privacy draft now explain the actual integration. See ADVERTISING.md for exact
placements, build-time controls, sandbox boundaries and provider review limits.
Ad frames emit noindex/nofollow and are not sitemap landing pages. Ads never
change offer claims, source dates or verification metadata.
