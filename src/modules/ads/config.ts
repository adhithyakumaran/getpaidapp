export const adUnits={
 rectangle:{id:'rectangle',key:'fb1eb20db406f6eb26613b1d7b42b325',src:'https://bauval.org/22/fb1eb20db406f6eb26613b1d7b42b325',width:300,height:250},
 leaderboard:{id:'leaderboard',key:'223929b640ef66070ae29b3989c19b13',src:'https://bauval.org/22/223929b640ef66070ae29b3989c19b13',width:728,height:90},
 native:{id:'native',key:'c567c1f1857b22c3352292625fe00f45',src:'https://bauval.org/21/c567c1f1857b22c3352292625fe00f45',width:0,height:320},
} as const;
export type AdUnitId=keyof typeof adUnits;
export function isAdUnit(value:string):value is AdUnitId{return Object.hasOwn(adUnits,value);}
export function adsEnabled(env:Record<string,string|undefined>){return env.NODE_ENV==='production'&&env.NEXT_PUBLIC_ADS_ENABLED!=='0';}
export const AD_PREFERENCE_KEY='getpaid-ad-preference-v1';
export type AdPreference='unknown'|'on'|'off';
export function parseAdPreference(raw:string|null,now=Date.now()):AdPreference{
 try{const value=JSON.parse(raw??'null');return value&&(value.choice==='on'||value.choice==='off')&&typeof value.expires==='number'&&value.expires>now?value.choice:'unknown';}catch{return 'unknown';}
}
export function adFrameHtml(id:AdUnitId){
 const unit=adUnits[id];
 const content=id==='native'?`<div id="container-${unit.key}"></div><script async="async" data-cfasync="false" src="${unit.src}"></script>`:
  `<script>window.atOptions=${JSON.stringify({key:unit.key,format:'iframe',height:unit.height,width:unit.width,params:{}})};</script><script data-cfasync="false" src="${unit.src}"></script>`;
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Advertisement</title><style>body{margin:0}img,iframe{max-width:100%}</style></head><body>${content}<script>(function(){function size(){parent.postMessage({type:'getpaid-ad-size',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');}new ResizeObserver(size).observe(document.body);size();})();</script></body></html>`;
}
