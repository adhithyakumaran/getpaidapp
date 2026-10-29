# Coupon Intelligence Engine
## Developer Project Guide — Production Delivery

**Project type:** Coupon collection, aggregation, and verification platform
**Initial market:** India
**Initial category:** Amazon India electronics
**Architecture:** Collector engine first, public website second
**Development approach:** Modular, source-independent, test-driven
**Status:** Scope locked for production release

---

# 1. Project Overview

## 1.1 Vision

Build a coupon intelligence platform that automatically collects coupon codes, promotional offers, and discounts from multiple coupon websites, normalises the information, removes duplicates, tracks offer freshness, and presents the most relevant offers through a searchable interface.

The platform should reduce the effort required to find usable discounts across multiple coupon websites.

Instead of manually visiting numerous websites, users should be able to search one platform for relevant coupons and see:

- Coupon codes.
- Discount values.
- Minimum order requirements.
- Eligible products and categories.
- Offer expiration dates, when available.
- Original source websites.
- Last-seen timestamps.
- Verification status.
- Confidence and supporting evidence.

The long-term vision is to create a reliable coupon discovery platform with a reusable collection engine that can support multiple retailers and coupon sources.

## 1.2 Core problem

Existing coupon websites can be difficult to navigate because:

1. Offers are distributed across multiple websites.
2. The same coupon may appear on several websites.
3. Some coupons are expired or no longer applicable.
4. Eligibility conditions may be unclear.
5. Some offers require bank cards, specific products, or minimum spending.
6. Coupon listings do not always establish whether a code actually works.

Our platform should address these problems through structured collection, deduplication, evidence tracking, and honest verification labels.

## 1.3 Product objectives

The production release must:

1. Collect coupon data from at least one permitted source.
2. Store collected information in a structured database.
3. Preserve the original source URL and collection timestamp.
4. Normalise coupon information into a common schema.
5. Identify duplicate or potentially duplicate offers.
6. Track changes and freshness.
7. Provide a searchable dashboard.
8. Distinguish unverified offers from independently verified offers.
9. Support adding new source adapters without rewriting the core engine.
10. Provide automated tests for extraction, normalisation, and deduplication.

## 1.4 Non-goals for the production release

The following are explicitly excluded from the initial release:

- Supporting every coupon website.
- Guaranteed verification of every coupon code.
- Automated checkout or purchasing.
- Automatic account creation on retailer websites.
- Bypassing CAPTCHAs, authentication, or anti-bot protections.
- Browser extensions.
- Native Android and iOS applications.
- Affiliate revenue optimisation.
- AI-generated coupon codes.
- An advanced machine-learning ranking system.
- Public user-submitted coupons.
- Complex user accounts and personalisation.

These features may be considered later, after the core collection pipeline is stable.

---

# 2. Product Scope

## 2.1 Initial use case

A user wants to buy electronics from Amazon India.

They currently visit multiple coupon websites and manually inspect the offers.

Our platform should collect eligible information from supported sources and display a consolidated list.

Example search:

**Store:** Amazon India
**Category:** Electronics
**Keyword:** Headphones

The results page should show available offers, their conditions, source attribution, and verification status.

The system must not invent codes or imply that a coupon works when it has not been tested.

## 2.2 Initial data sources

Investigate the following websites as potential sources:

| Source | Initial purpose |
|---|---|
| GrabOn | Coupon and offer collection |
| CouponDunia | Coupon and deal collection |
| DesiDime | Community deal discovery |
| Zoutons | Coupon and offer collection |
| GoPaisa | Coupon and cashback offer discovery |
| Amazon India | Official promotional information, where accessible |

These are candidate integrations, not confirmed permissions or guaranteed extraction targets.

Before implementing a collector for a source, determine:

- Whether automated collection is permitted.
- Whether the site offers an official API, feed, or partnership integration.
- Whether its terms restrict automated access or reuse.
- Whether relevant information is available without authentication.
- Whether reasonable collection frequency is possible.

