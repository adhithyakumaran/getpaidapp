# Source access register

## Owner-supplied CSV display (2026-10-29)

The owner supplied `india_coupon_codes_2026-10-29.csv` and requested display of its
candidate coupons. This is a manual import, not a collector integration. Eighty-five
identifiable-brand records are visible as source-listed/unverified claims; 27
ambiguous merchant rows remain private. Raw cells and evidence references are
retained. Source-listed dates/conditions are not independent checkout verification.

The exact original GrabOn/Zoutons URLs are allowlisted for attribution links in
`src/modules/catalogue/brands.ts`. They are **not** approved collection endpoints.
No source permissions were changed or inferred from public access. No automatic
coupon requests, scheduler or collector publication was enabled by this workflow.

Actual brand website icons and two official Open Graph brand images were fetched
at the owner's explicit request. `public/brands/manifest.json` records original
website/asset URLs, retrieval times and SHA-256 hashes. A few website icons use
the public favicon cache when the direct site did not expose an accessible icon.
No logos or promotional campaign images were invented. Assets identify merchants;
trademarks remain their owners', and no affiliation or broad reuse license is claimed.
Confirm applicable brand-asset requirements before public deployment.

The earlier access review below remains the policy for automatic collection.

Reviewed 29 October 2026. This is an engineering access review, not a grant of
permission. No source is currently approved for live collection or republication.
Research used public documentation/terms, not a coupon crawl or checkout test.
No third party was contacted and no account was created.

