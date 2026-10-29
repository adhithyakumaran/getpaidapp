'use client';
import Script from 'next/script';
import {createContext,useContext,useEffect,useRef,useState,useSyncExternalStore,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {adUnits,adsEnabled,selectAdUnit,nativeFrameIsSeparate,type AdPlacement,type AdUnitId} from '@/src/modules/ads/config';
const AdvertisingContext=createContext<{enabled:boolean;nativeOrigin?:string}>({enabled:false});
export function AdvertisingProvider({children,nativeOrigin}:{children:ReactNode;nativeOrigin?:string}){
 const pathname=usePathname();const enabled=adsEnabled({NODE_ENV:process.env.NODE_ENV,NEXT_PUBLIC_ADS_ENABLED:process.env.NEXT_PUBLIC_ADS_ENABLED})&&!pathname.startsWith('/preview');
 return <AdvertisingContext.Provider value={{enabled,nativeOrigin}}>{children}{enabled&&<><script id="getpaid-monetag" src="https://quge5.com/88/tag.min.js" data-zone="303388" async data-cfasync="false"/><Script id="getpaid-social-bar" src="https://bauval.org/14/5b63cc037017f3182c7f3102e6adf4e0" data-cfasync="false" strategy="afterInteractive"/></>}</AdvertisingContext.Provider>;
}
function useMedia(query:string){return useSyncExternalStore(callback=>{const media=window.matchMedia(query);media.addEventListener('change',callback);return()=>media.removeEventListener('change',callback);},()=>window.matchMedia(query).matches,()=>false);}
type AdStatus='loading'|'loaded'|'unavailable';
function ActiveAd({unitId,placement,nativeOrigin}:{unitId:AdUnitId;placement:AdPlacement;nativeOrigin?:string}){
 const unit=adUnits[unitId],host=useRef<HTMLElement>(null),frame=useRef<HTMLIFrameElement>(null);
 const [visible,setVisible]=useState(false),[height,setHeight]=useState<number>(unit.height),[status,setStatus]=useState<AdStatus>('loading');
 useEffect(()=>{const element=host.current;if(!element)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting&&e.intersectionRatio>=0.25)){setVisible(true);observer.disconnect();}},{threshold:0.25});observer.observe(element);return()=>observer.disconnect();},[]);
 useEffect(()=>{const listener=(event:MessageEvent)=>{if(event.source!==frame.current?.contentWindow)return;if(event.data?.type==='getpaid-ad-status'&&(event.data.status==='loaded'||event.data.status==='unavailable'))setStatus(event.data.status);if(unitId==='native'&&event.data?.type==='getpaid-ad-size'){const value=event.data.height;if(typeof value==='number'&&Number.isFinite(value)&&value>0)setHeight(Math.min(1000,Math.max(320,value)));}};window.addEventListener('message',listener);return()=>window.removeEventListener('message',listener);},[unitId]);
 useEffect(()=>{if(!visible||status!=='loading')return;const timer=setTimeout(()=>setStatus('unavailable'),12000);return()=>clearTimeout(timer);},[visible,status]);
 const native=unitId==='native';
 const canLoad=visible&&nativeFrameIsSeparate(nativeOrigin,window.location.origin);
 const unavailable=status==='unavailable'||(visible&&!canLoad);
 const src=(nativeOrigin??'')+'/advertising/frame?unit='+unitId;
 const sandbox='allow-scripts allow-popups allow-popups-to-escape-sandbox'+(canLoad?' allow-same-origin':'');
 return <aside ref={host} className={`ad-slot ad-slot-${placement}`} aria-label="Advertisement" data-ad-unit={unitId} data-ad-status={unavailable?'unavailable':status}><span className="ad-slot-label">Advertisement</span><div className="ad-slot-surface" style={{width:unit.width||'100%',height}}>{canLoad&&<iframe ref={frame} {...{credentialless:true}} src={src} title={`${native?'Native':unit.width+' by '+unit.height} advertisement`} width={unit.width||'100%'} height={height} sandbox={sandbox} referrerPolicy="strict-origin-when-cross-origin" onError={()=>setStatus('unavailable')}/>}</div>{unavailable&&<p className="ad-slot-message" role="status">Advertisement could not load. It may be blocked or unavailable.</p>}</aside>;
}
export function AdSlot({placement}:{placement:AdPlacement}){
 const {enabled,nativeOrigin}=useContext(AdvertisingContext),pathname=usePathname();
 const wide=useMedia('(min-width: 800px)'),desktop=useMedia('(min-width: 1200px)');
 if(!enabled)return null;
 const unitId=selectAdUnit(placement,pathname,wide,desktop);if(!unitId)return null;
 return <ActiveAd key={pathname+':'+unitId} unitId={unitId} placement={placement} nativeOrigin={nativeOrigin}/>;
}