Use official feeds and APIs where available and appropriate.

If a source cannot be accessed permissibly or reliably, mark it as unsupported rather than implementing a workaround that bypasses its restrictions.

---

# 3. Technical Architecture

## 3.1 Recommended stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React + TypeScript | Search interface and admin dashboard |
| Backend API | Node.js + TypeScript | Search, coupon records, and administration |
| HTML parsing | Cheerio | Static HTML extraction |
| Browser automation | Playwright | Permitted dynamic-page interactions |
| Database | PostgreSQL 17 | Development, CI, staging and production from day one |
| Validation | Zod | Validate extracted and API data |
| Testing | Vitest | Unit and integration tests |
| API specification | OpenAPI | Document API contracts |
| Logging | Structured application logs | Diagnostics and collection monitoring |
| Scheduling | Simple scheduled worker initially | Periodic collection |
| Deployment | Development → staging → production | One production delivery with the same PostgreSQL schema and migrations |

Use current stable versions compatible with the selected Node.js LTS release.

Avoid unnecessary infrastructure in the first version. Redis, message queues, Kubernetes, and distributed workers are not required until actual workload justifies them.

## 3.2 High-level architecture

```text
             COUPON SOURCES
                    |
       +------------+------------+
       |            |            |
     Source A     Source B     Source C
       |            |            |
       v            v            v
    Collector    Collector    Collector
       |            |            |
       +------------+------------+
                    |
                    v
            RAW OBSERVATIONS
                    |
                    v
          EXTRACTION & VALIDATION
                    |
                    v
            NORMALISATION ENGINE
                    |
                    v
             DEDUPLICATION
                    |
                    v
             COUPON DATABASE
                    |
          +---------+---------+
          |                   |
          v                   v
    Verification          Search API
       Engine                 |
          |                   v
          +------------> WEB APPLICATION
```

Each component must have a clear responsibility.

Collectors retrieve source information. The normalisation engine converts it into a consistent format. The database preserves the information and its history. The verification engine evaluates evidence. The API exposes approved records to the website.

## 3.3 Design principle

**Source adapters must be independent of the coupon database and frontend.**

The core engine must not contain source-specific parsing logic.

Adding a new source should primarily require implementing a new adapter and its tests.

---

# 4. Repository Structure

Use a TypeScript monorepo with npm workspaces.

