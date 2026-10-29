CREATE TABLE stores (id text PRIMARY KEY, name text NOT NULL CHECK (btrim(name) <> ''), slug text NOT NULL UNIQUE);
CREATE TABLE categories (id text PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE);
CREATE TABLE sources (
 id text PRIMARY KEY, name text NOT NULL, enabled boolean NOT NULL DEFAULT false,
 permission text NOT NULL DEFAULT 'UNREVIEWED' CHECK (permission IN ('UNREVIEWED','APPROVED','DENIED')),
 permission_evidence text, reviewed_at timestamptz, access_method text CHECK (access_method IN ('API','FEED','HTML','BROWSER')),
 allowed_hosts text[] NOT NULL DEFAULT '{}', attribution text,
 request_budget integer NOT NULL CHECK (request_budget > 0), timeout_ms integer NOT NULL CHECK (timeout_ms > 0),
 CHECK (NOT enabled OR permission = 'APPROVED'),
 CHECK (permission <> 'APPROVED' OR (nullif(btrim(permission_evidence),'') IS NOT NULL AND reviewed_at IS NOT NULL AND access_method IS NOT NULL AND cardinality(allowed_hosts)>0))
);
CREATE TABLE collection_runs (
 id text PRIMARY KEY, source_id text NOT NULL REFERENCES sources(id), scheduled_slot timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING','SUCCESS','PARTIAL_SUCCESS','FAILED')),
 started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
 records_discovered integer NOT NULL DEFAULT 0 CHECK (records_discovered >= 0),
 records_extracted integer NOT NULL DEFAULT 0 CHECK (records_extracted >= 0),
 records_normalised integer NOT NULL DEFAULT 0 CHECK (records_normalised >= 0),
 duplicates_detected integer NOT NULL DEFAULT 0 CHECK (duplicates_detected >= 0),
 records_rejected integer NOT NULL DEFAULT 0 CHECK (records_rejected >= 0),
 errors jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(errors)='array'),
 completeness text CHECK (completeness IN ('COMPLETE','PARTIAL')), snapshot_authoritative boolean NOT NULL DEFAULT false,
 UNIQUE(source_id,scheduled_slot), UNIQUE(id,source_id), CHECK (finished_at IS NULL OR finished_at >= started_at),
 CHECK ((status='RUNNING' AND finished_at IS NULL) OR (status<>'RUNNING' AND finished_at IS NOT NULL))
);
CREATE TABLE offers (
 id text PRIMARY KEY, public_slug text NOT NULL UNIQUE, retailer_id text NOT NULL REFERENCES stores(id),
 title text NOT NULL CHECK (btrim(title)<>''), description text,
 kind text NOT NULL CHECK (kind IN ('CODE','AUTOMATIC','BANK','CASHBACK')), code text CHECK (code IS NULL OR btrim(code)<>''),
 discount_type text CHECK (discount_type IN ('PERCENTAGE','FIXED','FREE_SHIPPING','OTHER')),
 discount_bps integer CHECK (discount_bps BETWEEN 0 AND 10000),
 discount_paise bigint CHECK (discount_paise BETWEEN 0 AND 9007199254740991),
 min_spend_paise bigint CHECK (min_spend_paise BETWEEN 0 AND 9007199254740991),
 max_discount_paise bigint CHECK (max_discount_paise BETWEEN 0 AND 9007199254740991),
 currency text CHECK (currency='INR'), eligibility jsonb NOT NULL CHECK (jsonb_typeof(eligibility)='object'),
 valid_from timestamptz, valid_until timestamptz,
 lifecycle text NOT NULL DEFAULT 'UNKNOWN' CHECK (lifecycle IN ('ACTIVE','EXPIRED','INACTIVE','UNKNOWN')),
 publication_state text NOT NULL DEFAULT 'DRAFT' CHECK (publication_state IN ('DRAFT','REVIEW_REQUIRED','PUBLISHED','WITHHELD')),
 content_version integer NOT NULL DEFAULT 1 CHECK (content_version>0),
 content_updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (kind<>'CODE' OR code IS NOT NULL), CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_from<=valid_until)
);
CREATE FUNCTION protect_offer_slug() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.public_slug IS DISTINCT FROM OLD.public_slug THEN RAISE EXCEPTION 'Offer slug is immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER offer_slug_immutable BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION protect_offer_slug();
CREATE TABLE offer_categories (offer_id text REFERENCES offers(id), category_id text REFERENCES categories(id), PRIMARY KEY(offer_id,category_id));
CREATE TABLE source_listings (
 id text PRIMARY KEY, source_id text NOT NULL REFERENCES sources(id), source_listing_key text NOT NULL CHECK(btrim(source_listing_key)<>''),
 current_offer_id text REFERENCES offers(id), original_url text NOT NULL CHECK (original_url ~ '^https://'),
 first_seen_at timestamptz NOT NULL, last_seen_at timestamptz NOT NULL,
 last_successful_fetch_at timestamptz, last_http_status integer CHECK(last_http_status BETWEEN 100 AND 599),
 extraction_status text NOT NULL DEFAULT 'UNKNOWN' CHECK (extraction_status IN ('UNKNOWN','SUCCESS','FAILED')),
 source_metadata jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(source_metadata)='object'),
 UNIQUE(source_id,source_listing_key), UNIQUE(id,source_id), CHECK(last_seen_at>=first_seen_at)
);
CREATE TABLE observations (
 id text PRIMARY KEY, run_id text NOT NULL, source_listing_id text NOT NULL, source_id text NOT NULL,
 offer_id text REFERENCES offers(id), observed_at timestamptz NOT NULL, original_url text NOT NULL CHECK(original_url ~ '^https://'),
 raw_evidence jsonb NOT NULL CHECK(jsonb_typeof(raw_evidence)='object'),
 normalized jsonb NOT NULL CHECK(jsonb_typeof(normalized)='object'), normalization_version text NOT NULL,
 raw_date_text text, interpreted_timezone text, source_reported_verification text,
 field_provenance jsonb NOT NULL CHECK(jsonb_typeof(field_provenance)='object'),
 FOREIGN KEY(run_id,source_id) REFERENCES collection_runs(id,source_id),
 FOREIGN KEY(source_listing_id,source_id) REFERENCES source_listings(id,source_id), UNIQUE(run_id,source_listing_id)
);
CREATE TABLE verification_records (
 id text PRIMARY KEY, offer_id text NOT NULL REFERENCES offers(id),
 method text NOT NULL CHECK(method IN ('SOURCE','MANUAL','CHECKOUT')),
 status text NOT NULL CHECK(status IN ('UNVERIFIED','SOURCE_REPORTED','MANUALLY_VERIFIED','CHECKOUT_VERIFIED','FAILED')),
 attempted_at timestamptz NOT NULL, actor text NOT NULL, evidence jsonb NOT NULL CHECK(jsonb_typeof(evidence)='object'),
 failure_reason text, verifier_version text NOT NULL,
 CHECK(method<>'SOURCE' OR status IN ('SOURCE_REPORTED','UNVERIFIED')),
 CHECK(status<>'MANUALLY_VERIFIED' OR method='MANUAL'), CHECK(status<>'CHECKOUT_VERIFIED' OR method='CHECKOUT'),
 CHECK(status<>'FAILED' OR nullif(btrim(failure_reason),'') IS NOT NULL)
);
CREATE TABLE source_leases (
 source_id text PRIMARY KEY REFERENCES sources(id), owner text NOT NULL, token bigint NOT NULL CHECK(token>0), expires_at timestamptz NOT NULL
);
CREATE TABLE duplicate_reviews (
 id text PRIMARY KEY, offer_id text NOT NULL REFERENCES offers(id), candidate_offer_id text NOT NULL REFERENCES offers(id),
 rule_version text NOT NULL, evidence jsonb NOT NULL, resolution text CHECK(resolution IN ('SAME_OFFER','DISTINCT_OFFER')),
 resolved_by text, resolved_at timestamptz, CHECK(offer_id<>candidate_offer_id),
 CHECK ((resolution IS NULL AND resolved_by IS NULL AND resolved_at IS NULL) OR (resolution IS NOT NULL AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL))
);
CREATE TABLE offer_audit (
 id text PRIMARY KEY, offer_id text NOT NULL REFERENCES offers(id), actor text NOT NULL, reason text NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now(), before_state jsonb, after_state jsonb NOT NULL
);
CREATE TABLE publication_outbox (
 id text PRIMARY KEY, offer_id text NOT NULL REFERENCES offers(id), content_version integer NOT NULL CHECK(content_version>0),
 created_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz, attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
 UNIQUE(offer_id,content_version)
);
CREATE INDEX source_listings_offer_idx ON source_listings(current_offer_id);
CREATE INDEX observations_offer_idx ON observations(offer_id,observed_at);
CREATE INDEX verification_offer_idx ON verification_records(offer_id,attempted_at);
CREATE INDEX outbox_pending_idx ON publication_outbox(created_at) WHERE delivered_at IS NULL;
