ALTER TABLE supplied_offers DROP CONSTRAINT supplied_offers_original_url_check;
ALTER TABLE supplied_offers ADD CONSTRAINT supplied_offers_original_url_check
 CHECK(original_url ~ '^https://[^/@:]+(/|$)');
CREATE TABLE supplied_candidates (
 batch_id text NOT NULL REFERENCES supplied_batches(id), external_id text NOT NULL,
 reason text NOT NULL, input jsonb NOT NULL CHECK(jsonb_typeof(input)='object'),
 PRIMARY KEY(batch_id,external_id)
);
