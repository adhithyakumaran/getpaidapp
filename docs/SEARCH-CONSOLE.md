# Search Console URLs and crawl configuration

Canonical website: https://getpaid.co.in

Submit **https://getpaid.co.in/sitemap.xml** in Google Search Console's Sitemaps
report. For a URL-prefix property already showing `https://getpaid.co.in/`, enter
`sitemap.xml`. Use https://getpaid.co.in/robots.txt to inspect the crawl policy.
https://getpaid.co.in/site-map is the visitor-facing directory, not the XML file
to submit. [Google's sitemap submission guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#sitemap-submit).

## Verified live state, 2026-10-30

HTTPS GET checks returned HTTP 200 for the homepage, robots.txt and sitemap.xml.
The live robots file contained `Disallow: /`, the homepage emitted
`noindex, nofollow`, and the XML sitemap contained zero URLs. The live site is
therefore still using the pre-launch crawl policy; having a sitemap URL alone
does not enable indexing.

## Production setting

In Vercel, open the project's Settings → Environment Variables. Set
`PUBLIC_INDEXING_ENABLED` to `1` for **Production**, then redeploy Production.
It must be present at build and runtime because some metadata/robots output is
generated during the build. This value is a public feature flag, not a secret.
Do not change or expose DATABASE_URL for this task. Keep Development and Preview
at `0`; any Preview environment using the same flag must retain that separate
setting. Local development stays noindexed even if the flag is accidentally `1`.

After deploying the code and production flag, check:

1. `/robots.txt` returns HTTP 200 with `Allow: /`, the intended restricted paths,
   and `Sitemap: https://getpaid.co.in/sitemap.xml`.
2. `/sitemap.xml` returns HTTP 200 XML containing canonical public page URLs.
   Publicly eligible stored offers/merchants are included dynamically; expired
   offers, search, previews, the privacy draft and unfinished calendar are omitted.
3. The homepage and eligible canonical pages no longer emit `noindex`.
4. Submit `sitemap.xml` and use URL Inspection for important canonical pages.
   Submission is a discovery hint, not an indexing/ranking guarantee.

`app/robots.ts` already generates the root `/robots.txt` route. Its sitemap
directive is now present even while the production launch flag is off. Do not
add `public/robots.txt`, which would compete with this generated route. The
existing sitemap implementation and its publication gates remain unchanged.

## Important canonical pages

These are existing application routes. Store pages are eligible for the XML
sitemap only when they have eligible public offers; a route's existence does
not establish that it currently has offers or is indexable.

| Page | URL |
| --- | --- |
| Homepage | https://getpaid.co.in/ |
| Fashion coupons | https://getpaid.co.in/fashion-coupons |
| Beauty coupons | https://getpaid.co.in/beauty-coupons |
| Grocery coupons | https://getpaid.co.in/grocery-coupons |
| Food delivery coupons | https://getpaid.co.in/food-delivery-coupons |
| Electronics deals | https://getpaid.co.in/electronics-deals |
| Travel coupons | https://getpaid.co.in/travel-coupons |
| Home and living deals | https://getpaid.co.in/home-living-deals |
| Bank offers | https://getpaid.co.in/bank-offers |
| Myntra | https://getpaid.co.in/stores/myntra |
| AJIO | https://getpaid.co.in/stores/ajio |
| Amazon India | https://getpaid.co.in/stores/amazon-india |
| Flipkart | https://getpaid.co.in/stores/flipkart |
| Shopping guides | https://getpaid.co.in/guides |
| Frequently asked questions | https://getpaid.co.in/faq |
| About | https://getpaid.co.in/about |
| Contact and reporting | https://getpaid.co.in/contact-report-an-offer |
| Terms | https://getpaid.co.in/terms |
| Disclosure | https://getpaid.co.in/affiliate-disclosure |
| Visitor directory | https://getpaid.co.in/site-map |

Use actual offer URLs emitted by the sitemap instead of inventing offer slugs.
Do not submit filtered search URLs or `/preview` URLs for indexing. Calendar
routes `/tamilpanchangam` and `/en/tamilpanchangam` remain explicitly noindexed
while engine integration and validation are pending; they are not sitemap entries.

The source changes do not change Vercel environment settings, verify Search
Console ownership or submit to Google on the owner's behalf. A GitHub push may
trigger the project's configured Vercel deployment; the Production indexing flag
must still be set in Vercel and included in that deployment.
