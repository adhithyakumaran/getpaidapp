import type {Metadata} from 'next';
export const SITE_ORIGIN='https://getpaid.co.in';
export const CONTACT_EMAIL='adhithyakumaran2005@gmail.com';
export const CONTACT_PHONE='+919965985951';
export function indexingEnabled(env:Record<string,string|undefined>=process.env) {return env.NODE_ENV==='production'&&env.PUBLIC_INDEXING_ENABLED==='1';}
export function pageMetadata(title:string,description:string,path:string,eligible=true):Metadata {
 return {title,description,alternates:{canonical:new URL(path,SITE_ORIGIN).href},robots:{index:indexingEnabled()&&eligible,follow:indexingEnabled()},openGraph:{title,description,url:new URL(path,SITE_ORIGIN).href,siteName:'Coupon Intelligence',locale:'en_IN',type:'website'}};
}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
