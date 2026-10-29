import {brands} from './brands';
import type {CatalogueQuery} from './model';
const patterns=['coupons','coupon codes','discount codes','promo codes','offers','discount coupons','free coupons'] as const;
export const searchIntents=brands.flatMap(brand=>patterns.map(pattern=>({phrase:`${brand.name.toLowerCase()} ${pattern}`,store:brand.id,path:`/stores/${brand.id}`})));
const aliases:Record<string,string>={amzon:'amazon-india',amazon:'amazon-india',amzn:'amazon-india',mynntra:'myntra',myntra:'myntra',ajio:'ajio',nykaa:'nykaa',zepto:'zepto',flipkart:'flipkart'};
export function resolveSearchIntent(input:CatalogueQuery):CatalogueQuery {
  let text=input.q.toLowerCase().replace(/\b(?:cupon|copun|coupin|coupen)\b/g,'coupon');
  let store=input.store;let category=input.category;
  const names=[...brands.map(b=>({name:b.name.toLowerCase(),id:b.id})),...Object.entries(aliases).map(([name,id])=>({name,id}))].sort((a,b)=>b.name.length-a.name.length);
  for(const alias of names){const escaped=alias.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const re=new RegExp('\\b'+escaped+'\\b','i');if(re.test(text)){if(store==='all')store=alias.id;text=text.replace(re,' ');break;}}
  const categories:Record<string,CatalogueQuery['category']>={fashion:'fashion',beauty:'beauty',skincare:'beauty',grocery:'groceries',groceries:'groceries',food:'food',electronics:'electronics',travel:'travel'};
  if(category==='all')for(const [name,value]of Object.entries(categories))if(new RegExp('\\b'+name+'\\b').test(text)){category=value;text=text.replace(new RegExp('\\b'+name+'\\b','g'),' ');break;}
  text=text.replace(/\b(?:free|coupon|coupons|codes?|discount|discounts|promo|offers?|deals?|online|india|today|best|for|in|on)\b/g,' ').replace(/\s+/g,' ').trim();
  return {...input,q:text,store,category};
}
