import { createHash } from 'node:crypto';
import { z } from 'zod';
import { OfferInput, Instant } from '../domain/schemas';
import { PublicOfferUrl,categories } from '../catalogue/model';
import {brands} from '../catalogue/brands';

export const SafeId=z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
const Text=z.string().trim().min(1).max(300);
export const SuppliedCoupon=z.object({
  externalId:SafeId,category:z.enum(categories).exclude(['all']),
  originalUrl:PublicOfferUrl,evidenceReference:Text,approved:z.boolean().default(false),sourceRecord:z.record(z.string(),z.json()).optional(),
  terms:z.object({
    retailerId:z.string().refine(value=>brands.some(b=>b.id===value)),title:z.string().trim().min(1).max(200),
    description:z.string().max(2000).nullable().default(null),
    kind:z.enum(['CODE','AUTOMATIC','BANK','CASHBACK']),code:z.string().trim().min(1).max(100).nullable().default(null),
    discountType:z.enum(['PERCENTAGE','FIXED','FREE_SHIPPING','OTHER']).nullable().default(null),
    discountBps:z.number().int().min(0).max(10000).nullable().default(null),
    discountPaise:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable().default(null),
    minSpendPaise:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable().default(null),
    maxDiscountPaise:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable().default(null),
    currency:z.literal('INR').nullable().default(null),
    eligibility:z.object({products:Text.optional(),customers:Text.optional(),payment:Text.optional(),redemption:Text.optional()}).strict().default({}),
    validFrom:Instant.nullable().default(null),validUntil:Instant.nullable().default(null),
  }).strict().superRefine((value,ctx)=>{const checked=OfferInput.safeParse(value);if(!checked.success)for(const issue of checked.error.issues)ctx.addIssue({code:'custom',path:issue.path,message:issue.message});}),
}).strict().superRefine((c,ctx)=>{
  if(c.terms.kind!=='CODE' && c.terms.code!==null)ctx.addIssue({code:'custom',path:['terms','code'],message:'Only code offers may have a code'});
  if(c.terms.discountType==='PERCENTAGE' && (c.terms.discountBps===null || c.terms.discountPaise!==null))ctx.addIssue({code:'custom',message:'Percentage discount requires basis points only'});
  if(c.terms.discountType==='FIXED' && (c.terms.discountPaise===null || c.terms.discountBps!==null || c.terms.currency!=='INR'))ctx.addIssue({code:'custom',message:'Fixed discount requires INR paise only'});
  if(c.terms.discountType!=='PERCENTAGE' && c.terms.discountBps!==null)ctx.addIssue({code:'custom',message:'Basis points require percentage type'});
  if(c.terms.discountType!=='FIXED' && c.terms.discountPaise!==null)ctx.addIssue({code:'custom',message:'Paise discount requires fixed type'});
});
export const CouponBatch=z.object({
  version:z.literal(1),batchId:SafeId,supplierId:SafeId,supplierName:Text,
  suppliedAt:Instant,synthetic:z.boolean(),
  approval:z.object({actor:Text,reason:Text,rightsBasis:Text,approvedAt:Instant}).strict().nullable().default(null),
  coupons:z.array(SuppliedCoupon).min(1).max(500),
  withheldCandidates:z.array(z.object({externalId:SafeId,reason:Text,raw:z.record(z.string(),z.json())}).strict()).max(500).default([]),
}).strict().superRefine((b,ctx)=>{
  const seen=new Set<string>();
  for(const [index,c] of b.coupons.entries()) {
    if(seen.has(c.externalId))ctx.addIssue({code:'custom',path:['coupons',index,'externalId'],message:'Duplicate external identity'});
    seen.add(c.externalId);
  }
  if(b.coupons.some(c=>c.approved) && !b.approval)ctx.addIssue({code:'custom',path:['approval'],message:'Approved records require dated approval and rights basis'});
});
export type CouponBatch=z.infer<typeof CouponBatch>;
export type SuppliedCoupon=z.infer<typeof SuppliedCoupon>;
export function canonical(value:unknown):string {
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value!==null && typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';
  return JSON.stringify(value);
}
export const digest=(value:unknown)=>createHash('sha256').update(canonical(value)).digest('hex');
export const offerId=(supplier:string,externalId:string)=>'supplied-'+digest([supplier,externalId]).slice(0,32);
export function contentHash(c:SuppliedCoupon) { const {approved:_,externalId:__,...content}=c;void _;void __;return digest(content); }
export function identityHash(c:SuppliedCoupon) {
  const {title:_,description:__,...terms}=c.terms;void _;void __;
  const url=new URL(c.originalUrl);if(url.hostname==='amazon.in')url.hostname='www.amazon.in';url.pathname=url.pathname.replace('/gp/product/','/dp/').replace(/\/$/,'');
  return digest({terms:{...terms,code:terms.code?.toUpperCase()??null},url:url.href,category:c.category});
}
