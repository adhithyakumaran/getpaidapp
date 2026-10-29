import 'server-only';
import { CatalogueOffer, PAGE_SIZE, parseCatalogueQuery, type CataloguePage, type RawQuery } from './model';

export const previewNow='2026-10-29T08:00:00.000Z';
const examples=[
  ['demo-audio-code','Demo: headphones with a group code','audio','CODE','DEMOAUDIO',1500,null,199900,'2026-11-05T18:29:00Z','2026-10-29T07:00:00Z'],
  ['demo-laptop-auto','Demo: automatic laptop discount','computers','AUTOMATIC',null,null,250000,null,'2026-11-08T18:29:00Z','2026-10-29T06:00:00Z'],
  ['demo-phone-bank','Demo: card offer on phones','phones','BANK',null,1000,null,2999900,'2026-11-02T18:29:00Z','2026-10-29T05:00:00Z'],
  ['demo-speaker-auto','Demo: speaker price discount','audio','AUTOMATIC',null,1200,null,null,null,'2026-10-29T04:00:00Z'],
  ['demo-accessory-code','Demo: accessory coupon','accessories','CODE','DEMOCASE',null,20000,99900,'2026-11-04T18:29:00Z','2026-10-29T03:00:00Z'],
  ['demo-stale-cashback','Demo: older cashback observation','computers','CASHBACK',null,null,50000,null,null,'2026-10-25T08:00:00Z'],
  ['demo-expired-code','Demo: expired audio coupon','audio','CODE','DEMOENDED',2000,null,149900,'2026-10-28T18:29:00Z','2026-10-28T07:00:00Z'],
] as const;
export function previewOffers():CatalogueOffer[] {
  return [...examples,...Array.from({length:8},(_,i)=>['demo-page-'+i,'Demo: pagination example '+(i+1),'accessories','CODE','DEMOPAGE'+i,null,null,null,null,'2026-10-27T08:00:00Z'] as const)].map(([slug,title,category,kind,code,discountBps,discountPaise,minSpendPaise,validUntil,observedAt])=>CatalogueOffer.parse({
    id:slug,slug,category,lifecycle:slug.includes('expired')?'EXPIRED':'UNKNOWN',observedAt,
    source:{name:'Synthetic preview source',url:'https://www.amazon.in/dp/B000FAKE01'},preview:true,
    conditions:kind==='BANK'?['Example card restriction: the selected bank credit card only.']:['Example product restriction: the selected item only.'],
    terms:{retailerId:'amazon-india',title,description:'An invented example used to review the interface. This is not a real promotion.',kind,code,
      discountType:discountBps!==null?'PERCENTAGE':discountPaise!==null?'FIXED':null,discountBps,discountPaise,minSpendPaise,maxDiscountPaise:null,
      currency:'INR',eligibility:{},validFrom:null,validUntil},
  }));
}
export function loadPreviewCatalogue(raw:RawQuery={}):CataloguePage {
  let query;
  try {query=parseCatalogueQuery(raw);} catch {return {offers:[],total:0,page:1,pages:1,query:parseCatalogueQuery({}),preview:true,now:previewNow,error:'Choose valid filters and keep your search under 120 characters.'};}
  let offers=previewOffers().filter(o=>(!query.q || `${o.terms.title} ${o.terms.code??''} Amazon India`.toLowerCase().includes(query.q.toLowerCase())) &&
    (query.category==='all'||o.category===query.category) && (query.kind==='all'||o.terms.kind===query.kind));
  offers=offers.sort((a,b)=>query.sort==='minimum'?(a.terms.minSpendPaise??Infinity)-(b.terms.minSpendPaise??Infinity):query.sort==='expiry'?
    Date.parse(a.terms.validUntil??'9999-01-01')-Date.parse(b.terms.validUntil??'9999-01-01'):Date.parse(b.observedAt)-Date.parse(a.observedAt));
  const total=offers.length;const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));const page=Math.min(query.page,pages);
  return {offers:offers.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE),relatedOffers:offers.slice(page*PAGE_SIZE,page*PAGE_SIZE+3),total,pages,page,query,preview:true,now:previewNow};
}