```text
coupon-intelligence/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── middleware/
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── domain/
│   │   └── src/
│   │       ├── coupon.ts
│   │       ├── source.ts
│   │       ├── verification.ts
│   │       └── errors.ts
│   │
│   ├── collectors/
│   │   └── src/
│   │       ├── contracts/
│   │       ├── registry/
│   │       └── adapters/
│   │
│   ├── normalizer/
│   │   └── src/
│   │
│   ├── deduplication/
│   │   └── src/
│   │
│   ├── verification/
│   │   └── src/
│   │
│   ├── database/
│   │   └── src/
│   │
│   └── shared/
│       └── src/
│
├── workers/
│   └── collector-worker/
│       └── src/
│
├── tests/
│   ├── fixtures/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── PROJECT-SCOPE.md
│   ├── ARCHITECTURE.md
│   ├── DATA-MODEL.md
│   ├── SOURCE-ADAPTER-GUIDE.md
│   ├── VERIFICATION-RULES.md
│   └── DEVELOPMENT-GUIDELINES.md
│
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

This structure is a starting point, not a requirement to create every directory immediately. Implement packages as they become necessary.

---

# 5. Coupon Data Model

The data model is one of the most important decisions in this project.

A coupon code, an offer, a source listing, and a verification attempt are different entities. They must not be treated as the same record.

## 5.1 Coupon entity

Represents the normalised promotional offer.

Suggested fields:

| Field | Type | Description |
|---|---|---|
| id | UUID or text | Internal identifier |
| store_name | Text | Retailer name |
| title | Text | Normalised offer title |
| description | Text | Offer description |
| code | Text, nullable | Promotional code |
| discount_type | Enum | Percentage, fixed amount, free shipping, other |
| discount_value | Numeric, nullable | Discount amount or percentage |
| currency | Text, nullable | Currency such as INR |
| minimum_order_value | Numeric, nullable | Minimum spend |
| maximum_discount | Numeric, nullable | Maximum applicable discount |
| category | Text, nullable | Product category |
| eligibility | JSON | Eligibility requirements |
| valid_from | Timestamp, nullable | Offer start |
| valid_until | Timestamp, nullable | Offer expiration |
| status | Enum | Active, expired, inactive, unknown |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last update |

A coupon may have no manually entered code. Automatic discounts and bank offers should be represented explicitly rather than assigned fabricated codes.

## 5.2 Source listing entity

Represents an offer as published by an individual source.

Fields:

- id
- coupon_id, when matched
- source_id
- source_url
- source_title
- source_description
- source_code
- first_seen_at
- last_seen_at
- last_successful_fetch_at
- last_http_status, where applicable
- extraction_status
- source_metadata

Preserve source-specific information even when several listings are consolidated into one coupon.

If a source changes its description or removes a coupon, the system should retain enough history to understand what happened.

## 5.3 Collection run entity

Every collection attempt should produce a record.

Fields:

- id
- source_id
- started_at
- finished_at
- status
- records_discovered
- records_extracted
- records_normalised
- duplicates_detected
- records_rejected
- error_summary

Possible run statuses:

- `RUNNING`
- `SUCCESS`
- `PARTIAL_SUCCESS`
- `FAILED`

This allows developers to identify broken collectors and measure collection reliability.

## 5.4 Coupon observation entity

Store individual observations when a source is checked.

An observation should contain:

- Coupon or source listing identifier.
- Observation timestamp.
- Extracted title and description.
- Extracted code, if available.
- Observed price or discount information, if applicable.
- Source availability.
- Relevant changes from the previous observation.

This provides an audit trail and prevents the system from losing all evidence when an offer changes.

## 5.5 Verification record

Each verification attempt should be a separate record.

Fields:

- id
- coupon_id
- verification_method
- verification_status
- attempted_at
- evidence_type
- evidence_reference
- failure_reason
- verifier_version

Do not overwrite verification history whenever a coupon is checked again.

A previously working coupon can stop working, and a previously unverified coupon can later become verified.

---

# 6. Source Adapter Contract

Every source adapter must implement a common interface.

Conceptually:

```typescript
interface CouponSourceAdapter {
  readonly sourceId: string;

