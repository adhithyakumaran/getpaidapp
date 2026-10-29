import {adFrameHtml,adsEnabled,isAdUnit,nativeFrameOrigin,nativeFrameIsSeparate} from '@/src/modules/ads/config';
export function GET(request:Request){
 const url=new URL(request.url),params=url.searchParams,unit=params.get('unit')??'';
 if(!adsEnabled(process.env)||params.getAll('unit').length!==1||!isAdUnit(unit))return new Response('Not found',{status:404});
 const nativeOrigin=nativeFrameOrigin(process.env);
 const separateNative=nativeFrameIsSeparate(nativeOrigin,'https://getpaid.co.in')&&url.origin===nativeOrigin;
 // Same-origin cookie/storage access is granted ONLY on the independent ad host.
 // The coupon-domain response always keeps its opaque-origin sandbox.
 const sandbox='allow-scripts allow-popups allow-popups-to-escape-sandbox'+(separateNative?' allow-same-origin':'');
 const ancestors=separateNative?"https://getpaid.co.in https://www.getpaid.co.in":"'self'";
 return new Response(adFrameHtml(unit),{headers:{
  'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':`default-src https: data: blob:; script-src https: 'unsafe-inline'; style-src https: 'unsafe-inline'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors ${ancestors}; sandbox ${sandbox}`,
 }});
}
