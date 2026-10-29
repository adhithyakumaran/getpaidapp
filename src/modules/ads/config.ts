export const adUnits={
 rectangle:{id:'rectangle',key:'fb1eb20db406f6eb26613b1d7b42b325',src:'https://bauval.org/22/fb1eb20db406f6eb26613b1d7b42b325',width:300,height:250},
 leaderboard:{id:'leaderboard',key:'223929b640ef66070ae29b3989c19b13',src:'https://bauval.org/22/223929b640ef66070ae29b3989c19b13',width:728,height:90},
 native:{id:'native',key:'c567c1f1857b22c3352292625fe00f45',src:'https://bauval.org/21/c567c1f1857b22c3352292625fe00f45',width:0,height:320},
} as const;
export type AdUnitId=keyof typeof adUnits;
export function isAdUnit(value:string):value is AdUnitId{return Object.hasOwn(adUnits,value);}
export function adsEnabled(env:Record<string,string|undefined>){return env.NODE_ENV==='production'&&env.NEXT_PUBLIC_ADS_ENABLED!=='0';}
export function adFrameHtml(id:AdUnitId){
 const unit=adUnits[id];
 const content=id==='native'?`<div id="container-${unit.key}"></div><script async="async" data-cfasync="false" src="${unit.src}"></script>`:
  `<script>window.atOptions=${JSON.stringify({key:unit.key,format:'iframe',height:unit.height,width:unit.width,params:{}})};</script><script data-cfasync="false" src="${unit.src}"></script>`;
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Advertisement</title><style>body{margin:0}img,iframe{max-width:100%}</style><script>(function(){function send(status){parent.postMessage({type:'getpaid-ad-status',status:status},'*');}addEventListener('error',function(){send('unavailable');},true);addEventListener('DOMContentLoaded',function(){var observer=new MutationObserver(check);function check(){if(Array.from(document.body.children).some(function(e){var r=e.getBoundingClientRect();return !/^(SCRIPT|STYLE)$/.test(e.tagName)&&r.width>40&&r.height>20;})){send('loaded');parent.postMessage({type:'getpaid-ad-size',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');}}observer.observe(document.body,{subtree:true,childList:true,attributes:true});new ResizeObserver(check).observe(document.body);check();});})();</script></head><body>${content}</body></html>`;
}

export type AdPlacement='top'|'native'|'sidebar'|'sidebar-native';
export function isCatalogueAdPage(path:string){return path==='/'||path==='/search'||path.startsWith('/stores/')||['fashion-coupons','beauty-coupons','grocery-coupons','food-delivery-coupons','electronics-deals','travel-coupons','home-living-deals','bank-offers'].some(slug=>path==='/'+slug);}
export function selectAdUnit(placement:AdPlacement,path:string,wide:boolean,desktop:boolean):AdUnitId|null{
 if(placement==='sidebar')return desktop?'rectangle':null;
 if(placement==='sidebar-native')return desktop&&isCatalogueAdPage(path)?'native':null;
 if(placement==='native')return desktop&&isCatalogueAdPage(path)?null:'native';
 return wide?'leaderboard':'rectangle';
}

// Native scripts may use cookies only on an independent ad-document origin.
// Never grant same-origin access to a native frame served on the coupon domain.
export function nativeFrameOrigin(env:Record<string,string|undefined>):string|undefined{
 const raw=env.NATIVE_AD_FRAME_ORIGIN||(env.VERCEL_URL?'https://'+env.VERCEL_URL:'');
 if(!raw)return;try{const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/'||url.hostname==='getpaid.co.in'||url.hostname.endsWith('.getpaid.co.in'))return;
 if(!env.NATIVE_AD_FRAME_ORIGIN&&!url.hostname.endsWith('.vercel.app'))return;
 return url.origin;}catch{return;}
}
export function nativeFrameIsSeparate(origin:string|undefined,parent:string){if(!origin)return false;try{return nativeFrameOrigin({NATIVE_AD_FRAME_ORIGIN:origin})===origin&&new URL(parent).origin!==origin;}catch{return false;}}