  collect(
    context: CollectionContext
  ): Promise<CollectionResult>;
}
```

The actual interfaces should be defined in the domain and collector packages.

The collection context should provide:

- Run identifier.
- Cancellation signal.
- Source configuration.
- Request timeout.
- Permitted request limits.
- Logging interface.

The collection result should include:

- Discovered source listings.
- Extraction errors.
- Pagination information, where relevant.
- Collection statistics.
- Completion status.

## 6.1 Adapter responsibilities

An adapter should:

1. Retrieve permitted source content.
2. Extract relevant coupon listings.
3. Capture the original source URL.
4. Parse source-specific fields.
5. Record extraction failures.
6. Return structured source observations.

It should not:

- Write directly to arbitrary database tables.
- Modify frontend state.
- Determine the final global coupon ranking.
- Claim that a coupon works based solely on its appearance on the source website.
- Bypass access restrictions.

## 6.2 Extraction priority

For each source, investigate these methods in order:

1. Official API or feed.
2. Public structured data.
3. Accessible static HTML.
4. Permitted browser-based extraction.

Do not assume that a site exposing information in its browser necessarily permits automated collection or republication.

## 6.3 Failure handling

A failed source should not stop the entire collection run.

For example:

- Source A succeeds.
- Source B times out.
- Source C returns no eligible listings.

The overall run should record a partial success if appropriate.

Each source should have independent timeout, retry, and rate-limit policies.

Use bounded retries with exponential backoff for transient failures. Do not repeatedly retry permanent access-denied responses.

---

# 7. Normalisation Engine

Different websites describe the same offer differently.

The normalisation engine must transform source-specific observations into a consistent representation.

## 7.1 Normalisation rules

Implement the following:

- Trim leading and trailing whitespace.
- Standardise store names.
- Normalise currency values.
- Convert discount values to consistent numeric representations.
- Parse minimum purchase requirements where possible.
- Parse expiration dates only when supported by evidence.
- Standardise known category names.
- Preserve the original title and description.
- Record extraction confidence for ambiguous fields.

Do not convert missing values into fabricated defaults.

For example, an unknown minimum order value must remain unknown, not zero.

## 7.2 AI-assisted extraction

AI may be introduced later for difficult descriptions.

Potential tasks include:

- Extracting eligibility conditions from natural language.
- Categorising ambiguous offers.
- Identifying similar descriptions.
- Suggesting structured values for human review.

AI output must pass schema validation.

The system must not let an LLM invent discount amounts, codes, expiration dates, or eligibility conditions.

The first version should use deterministic extraction wherever possible.

---

# 8. Deduplication Engine

Multiple websites may list the same offer.

The platform should consolidate duplicate offers without destroying source attribution.

## 8.1 Matching strategy

Use multiple signals:

1. Normalised retailer.
2. Normalised coupon code.
3. Discount type and value.
4. Minimum order requirement.
5. Product eligibility.
6. Validity period.
7. Similarity between titles and descriptions.

A matching code is useful evidence but is not sufficient in every case. A code can be reused for different campaigns or product categories.

## 8.2 Duplicate outcomes

Each comparison should produce one of three outcomes:

- `SAME_OFFER`
- `POSSIBLE_DUPLICATE`
- `DISTINCT_OFFER`

Use deterministic rules for obvious matches.

For uncertain matches, preserve both records until sufficient evidence is available.

Never automatically merge two offers solely because their descriptions look similar.

## 8.3 Deduplication requirements

- Repeated collection of the same listing must be idempotent.
- Source URLs should be canonicalised carefully.
- Tracking parameters may be removed only when safe.
- Original URLs must be preserved.
- Database constraints should prevent duplicate source observations where appropriate.

---

# 9. Verification Engine

Verification is a core differentiator, so the status definitions must be precise.

## 9.1 Verification statuses

### `UNVERIFIED`

The offer was collected but has not been independently tested.

### `REPORTED_WORKING`

A credible, recent report indicates that the coupon worked.

This is a report, not a guarantee.

### `CONDITIONS_MATCHED`

The known offer requirements appear compatible with the supplied product and order information.

This does not prove that the retailer will accept the code.

### `CHECKOUT_VERIFIED`

The discount was successfully applied in an eligible checkout session, with the result recorded as evidence.

Verification must be scoped to the tested conditions. A code working for one account or product does not establish that it works universally.

### `EXPIRED`

The offer's expiration has been established by reliable evidence.

A missing listing alone is not sufficient to conclude that the coupon has expired.

### `INACTIVE`

Reliable evidence indicates that the offer is no longer active, but expiration may not be the precise reason.

### `UNKNOWN`

Available evidence is insufficient to determine the current state.

## 9.2 Verification rules

1. A source website's verified label must be stored as source-reported information, not automatically treated as our own verification.
2. Expiration dates must not be inferred without evidence.
3. Verification records must include timestamps.
4. Old verification evidence must not be presented as current.
5. Failed checkout attempts must record the relevant conditions and failure reason.
6. The user interface must explain the meaning of each status.
7. The system must never promise universal coupon validity.

## 9.3 production release verification approach

For the first release:

- Collect coupon listings.
- Display them as unverified.
- Preserve source-reported verification claims separately.
- Add manual administrative review.
- Support a verification record structure for future automated checkout testing.

Automated checkout verification is not a prerequisite for the initial collector release.

---

# 10. Public Website Requirements

The public website should be developed after the collector and database have a working end-to-end implementation.

## 10.1 Main pages

### Home page

Include:

- Search bar.
- Store directory.
- Product category directory.
- Recently collected offers.
- Recently checked offers.
- Popular stores, when supported by actual data.

Do not fabricate popularity statistics.

### Store page

Example: Amazon India.

Display:

- Available coupons.
- Automatic discounts.
- Bank offers.
- Category filters.
- Minimum order values.
- Expiration information.
- Source attribution.
- Verification status.

### Category page

Example: Electronics.

Allow users to browse offers for supported electronics retailers.

### Coupon details

Each offer should display:

- Offer title.
- Code, if applicable.
- Discount conditions.
- Minimum purchase.
- Eligibility.
- Expiration information.
- Original source links.
- Last-seen timestamp.
- Verification evidence or status.

### Search results

Support:

- Store filters.
- Category filters.
- Discount type filters.
- Verification status.
- Expiration status.
- Sorting by relevance, freshness, and discount value when sufficient data exists.

## 10.2 Copy coupon button

When a coupon has a code:

1. Copy the code to the clipboard.
2. Display a confirmation.
3. Provide a link to the relevant store or offer.

When the offer is automatic and has no code, display an appropriate action such as **View Offer** rather than a misleading copy button.

## 10.3 Admin dashboard

The production release requires a private administrative interface to:

- View collection runs.
- Inspect failed sources.
- View raw source observations.
- Inspect extracted coupons.
- Resolve possible duplicates.
- Review verification records.
- Disable unsupported sources.
- Mark records for manual review.
- Inspect last-seen timestamps.

Administrative access must be protected by authentication.

---

# 11. Backend API

Use versioned API routes.

Suggested endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /api/coupons` | Search and filter coupons |
| `GET /api/coupons/:id` | Retrieve coupon details |
| `GET /api/stores` | List supported stores |
| `GET /api/categories` | List available categories |
| `GET /api/sources` | List public source metadata where appropriate |
| `GET /api/health` | Health check |
| `GET /api/admin/collection-runs` | Inspect collection history |
| `POST /api/admin/collection-runs` | Trigger an authorised collection run |
| `GET /api/admin/coupons` | Inspect collected records |
| `POST /api/admin/verification-records` | Record an authorised verification result |

