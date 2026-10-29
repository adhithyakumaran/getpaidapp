import {z} from 'zod';
import {Instant} from '../domain/schemas';
import {brands} from './brands';
import {CatalogueOffer,PAGE_SIZE,type CatalogueQuery} from './model';

export const PublicCatalogueSnapshot=z.object({version:z.literal(1),capturedAt:Instant,
 offers:z.array(CatalogueOffer.refine(o=>!o.preview&&o.origin==='supplied'&&o.lifecycle!=='INACTIVE'&&Object.keys(o.terms.eligibility).length===0,
 'Only approved public supplied projections belong in a snapshot')).max(5000),
}).strict().refine(s=>new Set(s.offers.map(o=>o.slug)).size===s.offers.length&&new Set(s.offers.map(o=>o.id)).size===s.offers.length,'Duplicate snapshot offers');
export type PublicCatalogueSnapshot=z.infer<typeof PublicCatalogueSnapshot>;
export function snapshotEnabled(env:Record<string,string|undefined>){return env.NODE_ENV==='production'&&env.PUBLIC_CATALOGUE_SNAPSHOT!=='0';}
const families:Record<string,string[]>={fashion:['clothing','footwear','beauty-fashion'],beauty:['personal-care','beauty-fashion'],electronics:['audio','computers','phones','accessories']};
export function readPublicSnapshot(snapshot:PublicCatalogueSnapshot,query:CatalogueQuery,slug?:string){
 const q=query.q.toLowerCase();
 let offers=snapshot.offers.filter(o=>(!slug||o.slug===slug)&&(query.store==='all'||o.terms.retailerId===query.store)&&
  (query.category==='all'||o.category===query.category||families[query.category]?.includes(o.category))&&
  (query.kind==='all'||o.terms.kind===query.kind)&&
  (!q||[o.terms.title,o.terms.code??'',brands.find(b=>b.id===o.terms.retailerId)?.name??'',...o.conditions].join(' ').toLowerCase().includes(q))&&
  (query.scope==='all'||o.terms.kind==='BANK'||/\b(card|bank|wallet|upi|cashback|emi)\b/i.test([o.terms.title,...o.conditions].join(' '))));
 const date=(s:string|null)=>s?Date.parse(s):Infinity;
 offers=offers.sort((a,b)=>(query.sort==='expiry'?date(a.terms.validUntil)-date(b.terms.validUntil):query.sort==='minimum'?
  (a.terms.minSpendPaise??Infinity)-(b.terms.minSpendPaise??Infinity):Date.parse(b.observedAt)-Date.parse(a.observedAt))||(a.id<b.id?-1:a.id>b.id?1:0));
 const total=offers.length,pages=Math.max(1,Math.ceil(total/PAGE_SIZE)),page=Math.min(query.page,pages),offset=(page-1)*PAGE_SIZE;
 return {offers:offers.slice(offset,offset+PAGE_SIZE),relatedOffers:offers.slice(offset+PAGE_SIZE,offset+PAGE_SIZE+3),total,pages,page,snapshotAt:snapshot.capturedAt};
}
