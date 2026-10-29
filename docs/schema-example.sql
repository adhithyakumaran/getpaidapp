-- Illustrative PostgreSQL 17 foundation, not the complete production schema.
-- Use a migration ledger; execute migrations via a dedicated migration role.

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS collection_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id),
  scheduled_slot TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN
    ('RUNNING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED')),
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  UNIQUE (source_id, scheduled_slot),
  UNIQUE (id, source_id)
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  public_slug TEXT NOT NULL UNIQUE,
  retailer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  code TEXT,
  min_spend_paise BIGINT CHECK (min_spend_paise IS NULL OR min_spend_paise >= 0),
  valid_until TIMESTAMPTZ,
  lifecycle TEXT NOT NULL DEFAULT 'UNKNOWN'
    CHECK (lifecycle IN ('ACTIVE', 'EXPIRED', 'INACTIVE', 'UNKNOWN')),
  publication_state TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (publication_state IN ('DRAFT', 'REVIEW_REQUIRED', 'PUBLISHED', 'WITHHELD')),
  content_version INTEGER NOT NULL DEFAULT 1 CHECK (content_version >= 1),
  content_updated_at TIMESTAMPTZ NOT NULL
);

-- No UNIQUE(code): a code can recur across campaigns and restrictions.
CREATE TABLE IF NOT EXISTS source_listings (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id),
  source_listing_key TEXT NOT NULL,
  current_offer_id TEXT REFERENCES offers(id),
  original_url TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  UNIQUE (source_id, source_listing_key),
  UNIQUE (id, source_id)
);

-- Historical offer_id survives relinking a reused source listing.
CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  source_listing_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  offer_id TEXT REFERENCES offers(id),
  observed_at TIMESTAMPTZ NOT NULL,
  payload_json JSONB NOT NULL,
  FOREIGN KEY (run_id, source_id) REFERENCES collection_runs(id, source_id),
  FOREIGN KEY (source_listing_id, source_id) REFERENCES source_listings(id, source_id),
  UNIQUE (run_id, source_listing_id)
);

CREATE TABLE IF NOT EXISTS publication_outbox (
  id TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL REFERENCES offers(id),
  content_version INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  UNIQUE (offer_id, content_version)
);

CREATE INDEX IF NOT EXISTS source_listings_offer_idx ON source_listings(current_offer_id);
CREATE INDEX IF NOT EXISTS observations_offer_idx ON observations(offer_id, observed_at);
CREATE INDEX IF NOT EXISTS outbox_pending_idx ON publication_outbox(created_at)
  WHERE delivered_at IS NULL;

-- Implementation still needs: retailer/category foreign keys, eligibility and
-- discount fields, per-field evidence, verification history, duplicate review,
-- source permissions, run statistics, fenced ownership, lifecycle audit and
-- a schema-migration ledger. Add these incrementally with integration tests.