Admin endpoints must require appropriate permissions.

Public endpoints must never expose secrets, private source credentials, internal error traces, or sensitive operational information.

Implement pagination, input validation, sensible query limits, and consistent error responses.

The public API should return source attribution and verification status alongside the coupon details.

---

# 12. Database and Data Integrity

Use PostgreSQL 17 from the first database milestone. Development and tests use isolated local/CI PostgreSQL instances; staging and production use separate credentials and databases with the same migration history. See POSTGRESQL.md.

Implement migrations from the beginning.

Recommended logical tables:

- `stores`
- `categories`
- `sources`
- `coupons`
- `source_listings`
- `coupon_observations`
- `collection_runs`
- `verification_records`
- `admin_users`

Additional tables can be introduced when justified.

## Required integrity rules

- Use stable identifiers.
- Enforce appropriate foreign keys.
- Store timestamps in UTC.
- Preserve original source URLs.
- Record collection failures.
- Avoid duplicate source listings.
- Keep verification history.
- Use transactions for multi-step database updates.
- Never store credentials in source code.

The database layer must use PostgreSQL transactions and constraints from the start. No intermediate database engine or later conversion is planned. Use timestamptz for instants, jsonb for structured evidence, and integer paise for money.

---

# 13. Collection Scheduling and Reliability

