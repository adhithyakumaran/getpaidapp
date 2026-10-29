import type { PoolClient } from 'pg';
import { CatalogueOffer, CatalogueQuery, PAGE_SIZE, conditionLines } from '../catalogue/model';
import { OfferInput } from '../domain/schemas';
import { paiseFromDatabase } from '../normalize/money';

const from=(includeCollected:boolean)=>`FROM offers o JOIN stores st ON st.id=o.retailer_id
 JOIN LATERAL (
   SELECT sl.original_url,sl.last_seen_at,s.name,'collected' AS origin,sl.id
   FROM source_listings sl JOIN sources s ON s.id=sl.source_id
   WHERE ${includeCollected?'true':'false'} AND sl.current_offer_id=o.id AND s.enabled AND s.permission='APPROVED'
     AND s.permission_evidence IS NOT NULL AND s.reviewed_at IS NOT NULL
     AND sl.source_id NOT LIKE '%fixture%' AND sl.extraction_status='SUCCESS'
     AND sl.original_url ~ '^https://(www\\.)?amazon\\.in/(dp|gp/product)/[A-Z0-9]{10}/?$'
     AND EXISTS (SELECT 1 FROM observations ob WHERE ob.source_listing_id=sl.id AND ob.offer_id=o.id
       AND ob.source_id=s.id AND ob.raw_evidence->>'synthetic'='false' AND ob.field_provenance->>'synthetic'='false')
   UNION ALL
   SELECT so.original_url,so.submitted_at AS last_seen_at,sb.supplier_name AS name,'supplied' AS origin,so.offer_id AS id
   FROM supplied_offers so JOIN supplied_batches sb ON sb.id=so.batch_id
   JOIN supplied_batches approval ON approval.id=so.approved_batch_id
   WHERE so.offer_id=o.id AND so.public_approved AND NOT so.synthetic AND NOT sb.synthetic
     AND NOT approval.synthetic AND approval.publication_requested AND approval.approval IS NOT NULL
   ORDER BY last_seen_at DESC,id LIMIT 1
 ) attribution ON true
 JOIN LATERAL (SELECT c.slug FROM offer_categories oc JOIN categories c ON c.id=oc.category_id
   WHERE oc.offer_id=o.id ORDER BY c.slug LIMIT 1) category ON true
 WHERE o.publication_state='PUBLISHED' AND o.lifecycle<>'INACTIVE' AND ($4='all' OR st.slug=$4)
   AND NOT EXISTS (SELECT 1 FROM duplicate_reviews d WHERE (d.offer_id=o.id OR d.candidate_offer_id=o.id) AND d.resolution IS NULL)
   AND ($1='' OR o.title ILIKE $1 OR coalesce(o.code,'') ILIKE $1 OR st.name ILIKE $1 OR coalesce(o.eligibility->>'products','') ILIKE $1)
   AND ($2='all' OR category.slug=$2 OR ($2='fashion' AND category.slug IN ('clothing','footwear','beauty-fashion'))
     OR ($2='beauty' AND category.slug IN ('personal-care','beauty-fashion'))
     OR ($2='electronics' AND category.slug IN ('audio','computers','phones','accessories')))
   AND ($3='all' OR o.kind=$3)
   AND ($5='all' OR o.kind='BANK' OR concat(o.title,' ',o.eligibility->>'payment',' ',o.eligibility->>'products') ~* '\\m(card|bank|wallet|upi|cashback|emi)\\M')`;
function project(row:Record<string,unknown>):CatalogueOffer {
  const terms=OfferInput.parse({retailerId:row.retailer_id,title:row.title,description:row.description,kind:row.kind,code:row.code,
    discountType:row.discount_type,discountBps:row.discount_bps,discountPaise:paiseFromDatabase(row.discount_paise as string|null),
    minSpendPaise:paiseFromDatabase(row.min_spend_paise as string|null),maxDiscountPaise:paiseFromDatabase(row.max_discount_paise as string|null),
    currency:row.currency,eligibility:row.eligibility,validFrom:row.valid_from?(row.valid_from as Date).toISOString():null,
    validUntil:row.valid_until?(row.valid_until as Date).toISOString():null});
  // Eligibility itself may hold private metadata; return only reviewed display lines.
  return CatalogueOffer.parse({id:row.id,slug:row.public_slug,terms:{...terms,eligibility:{}},category:row.category,
    lifecycle:row.lifecycle,observedAt:(row.last_seen_at as Date).toISOString(),source:{name:row.source_name,url:row.original_url},
    conditions:conditionLines(terms),origin:row.origin,preview:false});
}
export async function readEligibleCatalogue(client:Pick<PoolClient,'query'>,input:CatalogueQuery,slug?:string,includeCollected=true) {
  const query=CatalogueQuery.parse(input);
  const escaped=query.q.replace(/[\\%_]/g,'\\$&');
  const values:unknown[]=[query.q?`%${escaped}%`:'',query.category,query.kind,query.store,query.scope];
  const condition=slug?' AND o.public_slug=$6':'';
  if(slug) values.push(slug);
  const sort={recent:'attribution.last_seen_at DESC',expiry:'o.valid_until ASC NULLS LAST',minimum:'o.min_spend_paise ASC NULLS LAST'}[query.sort];
  const limitPosition=values.length+1; values.push(PAGE_SIZE+3,query.page);
  const result=await client.query(`SELECT stats.total,entries.* FROM (SELECT count(*)::int AS total ${from(includeCollected)}${condition}) stats
    LEFT JOIN LATERAL (SELECT o.id,o.public_slug,o.retailer_id,o.title,o.description,o.kind,o.code,o.discount_type,o.discount_bps,
    o.discount_paise,o.min_spend_paise,o.max_discount_paise,o.currency,o.eligibility,o.valid_from,o.valid_until,o.lifecycle,
    attribution.name AS source_name,attribution.original_url,attribution.last_seen_at,attribution.origin,category.slug AS category
    ${from(includeCollected)}${condition} ORDER BY ${sort},o.id LIMIT $${limitPosition}
    OFFSET (LEAST($${limitPosition+1}::int,GREATEST(1,ceil(stats.total::numeric/${PAGE_SIZE})::int))-1)*${PAGE_SIZE}) entries ON true`,values);
  const total=Number(result.rows[0]?.total??0);const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));const page=Math.min(query.page,pages);
  const rows=result.rows.filter(row=>row.id).map(project);
  return {offers:rows.slice(0,PAGE_SIZE),relatedOffers:rows.slice(PAGE_SIZE),total,pages,page};
}
