import { readEligibleCatalogue } from './catalogue-repository';
import type { CatalogueQuery } from '../catalogue/model';
import type { PoolClient } from 'pg';
import { Id, Instant, ObservationInput, OfferInput, SourceInput, SourceListingInput, VerificationInput } from '../domain/schemas';
import { paiseFromDatabase } from '../normalize/money';

// Every mutation accepts a transaction client: callers own the atomic boundary.
export class Repository {
  constructor(private readonly db: PoolClient) {}
  async createOffers(records:Array<{id:string;slug:string;terms:unknown}>) {
    if(!records.length)return;
    const values:unknown[]=[];
    const rows=records.map(record=>{
      const o=OfferInput.parse(record.terms);const offset=values.length;
      values.push(Id.parse(record.id),Id.parse(record.slug),o.retailerId,o.title,o.description,o.kind,o.code,o.discountType,o.discountBps,o.discountPaise,o.minSpendPaise,o.maxDiscountPaise,o.currency,o.eligibility,o.validFrom,o.validUntil);
      return '('+Array.from({length:16},(_,i)=>'$'+(offset+i+1)).join(',')+')';
    });
    await this.db.query(`INSERT INTO offers(id,public_slug,retailer_id,title,description,kind,code,discount_type,discount_bps,discount_paise,min_spend_paise,max_discount_paise,currency,eligibility,valid_from,valid_until) VALUES ${rows.join(',')}`,values);
  }

  async addSource(input: unknown) {
    const s = SourceInput.parse(input);
    await this.db.query(`INSERT INTO sources(id,name,enabled,permission,permission_evidence,reviewed_at,access_method,allowed_hosts,attribution,request_budget,timeout_ms)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [s.id,s.name,s.enabled,s.permission,s.permissionEvidence,s.reviewedAt,s.accessMethod,s.allowedHosts,s.attribution,s.requestBudget,s.timeoutMs]);
  }

  async createRun(id: string, sourceId: string, slot: string) {
    await this.db.query('INSERT INTO collection_runs(id,source_id,scheduled_slot) VALUES($1,$2,$3)', [Id.parse(id),Id.parse(sourceId),Instant.parse(slot)]);
  }

  async createOffer(id: string, slug: string, input: unknown) {
    const o = OfferInput.parse(input);
    await this.db.query(`INSERT INTO offers(id,public_slug,retailer_id,title,description,kind,code,discount_type,discount_bps,discount_paise,min_spend_paise,max_discount_paise,currency,eligibility,valid_from,valid_until)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [Id.parse(id),Id.parse(slug),o.retailerId,o.title,o.description,o.kind,o.code,o.discountType,o.discountBps,o.discountPaise,o.minSpendPaise,o.maxDiscountPaise,o.currency,o.eligibility,o.validFrom,o.validUntil]);
  }

  async getOffer(id: string) {
    const result = await this.db.query('SELECT * FROM offers WHERE id=$1', [Id.parse(id)]);
    const row = result.rows[0];
    if (!row) return null;
    return { ...row, discount_paise: paiseFromDatabase(row.discount_paise),
      min_spend_paise: paiseFromDatabase(row.min_spend_paise), max_discount_paise: paiseFromDatabase(row.max_discount_paise),
      valid_from: row.valid_from?.toISOString() ?? null, valid_until: row.valid_until?.toISOString() ?? null };
  }

  async upsertListing(id: string, sourceId: string, key: string, offerId: string | null, url: string, seen: string) {
    const listing = SourceListingInput.parse({id,sourceId,sourceListingKey:key,currentOfferId:offerId,
      originalUrl:url,firstSeenAt:seen,lastSeenAt:seen});
    const result = await this.db.query(`INSERT INTO source_listings(id,source_id,source_listing_key,current_offer_id,original_url,first_seen_at,last_seen_at)
      VALUES($1,$2,$3,$4,$5,$6,$6) ON CONFLICT(source_id,source_listing_key) DO UPDATE SET
      current_offer_id=EXCLUDED.current_offer_id, original_url=EXCLUDED.original_url,
      last_seen_at=GREATEST(source_listings.last_seen_at,EXCLUDED.last_seen_at) RETURNING id`,
    [listing.id,listing.sourceId,listing.sourceListingKey,listing.currentOfferId,listing.originalUrl,listing.lastSeenAt]);
    return result.rows[0].id as string;
  }

  async appendObservation(input: unknown) {
    const o = ObservationInput.parse(input);
    const result = await this.db.query(`INSERT INTO observations(id,run_id,source_listing_id,source_id,offer_id,observed_at,original_url,raw_evidence,normalized,normalization_version,raw_date_text,interpreted_timezone,source_reported_verification,field_provenance)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT(run_id,source_listing_id) DO NOTHING RETURNING id`,
    [o.id,o.runId,o.listingId,o.sourceId,o.offerId,o.observedAt,o.originalUrl,o.rawEvidence,o.normalized,o.normalizationVersion,o.rawDateText,o.interpretedTimezone,o.sourceReportedVerification,o.fieldProvenance]);
    return result.rowCount === 1;
  }