The initial collector should run manually and through a simple configurable schedule.

Each source must have its own collection configuration.

Example:

```text
source: example-source
enabled: true
interval_minutes: 360
request_timeout_seconds: 20
max_retries: 2
```

This is an illustrative configuration, not a recommended universal policy for every website. Actual frequency must follow the source's rules and reasonable request limits.

## Operational requirements

- Enforce per-source request limits.
- Use bounded retries.
- Record collection start and completion times.
- Log errors without leaking secrets.
- Prevent overlapping runs for the same source when necessary.
- Support cancellation.
- Track records discovered and extracted.
- Alert administrators when a previously functioning adapter repeatedly fails.

Do not use distributed scheduling infrastructure until the number of sources and workload justify it.

---

# 14. Security, Compliance, and Source Attribution

This platform depends on third-party information. Collection must be designed responsibly.

## Required controls

1. Review the applicable terms and restrictions of every source.
2. Prefer official feeds and APIs when available.
3. Respect access restrictions and rate limits.
4. Do not bypass CAPTCHAs or authentication controls.
5. Do not collect private account information.
6. Validate and sanitise extracted content.
7. Escape user-facing content to prevent script injection.
8. Restrict administrative actions.
9. Keep secrets in environment variables or an appropriate secret store.
10. Preserve source attribution and link users to the original offers.

Before publishing collected information commercially, review the relevant source terms, intellectual property considerations, and any applicable affiliate or data licensing requirements.

A publicly accessible page is not automatically authorised for unrestricted automated collection or republication.

---

# 15. Testing Requirements

Testing must be part of the development process, not an activity postponed until launch.

## Unit tests

Test:

- Discount parsing.
- Currency parsing.
- Date parsing.
- Coupon normalisation.
- URL canonicalisation.
- Duplicate detection.
- Verification status transitions.
- Schema validation.

## Collector tests

Use saved HTML fixtures rather than relying exclusively on live websites.

Test:

- Successful extraction.
- Missing coupon codes.
- Automatic discounts.
- Missing expiration dates.
- Changed page structure.
- Empty listings.
- Malformed content.
- HTTP errors.
- Timeouts.
- Pagination where applicable.

Do not make automated tests depend on a live source being available.

## Integration tests

Test the complete pipeline:

```text
Fixture
  |
  v
Collector
  |
  v
Normaliser
  |
  v
Deduplication
  |
  v
Database
  |
  v
Search API
```

Verify that repeated collection of the same fixture does not create duplicate records.

## End-to-end tests

Test the website's main user journeys:

1. Open the home page.
2. Search for a store.
3. Filter by electronics.
4. Open a coupon.
5. View its conditions and source.
6. Copy a code where applicable.
7. Open the original offer.

---

# 16. Development Milestones

Implement the project in the following order.

## Milestone 1 — Repository and domain foundation

Deliverables:

- TypeScript monorepo.
- Build and test scripts.
- Domain types.
- Database schema and migrations.
- Initial documentation.
- Continuous integration checks.

**Acceptance criterion:** The project installs, builds, runs tests, and creates its database successfully.

## Milestone 2 — First collector

Select one source after checking its permitted access methods.

Deliverables:

- Source adapter.
- Collection context and result contracts.
- HTML fixtures.
- Extraction tests.
- Collection-run recording.
- Error handling.

**Acceptance criterion:** The adapter extracts real, permitted source data and produces structured records. If no source can be integrated permissibly, use fixtures to finish the pipeline while documenting the source-access limitation.

## Milestone 3 — Normalisation and database persistence

Deliverables:

- Normalisation rules.
- Database repositories.
- Source listing persistence.
- Coupon observation history.
- Duplicate detection.
- Transaction handling.

**Acceptance criterion:** Repeated collection does not create duplicate listings, and the original source evidence remains available.

## Milestone 4 — Verification and administration

