import {adFrameHtml,adsEnabled,isAdUnit} from '@/src/modules/ads/config';
export function GET(request:Request){
 const params=new URL(request.url).searchParams,unit=params.get('unit')??'';
 if(!adsEnabled(process.env)||params.getAll('unit').length!==1||!isAdUnit(unit))return new Response('Not found',{status:404});
 return new Response(adFrameHtml(unit),{headers:{
  'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':"default-src https: data: blob:; script-src https: 'unsafe-inline'; style-src https: 'unsafe-inline'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox",
 }});
}