  async appendVerification(input: unknown) {
    const v = VerificationInput.parse(input);
    await this.db.query(`INSERT INTO verification_records(id,offer_id,method,status,attempted_at,actor,evidence,failure_reason,verifier_version)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [v.id,v.offerId,v.method,v.status,v.attemptedAt,v.actor,v.evidence,v.failureReason,v.verifierVersion]);
  }

  async enqueue(id: string, offerId: string, version: number) {
    await this.db.query(`INSERT INTO publication_outbox(id,offer_id,content_version) VALUES($1,$2,$3)
      ON CONFLICT(offer_id,content_version) DO NOTHING`, [Id.parse(id),Id.parse(offerId),version]);
  }

  // Rows stay in place after expiry so fencing tokens never restart at one.
  async claimLease(sourceId: string, owner: string, seconds = 60): Promise<string | null> {
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 3600) throw new Error('Invalid lease duration');
    const result = await this.db.query(`INSERT INTO source_leases(source_id,owner,token,expires_at)
      VALUES($1,$2,1,clock_timestamp()+$3*interval '1 second') ON CONFLICT(source_id) DO UPDATE SET
      owner=EXCLUDED.owner,token=source_leases.token+1,expires_at=EXCLUDED.expires_at
      WHERE source_leases.expires_at<=clock_timestamp() RETURNING token`, [Id.parse(sourceId),Id.parse(owner),seconds]);
    return result.rows[0]?.token ?? null;
  }

  async assertLease(sourceId: string, owner: string, token: string) {
    const result = await this.db.query(`SELECT token FROM source_leases WHERE source_id=$1 AND owner=$2 AND token=$3
      AND expires_at>clock_timestamp() FOR UPDATE`, [sourceId,owner,token]);
    if (!result.rowCount) throw new Error('Source lease lost');
    // The row lock fences takeover for the remainder of this short transaction.
  }

  async catalogue(query:CatalogueQuery,slug?:string,includeCollected=true) { return readEligibleCatalogue(this.db,query,slug,includeCollected); }

  async ensureCollectionSource(input: unknown) {
    const s=SourceInput.parse(input);
    // Never overwrite an operator's permission decision during collection.
    await this.db.query(`INSERT INTO sources(id,name,enabled,permission,permission_evidence,reviewed_at,access_method,allowed_hosts,attribution,request_budget,timeout_ms)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(id) DO NOTHING`,
      [s.id,s.name,s.enabled,s.permission,s.permissionEvidence,s.reviewedAt,s.accessMethod,s.allowedHosts,s.attribution,s.requestBudget,s.timeoutMs]);
  }

  async sourceApproved(id: string): Promise<boolean> {
    const result=await this.db.query("SELECT enabled AND permission='APPROVED' AS approved FROM sources WHERE id=$1",[Id.parse(id)]);
    return result.rows[0]?.approved===true;
  }

  async recordCollectedListing(id:string, sourceId:string, key:string, url:string, seen:string) {
    const listing=SourceListingInput.parse({id,sourceId,sourceListingKey:key,currentOfferId:null,originalUrl:url,firstSeenAt:seen,lastSeenAt:seen});
    const result=await this.db.query(`INSERT INTO source_listings(id,source_id,source_listing_key,original_url,first_seen_at,last_seen_at,last_successful_fetch_at,extraction_status)
      VALUES($1,$2,$3,$4,$5,$5,$5,'SUCCESS') ON CONFLICT(source_id,source_listing_key) DO UPDATE SET
      last_seen_at=GREATEST(source_listings.last_seen_at,EXCLUDED.last_seen_at),
      last_successful_fetch_at=GREATEST(source_listings.last_successful_fetch_at,EXCLUDED.last_successful_fetch_at),
      extraction_status='SUCCESS' RETURNING id`,[listing.id,listing.sourceId,listing.sourceListingKey,listing.originalUrl,listing.lastSeenAt]);
    // Deliberately preserve any existing commercial match and original listing URL.
    return result.rows[0].id as string;
  }

  async finishCollectionRun(id:string, result: {
    status:'SUCCESS'|'PARTIAL_SUCCESS'|'FAILED'; discovered:number; extracted:number; rejected:number;
    completeness:'COMPLETE'|'PARTIAL'; errors:Array<{code:string;location:string}>;
  }) {
    const update=await this.db.query(`UPDATE collection_runs SET status=$2,finished_at=clock_timestamp(),
      records_discovered=$3,records_extracted=$4,records_normalised=$4,records_rejected=$5,
      errors=$6,completeness=$7,snapshot_authoritative=false WHERE id=$1 AND status='RUNNING'`,
      [Id.parse(id),result.status,result.discovered,result.extracted,result.rejected,JSON.stringify(result.errors),result.completeness]);
    if(update.rowCount!==1) throw new Error('Collection run is not running');
  }
}
