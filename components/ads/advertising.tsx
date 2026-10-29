'use client';
import Link from 'next/link';
import {createContext,useContext,useEffect,useRef,useState,useSyncExternalStore,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {AD_PREFERENCE_KEY,adUnits,adsEnabled,parseAdPreference,type AdPreference,type AdUnitId} from '@/src/modules/ads/config';

let memoryChoice:AdPreference='unknown';
function preference(){try{const raw=localStorage.getItem(AD_PREFERENCE_KEY);return raw?parseAdPreference(raw):memoryChoice;}catch{return memoryChoice;}}
function subscribe(callback:()=>void){window.addEventListener('storage',callback);window.addEventListener('getpaid-ad-preference',callback);return()=>{window.removeEventListener('storage',callback);window.removeEventListener('getpaid-ad-preference',callback);};}
function choose(choice:'on'|'off'){memoryChoice=choice;try{localStorage.setItem(AD_PREFERENCE_KEY,JSON.stringify({choice,expires:Date.now()+30*86400000}));}catch{}window.dispatchEvent(new Event('getpaid-ad-preference'));}
const AdvertisingContext=createContext<{enabled:boolean;choice:AdPreference}>({enabled:false,choice:'unknown'});
export function AdvertisingProvider({children}:{children:ReactNode}){
 const pathname=usePathname();const choice=useSyncExternalStore<AdPreference>(subscribe,preference,()=> 'unknown');
 const enabled=adsEnabled({NODE_ENV:process.env.NODE_ENV,NEXT_PUBLIC_ADS_ENABLED:process.env.NEXT_PUBLIC_ADS_ENABLED})&&!pathname.startsWith('/preview');
 return <AdvertisingContext.Provider value={{enabled,choice}}>{children}</AdvertisingContext.Provider>;
}
export function AdPreferences(){
 const {enabled,choice}=useContext(AdvertisingContext);const [editing,setEditing]=useState(false);
 if(!enabled)return null;
 const open=choice==='unknown'||editing;
 return <section className={`ad-preferences ${open?'ad-preferences-open':''}`} aria-label="Advertising preferences">{open?<><p>Allow third-party ads to support this site? Your choice is saved for 30 days. <Link href="/privacy-policy-placeholder">Privacy details</Link></p><div><button className="btn btn-outline" onClick={()=>{choose('on');setEditing(false);}}>Allow ads</button><button className="btn btn-ghost" onClick={()=>{choose('off');setEditing(false);}}>Keep ads off</button></div></>:<><span>Advertising {choice==='on'?'on':'off'}</span><button className="btn btn-ghost" onClick={()=>setEditing(true)}>Ad settings</button></>}</section>;
}
function useMedia(query:string){return useSyncExternalStore(callback=>{const media=window.matchMedia(query);media.addEventListener('change',callback);return()=>media.removeEventListener('change',callback);},()=>window.matchMedia(query).matches,()=>false);}
function ActiveAd({unitId,placement}:{unitId:AdUnitId;placement:string}){
 const unit=adUnits[unitId],host=useRef<HTMLElement>(null),frame=useRef<HTMLIFrameElement>(null);
 const [visible,setVisible]=useState(false),[height,setHeight]=useState<number>(unit.height);
 useEffect(()=>{const element=host.current;if(!element)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting&&e.intersectionRatio>=0.25)){setVisible(true);observer.disconnect();}},{threshold:0.25});observer.observe(element);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(unitId!=='native')return;const listener=(event:MessageEvent)=>{if(event.source!==frame.current?.contentWindow||event.data?.type!=='getpaid-ad-size')return;const value=event.data.height;if(typeof value==='number'&&Number.isFinite(value)&&value>0)setHeight(Math.min(1000,Math.max(240,value)));};window.addEventListener('message',listener);return()=>window.removeEventListener('message',listener);},[unitId]);
 return <aside ref={host} className={`ad-slot ad-slot-${placement}`} aria-label="Advertisement" data-ad-unit={unitId}><span className="ad-slot-label">Advertisement</span><div className="ad-slot-surface" style={{width:unit.width||'100%',height}}>{visible&&<iframe ref={frame} src={'/advertising/frame?unit='+unitId} title={`${unitId==='native'?'Native':unitId==='rectangle'?'300 by 250':'728 by 90'} advertisement`} width={unit.width||'100%'} height={height} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin"/>}</div></aside>;
}
export function AdSlot({placement}:{placement:'top'|'native'|'sidebar'}){
 const {enabled,choice}=useContext(AdvertisingContext),pathname=usePathname();
 const wide=useMedia('(min-width: 800px)'),desktop=useMedia('(min-width: 1200px)');
 if(!enabled||choice!=='on'||(placement==='sidebar'&&!desktop))return null;
 const unitId=placement==='native'?'native':placement==='sidebar'?'rectangle':wide?'leaderboard':'rectangle';
 return <ActiveAd key={pathname+':'+unitId} unitId={unitId} placement={placement}/>;
}