| Candidate | Official access/reuse evidence | Decision and prerequisite |
| --- | --- | --- |
| Amazon India | [Creators API introduction](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/introduction), [API usage/cache guidance](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/concepts/best-programming-practices), [India Associates policies](https://affiliate-program.amazon.in/help/operating/policies) | Creators API requires Associates enrollment, qualifying sales, registration and credentials. It is product advertising access, not blanket permission for a permanent coupon archive. Program-specific attribution and retention rules need review before use. No credentials supplied. |
| GrabOn | [Terms of use](https://www.grabon.in/terms-of-use/) | Terms restrict scraping, automated access, aggregation and reuse without written permission. No public licensed feed/API was established in this review. Obtain explicit collection/republication rights and a supported endpoint; do not crawl. |
| CouponDunia | [Terms/service](https://www.coupondunia.in/terms-service) | The direct terms response returned a country-availability message; indexed material describes a consumer cashback service, not an API licence. Full applicable terms, licensed API/feed access, attribution and quotas remain unconfirmed. Do not bypass the geographic restriction. |
| DesiDime | [MerchantHub terms](https://business.desidime.com/terms) | The merchant product's terms restrict automated downloads without express permission. They are not a licence for the public community catalogue. The guessed public terms URL was inaccessible; no reusable public feed/API entitlement established. Request the applicable community-data agreement and API/feed. |
| Zoutons | [Terms](https://zoutons.com/tnc) | Consumer access and ownership provisions do not establish permission to collect/republish the catalogue. No licensed public API/feed established. Obtain a written data/access agreement and supported contract. |
| GoPaisa | [Terms and conditions](https://www.gopaisa.com/terms-n-conditions) | Prior written permission is required for copying/redistribution; consumer use is not commercial reuse permission. Obtain a licensed feed/API agreement including cashback semantics and quotas. |

Absence of a discovered feed is not proof that none exists. None of these sites'
robots policies were treated as a content licence. Approved live URLs and request
limits for all six candidates: **none**. Current production request allowance: zero.

## Selected conditional implementation: Amazon India seller Promotions API

Source ID: `amazon-in-promotions`. This is a documented official API route,
not a retailer HTML scraper and not a marketplace-wide coupon feed. It exposes
only the authorizing seller's promotions. It is a suitable technical route only
if a participating electronics seller and Amazon permit the intended use.
It remains UNREVIEWED/disabled in the registry; supplying a token does not approve it.

Primary contracts reviewed:

- [Promotions overview](https://developer-docs.amazon/sp-api/lang-us/docs/promotions-api)
- [Amazon-maintained API model, 2025-12-01](https://github.com/amzn/selling-partner-api-models/blob/main/models/promotions-api-model/promotions_2025-12-01.json)
- [Selling partner authorization](https://developer-docs.amazon/sp-api/lang-en_en/docs/authorize-public-applications)
- [Developer registration](https://developer-docs.amazon.com/sp-api/lang-en_EN/docs/sp-api-registration-overview)
- [Regional endpoints](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints)
- [SP-API policies and agreements](https://developer-docs.amazon/sp-api/docs/policies-and-agreements)
- [LWA authentication without AWS signing](https://developer-docs.amazon/sp-api/lang-es_ES/changelog/sp-api-will-no-longer-require-aws-iam-or-aws-signature-version-4)

Some documentation reference pages returned 403/inaccessible responses in the
research tool; the official public API model was successfully read. Its Apache-2.0
model licence covers the specification, not merchant promotion data or resale rights.
The adapter is original implementation code based on that documented contract.

**Precise external blockers:** an Amazon-registered SP-API app with the relevant
Pricing or Product Listing role, seller authorization for the India marketplace
`A21TJRUUN4KGV`, a valid short-lived LWA access token, a reviewed list of up to ten
electronics ASINs in that seller's scope, and explicit documented permission for
collection, raw-evidence retention and commercial republication/attribution.
API authentication alone does not establish these data rights. Confirm the endpoint
supports the seller's India account and promotion types with an authorized live test.
The application intentionally does not perform OAuth enrollment or account creation.

Candidate endpoint, **not approved for live use**:
`https://sellingpartnerapi-eu.amazon.com/promotions/2025-12-01/promotions`.
The planned request fixes marketplaceIds, locale=en_IN, revision=PUBLISHED,
statuses=RUNNING,UPCOMING, limit=20 and approved ASIN filters; only paginationToken
changes between pages. No arbitrary request URL is accepted from the CLI.

The documented search default is 0.1 requests/second with burst 4. Implementation
uses serial requests separated by at least 10 seconds, no bursts, at most ten
HTTP requests total (including redirects and retries), two retries per operation,
10-second request timeouts, a 512 KiB response cap and at most two redirects.
These are conservative provisional ceilings, **not granted quotas**. A reviewed
agreement and actual API usage plan may require lower limits. Long Retry-After
values stop the run instead of retrying earlier than instructed.

Attribution is not finalized because no grant exists. Before enabling the source,
record the seller/source credit, required Amazon notices and permitted customer
links. Retain the API request URL and promotion ID as internal provenance; it is
not presented as a shopper-facing redemption URL. promotionTitle is a seller-facing
label; it is stored only as unreviewed observation data, never published directly.
Individual claim codes unavailable from the API are rejected rather than invented.
COUPON promotions that require clipping are rejected until the domain can represent
that redemption action; their missing code is not described as automatic redemption.
Unknown discount, minimum spend, expiry and customer eligibility remain unknown.

## Fixture-only operation

`tests/fixtures/amazon-promotions/` contains hand-authored synthetic API responses.
They are not saved retailer pages or evidence of live API access. The separate
source ID `amazon-in-promotions-fixture`, synthetic titles and evidence marker make
that distinction explicit. Fixture mode cannot call the network and can connect
only to the existing allowlisted disposable test database/role. It creates source
listings and observations with no matched commercial offer, no verification
upgrade, no publication and no outbox work.

```sh
npm run db:migrate -- --test
npm run collect -- --source amazon-in-promotions --fixture
```

The manual live command below records a FAILED run and exits nonzero with
SOURCE_NOT_APPROVED; it sends zero HTTP requests while the registry is blocked:

```sh
npm run collect -- --source amazon-in-promotions
```

No environment flag can turn permission into approval. After a real agreement,
review the registry entry, source metadata, allowed endpoint/query scope, attribution,
retention and quotas in code; provision the corresponding approved database source
configuration and bind the token securely. Revalidate the adapter with a permitted
live response before claiming live-source readiness. Do not paste tokens into chat,
command arguments, fixtures or logs.

## Evidence and failure semantics

Extraction is independent of SQL and Next.js. Each accepted item carries the
original request URL, source listing key, UTC observation instant, normalization
version and SHA-256 reference to its raw JSON evidence. The collector stores that
evidence in observations using existing PostgreSQL repositories. Complete means
all pages of the narrow seller/ASIN query were read, not an authoritative snapshot
of Amazon. snapshotAuthoritative stays false. A page-count discrepancy, rejected
record, repeated token, budget exhaustion or failed next page produces PARTIAL
or FAILED, not a complete empty catalogue. A cancelled run exits nonzero.

The manual collector appends evidence and run statistics. It never deletes,
expires, publishes, merges or relinks existing commercial offers. Global campaign
matching, daily scheduling and publication remain Phase 3 or later.
