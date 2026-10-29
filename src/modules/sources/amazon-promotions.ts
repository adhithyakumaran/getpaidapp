import { createHash } from 'node:crypto';
import { z } from 'zod';
import { Id, Instant, OfferInput } from '../domain/schemas';
import { decimalRupeesToPaise } from '../normalize/money';
import { CollectionError, CollectionResult, ExtractedListing, errorCode, type CollectionContext, type SourceAdapter } from './contracts';
import { Requester, type RequestPolicy } from './http';

export const AMAZON_ENDPOINT='https://sellingpartnerapi-eu.amazon.com/promotions/2025-12-01/promotions';
export const MARKETPLACE='A21TJRUUN4KGV';
export const amazonPolicy: RequestPolicy={
  origin:new URL(AMAZON_ENDPOINT).origin,path:new URL(AMAZON_ENDPOINT).pathname,
  queryKeys:['marketplaceIds','locale','revision','statuses','limit','asins','paginationToken','includedData'],
  requestBudget:10,timeoutMs:10000,maxRetries:2,maxRedirects:2,maxBytes:524288,minIntervalMs:10000,maxWaitMs:30000,
};
const Asins=z.array(z.string().regex(/^[A-Z0-9]{10}$/)).min(1).max(10);
const Selection=z.object({type:z.enum(['ITEMS','CATALOG']),selectionId:Id.optional(),revisionId:z.number().int().positive().optional()}).passthrough();
const ClaimCode=z.discriminatedUnion('type',[
  z.object({type:z.literal('GROUP'),value:z.string().regex(/^[A-Z0-9]{6,12}$/)}).passthrough(),
  z.object({type:z.literal('INDIVIDUAL')}).passthrough(),
]);
const Promotion=z.object({
  promotionId:Id,trackingId:Id,marketplaceId:z.literal(MARKETPLACE),promotionTitle:z.string().trim().min(1),
  promotionType:z.enum(['BASKET_BUILDING','DEAL','PRICE_DISCOUNT','COUPON']),
  status:z.enum(['PROCESSING','UPCOMING','RUNNING','EXPIRED','FAILED','CANCELLING','CANCELLED']),
  createdDate:Instant,lastUpdatedDate:Instant,selection:Selection,
  schedule:z.object({startDate:Instant.optional(),endDate:Instant.optional()}).passthrough(),
  purchaseRequirements:z.object({selection:Selection,condition:z.object({
    amountThreshold:z.object({type:z.literal('AT_LEAST'),currency:z.object({amount:z.number().nonnegative(),currencyCode:z.literal('INR')})}).optional(),
    quantityThreshold:z.object({type:z.literal('AT_LEAST'),quantity:z.number().int().positive()}).optional(),
  }).passthrough(),claimCode:ClaimCode.optional()}).passthrough().optional(),
  benefit:z.object({discount:z.object({type:z.enum(['PERCENTAGE_OFF','AMOUNT_OFF','FREE_ITEM']),
    percentOff:z.number().min(1).max(100).optional(),amountOff:z.number().positive().optional(),currencyCode:z.literal('INR').optional(),
  }).passthrough().optional()}).passthrough().optional(),
  customerSegments:z.array(z.json()).optional(),couponType:z.string().optional(),
}).passthrough();
const Page=z.object({totalResults:z.number().int().nonnegative(),promotions:z.array(z.unknown()).max(100),
  pagination:z.object({nextToken:z.string().min(1).max(4096).nullish()}).optional(),
}).passthrough();

