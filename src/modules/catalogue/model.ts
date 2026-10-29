import { z } from 'zod';
import { OfferInput, Instant, Lifecycle } from '../domain/schemas';
import {brands,sourceListingUrls} from './brands';

export const categories=['all','audio','computers','phones','accessories','fashion','beauty','footwear','food','groceries','personal-care','electronics','clothing','travel','home','beauty-fashion','shopping'] as const;
export const categoryNames:Record<string,string>={all:'All categories',audio:'Audio',computers:'Computers',phones:'Phones',accessories:'Accessories',fashion:'Fashion',beauty:'Beauty',footwear:'Footwear',food:'Food',groceries:'Groceries','personal-care':'Personal care',electronics:'Electronics',clothing:'Clothing',travel:'Travel',home:'Home','beauty-fashion':'Beauty & fashion',shopping:'Shopping'};
export const CatalogueQuery=z.object({
  q:z.string().trim().max(120).default(''),category:z.enum(categories).default('all'),
  kind:z.enum(['all','CODE','AUTOMATIC','BANK','CASHBACK']).default('all'),
  sort:z.enum(['recent','expiry','minimum']).default('recent'),
  page:z.coerce.number().int().min(1).max(1000).default(1),
  store:z.string().refine(value=>value==='all'||brands.some(b=>b.id===value)).default('all'),
  scope:z.enum(['all','payment']).default('all'),
}).strict();
export type CatalogueQuery=z.infer<typeof CatalogueQuery>;
export type RawQuery=Record<string,string|string[]|undefined>;
export function parseCatalogueQuery(raw:RawQuery):CatalogueQuery {
  const data:Record<string,unknown>={};
  for(const key of ['q','category','kind','sort','page','store','scope']) {
    if(Array.isArray(raw[key])) throw new Error('Choose one value for each filter.');
    if(raw[key]!==undefined && raw[key]!=='') data[key]=raw[key];
  }
  return CatalogueQuery.parse(data);
}
export const ShopperUrl=z.string().url().refine(value=> {
  let url:URL;try{url=new URL(value);}catch{return false;}
  return url.protocol==='https:' && ['www.amazon.in','amazon.in'].includes(url.hostname) && !url.username && !url.password && !url.port &&
    !url.search && !url.hash && /^\/(?:dp\/[A-Z0-9]{10}|gp\/product\/[A-Z0-9]{10})\/?$/.test(url.pathname);
},'A reviewed shopper product URL is required');
export const PublicOfferUrl=z.string().url().refine(value=>ShopperUrl.safeParse(value).success ||
  sourceListingUrls.some(url=>url===value) || brands.some(b=>b.url===value),'A reviewed public offer URL is required');
export const CatalogueOffer=z.object({
  id:z.string(),slug:z.string(),terms:OfferInput,category:z.enum(categories).exclude(['all']),
  lifecycle:Lifecycle,observedAt:Instant,source:z.object({name:z.string().min(1),url:PublicOfferUrl}),
  conditions:z.array(z.string().max(300)).max(12),preview:z.boolean(),origin:z.enum(['collected','supplied']).default('collected'),
});
export type CatalogueOffer=z.infer<typeof CatalogueOffer>;
export interface CataloguePage {offers:CatalogueOffer[];relatedOffers?:CatalogueOffer[];total:number;page:number;pages:number;query:CatalogueQuery;preview:boolean;now:string;error?:string;snapshotAt?:string}
export const PAGE_SIZE=7;
// Automatic collection remains closed. Explicitly approved supplied imports have
// a separate audited publication path, independent of collector authorization.
export const PUBLIC_PUBLICATION_READY=false;
export const previewAllowed=(environment:string|undefined,flag:string|undefined)=>environment==='development' && flag==='1';
export function conditionLines(terms:OfferInput):string[] {
  // Only deliberate customer-facing fields cross the boundary; never stringify eligibility/evidence.
  const lines:string[]=[];
  for(const key of ['products','customers','payment','redemption']) {
    const value=terms.eligibility[key];
    if(typeof value==='string' && value.trim() && value.length<=300) lines.push(value);
  }
  return lines;
}
export function offerState(offer:CatalogueOffer,now:string):'expired'|'upcoming'|'stale'|'observed' {
  if(offer.lifecycle==='EXPIRED' || (offer.terms.validUntil && Date.parse(offer.terms.validUntil)<=Date.parse(now))) return 'expired';
  if(offer.terms.validFrom && Date.parse(offer.terms.validFrom)>Date.parse(now)) return 'upcoming';
  return Date.parse(now)-Date.parse(offer.observedAt)>24*60*60*1000?'stale':'observed';
}
export function money(value:number|null):string {
  return value===null?'Not provided':new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value/100);
}
export function benefit(offer:CatalogueOffer):string {
  const suffix=offer.terms.kind==='CASHBACK'?'cashback':'off';
  if(offer.terms.discountBps!==null) return `${offer.terms.discountBps/100}% ${suffix}`;
  if(offer.terms.discountPaise!==null) return `${money(offer.terms.discountPaise)} ${suffix}`;
  if(offer.terms.discountType==='FREE_SHIPPING')return 'Free shipping';
  return offer.terms.kind==='BANK'?'Bank offer':offer.terms.kind==='CASHBACK'?'Cashback':offer.terms.kind==='CODE'?'Coupon code':'Automatic offer';
}
export function displayDate(value:string|null):string {
  return value?new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date(value)):'Not provided';
}
export function catalogueHref(base:string,query:CatalogueQuery,change:Partial<CatalogueQuery>={}):string {
  const next={...query,...change};const params=new URLSearchParams();
  for(const [key,value] of Object.entries(next)) if(!(key==='store'&&(base==='/stores/'+value||base==='/preview/stores/'+value)) && value!=='' && value!=='all' && !(key==='page' && value===1) && !(key==='sort' && value==='recent')) params.set(key,String(value));
  return base+(params.size?'?'+params.toString():'');
}