Deliverables:

- Verification record model.
- Defined verification statuses.
- Collection history.
- Admin interface.
- Error reporting.

**Acceptance criterion:** The platform distinguishes source-reported claims from independent verification and never falsely labels an untested coupon as checkout verified.

## Milestone 5 — Search API and frontend

Deliverables:

- Search endpoint.
- Store and category filters.
- Coupon result cards.
- Coupon details.
- Copy-code interaction.
- Source links.
- Verification labels.

**Acceptance criterion:** A user can search and inspect collected offers through the application.

## Milestone 6 — Second source

Deliverables:

- A second independently tested adapter.
- Source-specific fixtures.
- Cross-source duplicate detection.
- Combined search results.

**Acceptance criterion:** The second source can be added without changing the domain model or rewriting the first adapter.

## Milestone 7 — production release hardening

Deliverables:

- Automated test suite.
- Input validation.
- Logging and diagnostics.
- Rate limiting.
- Access controls.
- Deployment documentation.
- Backup and recovery instructions.

**Acceptance criterion:** The production release can run reliably in a documented environment, and failures can be diagnosed without manually inspecting every database record.

---

# 17. Definition of Done

The production release is complete when all of the following are true:

- [ ] The repository has a documented setup process.
- [ ] The application uses TypeScript and has reproducible build scripts.
- [ ] At least one permitted source integration works.
- [ ] Coupons are stored in a structured database.
- [ ] Original source URLs are preserved.
- [ ] Collection runs are recorded.
- [ ] Duplicate listings are handled safely.
- [ ] Missing information is not fabricated.
- [ ] Verification status is evidence-based.
- [ ] The API supports coupon search and filtering.
- [ ] The website displays coupon conditions and provenance.
- [ ] Automated tests cover the critical pipeline.
- [ ] Failed collection runs are visible to administrators.
- [ ] Source-specific restrictions are documented.
- [ ] Another source can be added through the adapter interface.

---

# 18. Instructions for the Developer or AI Coding Agent

Use the following instructions when implementing this project.

1. Read this specification before making architectural decisions.
2. Treat the production release scope as fixed unless the project owner approves a change.
3. Implement incrementally rather than generating the entire application in one step.
4. Establish the repository and domain model before building the frontend.
5. Create tests alongside each core module.
6. Use fixtures for deterministic collector tests.
7. Do not invent coupon codes or claim unverified codes work.
8. Preserve the original source and observation history.
9. Keep source-specific extraction logic inside source adapters.
10. Avoid unnecessary dependencies and infrastructure.
11. Document limitations and assumptions explicitly.
12. Do not commit credentials or secrets.
13. Run the relevant tests after each meaningful change.
14. Update the README and architecture documentation when the implementation changes.
15. Do not silently expand the production release into a browser extension, mobile application, or affiliate marketing platform.

Before starting each milestone, state the intended changes and acceptance criteria. After implementation, report the files changed, tests executed, results, and known limitations.

---

# 19. Immediate Next Steps

The first implementation task is deliberately small.

**Task 1: Establish the repository foundation.**

1. Create the TypeScript workspace.
2. Configure linting, formatting, and tests.
3. Define the coupon, source, observation, and verification types.
4. Add the PostgreSQL schema and migrations.
5. Write tests for the core domain model.
6. Document how to run the project locally.

Do not begin by scraping every website.

Once the foundation is tested, investigate the first permitted source and build the first adapter against it.

This sequence keeps the project manageable and prevents source-specific scraping code from becoming tightly coupled to the entire application.

---

## Final Product Principle

The product should not compete merely by displaying more coupon codes.

Its long-term value should come from collecting useful offers, consolidating duplicate listings, retaining source evidence, tracking freshness, and being transparent about whether a discount has actually been verified.

**Build the collection engine first. Establish trust in the data. Then scale the source catalogue and launch the public coupon website.**