export function extractPromotion(raw: unknown, sourceId: string, originalUrl: string, observedAt: string, synthetic: boolean): ExtractedListing {
  const p=Promotion.parse(raw);
  const claim=p.purchaseRequirements?.claimCode;
  if(claim?.type==='INDIVIDUAL' || p.promotionType==='COUPON')
    throw new CollectionError('UNSUPPORTED_REDEMPTION');
  const discount=p.benefit?.discount;
  let discountPaise:number|null=null; let discountBps:number|null=null;
  if(discount?.type==='AMOUNT_OFF') {
    if(discount.amountOff===undefined || discount.currencyCode!=='INR') throw new CollectionError('INVALID_DISCOUNT');
    discountPaise=decimalRupeesToPaise(String(discount.amountOff));
  }
  if(discount?.type==='PERCENTAGE_OFF') {
    if(discount.percentOff===undefined) throw new CollectionError('INVALID_DISCOUNT');
    discountBps=decimalRupeesToPaise(String(discount.percentOff));
  }
  const minimum=p.purchaseRequirements?.condition.amountThreshold?.currency;
  const rawJson=JSON.stringify(raw);
  const ref='sha256:'+createHash('sha256').update(rawJson).digest('hex');
  return ExtractedListing.parse({
    sourceId,sourceListingKey:p.promotionId,originalUrl,observedAt,
    terms:OfferInput.parse({retailerId:'amazon-india',title:p.promotionTitle,description:null,
      kind:claim?.type==='GROUP'?'CODE':'AUTOMATIC',code:claim?.type==='GROUP'?claim.value:null,
      discountType:discount?.type==='AMOUNT_OFF'?'FIXED':discount?.type==='PERCENTAGE_OFF'?'PERCENTAGE':discount?.type==='FREE_ITEM'?'OTHER':null,
      discountPaise,discountBps,minSpendPaise:minimum?decimalRupeesToPaise(String(minimum.amount)):null,maxDiscountPaise:null,
      currency:discount?.currencyCode??minimum?.currencyCode??null,
      eligibility:{selection:p.selection,purchaseRequirements:p.purchaseRequirements??null,customerSegments:p.customerSegments??null,
        benefit:p.benefit??null,sourceStatus:p.status,promotionType:p.promotionType},
      validFrom:p.schedule.startDate?new Date(p.schedule.startDate).toISOString():null,validUntil:p.schedule.endDate?new Date(p.schedule.endDate).toISOString():null,
    }),
    rawEvidenceRef:ref,rawEvidence:{ref,rawJson,synthetic,sourceUrl:originalUrl},
    normalizationVersion:'amazon-promotions-2025-12-01/1',
    rawDateText:p.schedule.endDate??null,interpretedTimezone:null,sourceReportedVerification:null,
  });
}

export class AmazonPromotionsAdapter implements SourceAdapter {
  readonly asins:string[];
  constructor(readonly sourceId:string, private readonly requester:Requester, asins:unknown,
    private readonly synthetic=false, private readonly accessToken?:string) { this.asins=Asins.parse(asins); }
  async collect(context:CollectionContext):Promise<CollectionResult> {
    const listings:ExtractedListing[]=[]; const errors:CollectionResult['errors']=[];
    const ids=new Set<string>(); const tokens=new Set<string>();
    let token:string|undefined; let expectedTotal:number|undefined; let discovered=0; let rejected=0; let pageNumber=0;
    try {
      do {
        if(context.signal.aborted) throw new CollectionError('CANCELLED');
        const url=new URL(AMAZON_ENDPOINT);
        for(const [key,value] of Object.entries({marketplaceIds:MARKETPLACE,locale:'en_IN',revision:'PUBLISHED',
          statuses:'RUNNING,UPCOMING',limit:'20',asins:this.asins.join(','),includedData:'CUSTOMER_SEGMENTS'})) url.searchParams.set(key,value);
        if(token) url.searchParams.set('paginationToken',token);
        pageNumber++;
        const response=await this.requester.get(url,this.accessToken?{'x-amz-access-token':this.accessToken,'user-agent':'CouponIntelligence/0.1 (manual collector)'}:{});
        let data:unknown;
        try { data=JSON.parse(response.body); } catch { throw new CollectionError('MALFORMED_RESPONSE'); }
        const parsed=Page.safeParse(data);
        if(!parsed.success) throw new CollectionError('SCHEMA_CHANGED');
        const page=parsed.data;
        if(expectedTotal===undefined) expectedTotal=page.totalResults;
        else if(expectedTotal!==page.totalResults) errors.push({code:'TOTAL_CHANGED',location:`page:${pageNumber}`});
        discovered+=page.promotions.length;
        for(const raw of page.promotions) {
          try {
            const listing=extractPromotion(raw,this.sourceId,url.href,context.now().toISOString(),this.synthetic);
            if(ids.has(listing.sourceListingKey)) throw new CollectionError('DUPLICATE_LISTING');
            ids.add(listing.sourceListingKey); listings.push(listing);
          } catch(error) {
            rejected++; errors.push({code:error instanceof CollectionError?error.code:'INVALID_PROMOTION',location:`page:${pageNumber}/item:${rejected}`});
          }
        }
        token=page.pagination?.nextToken??undefined;
        if(token) {
          if(tokens.has(token)) throw new CollectionError('PAGINATION_LOOP');
          tokens.add(token);
        }
      } while(token);
      if(discovered!==expectedTotal) errors.push({code:'TOTAL_MISMATCH',location:'pagination'});
    } catch(error) { errors.push({code:errorCode(error),location:`page:${Math.max(1,pageNumber)}`}); }
    return CollectionResult.parse({listings,errors,completeness:errors.length?'PARTIAL':'COMPLETE',snapshotAuthoritative:false,
      statistics:{requests:this.requester.requests,discovered,rejected}});
  }
}
