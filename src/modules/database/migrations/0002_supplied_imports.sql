-- Additive owner-supplied workflow. No existing records or migration bytes change.
CREATE TABLE supplied_batches (
 id text PRIMARY KEY, supplier_id text NOT NULL, external_batch_id text NOT NULL,
 supplier_name text NOT NULL CHECK(btrim(supplier_name)<>''), digest text NOT NULL CHECK(length(digest)=64),
 supplied_at timestamptz NOT NULL, received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 synthetic boolean NOT NULL, publication_requested boolean NOT NULL, approval jsonb,
 payload jsonb NOT NULL CHECK(jsonb_typeof(payload)='object'),
 UNIQUE(supplier_id,external_batch_id),
 CHECK(NOT publication_requested OR (NOT synthetic AND approval IS NOT NULL AND jsonb_typeof(approval)='object'))
);
CREATE TABLE supplied_offers (
 offer_id text PRIMARY KEY REFERENCES offers(id), supplier_id text NOT NULL, external_id text NOT NULL,
 content_hash text NOT NULL CHECK(length(content_hash)=64), identity_hash text NOT NULL UNIQUE CHECK(length(identity_hash)=64),
 batch_id text NOT NULL REFERENCES supplied_batches(id), approved_batch_id text REFERENCES supplied_batches(id),
 original_url text NOT NULL CHECK(original_url ~ '^https://(www\.)?amazon\.in/(dp|gp/product)/[A-Z0-9]{10}/?$'),
 evidence_reference text NOT NULL CHECK(btrim(evidence_reference)<>''),
 synthetic boolean NOT NULL, public_approved boolean NOT NULL DEFAULT false,
 submitted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(supplier_id,external_id),
 CHECK(NOT public_approved OR (NOT synthetic AND approved_batch_id IS NOT NULL))
);
CREATE TABLE supplied_batch_items (
 batch_id text REFERENCES supplied_batches(id), offer_id text REFERENCES supplied_offers(offer_id),
 input jsonb NOT NULL CHECK(jsonb_typeof(input)='object'), PRIMARY KEY(batch_id,offer_id)
);
CREATE INDEX supplied_public_idx ON supplied_offers(offer_id) WHERE public_approved AND NOT synthetic;
