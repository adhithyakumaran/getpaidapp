import {afterEach,expect,it,vi} from 'vitest';
import {adUnits,adFrameHtml,adsEnabled,selectAdUnit,nativeFrameOrigin,nativeFrameIsSeparate,type AdPlacement} from '@/src/modules/ads/config';
import {GET} from '@/app/advertising/frame/route';
afterEach(()=>vi.unstubAllEnvs());
it('preserves supplied ad scripts and isolated banner option dictionaries',()=>{
 expect(adUnits.rectangle.src).toBe('https://bauval.org/22/fb1eb20db406f6eb26613b1d7b42b325');expect(adUnits.leaderboard.src).toBe('https://bauval.org/22/223929b640ef66070ae29b3989c19b13');
 expect(adFrameHtml('rectangle')).toContain('"width":300');expect(adFrameHtml('leaderboard')).toContain('"width":728');expect(adFrameHtml('rectangle')).toContain('window.atOptions=');expect(adFrameHtml('native')).toContain('container-c567c1f1857b22c3352292625fe00f45');
});
it('loads ads by default in production, never in development/test or after the build kill switch',()=>{
 expect(adsEnabled({NODE_ENV:'production'})).toBe(true);expect(adsEnabled({NODE_ENV:'production',NEXT_PUBLIC_ADS_ENABLED:'0'})).toBe(false);expect(adsEnabled({NODE_ENV:'development'})).toBe(false);expect(adsEnabled({NODE_ENV:'test'})).toBe(false);
});
it('uses each supplied code once while placing two distinct units in catalogue sidebars',()=>{
 for(const path of['/','/search','/stores/myntra','/fashion-coupons','/guides'])for(const [wide,desktop]of[[false,false],[true,false],[true,true]]){
 const names:AdPlacement[]=['top','native'];if(path!=='/guides')names.push('sidebar','sidebar-native');
 const placements=names.map(p=>selectAdUnit(p,path,wide,desktop)).filter(Boolean);expect(new Set(placements).size).toBe(placements.length);
 }
 expect(selectAdUnit('sidebar-native','/stores/myntra',true,true)).toBe('native');expect(selectAdUnit('native','/stores/myntra',true,true)).toBeNull();expect(selectAdUnit('sidebar','/',false,false)).toBeNull();
});
it('rejects invalid frame requests and honors disabling',()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('NEXT_PUBLIC_ADS_ENABLED','1');for(const query of['unit=https://attacker.invalid/x','unit=rectangle&unit=native','unit=popunder'])expect(GET(new Request('https://getpaid.co.in/advertising/frame?'+query)).status).toBe(404);vi.stubEnv('NEXT_PUBLIC_ADS_ENABLED','0');expect(GET(new Request('https://getpaid.co.in/advertising/frame?unit=rectangle')).status).toBe(404);
});
it('keeps coupon-domain documents opaque and noindexed, with load-status messages',async()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('NEXT_PUBLIC_ADS_ENABLED','1');vi.stubEnv('NATIVE_AD_FRAME_ORIGIN','https://ads-fixture.vercel.app');
 for(const unit of['rectangle','native']){const r=GET(new Request('https://getpaid.co.in/advertising/frame?unit='+unit));expect(r.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');expect(r.headers.get('Content-Security-Policy')).not.toContain('allow-same-origin');expect(await r.text()).toContain('getpaid-ad-status');}
});
it('allows native cookie APIs only on the independent configured ad host, preserving parent origin isolation',()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('NEXT_PUBLIC_ADS_ENABLED','1');vi.stubEnv('NATIVE_AD_FRAME_ORIGIN','https://ads-fixture.vercel.app');
 const r=GET(new Request('https://ads-fixture.vercel.app/advertising/frame?unit=native'));expect(r.headers.get('Content-Security-Policy')).toContain('allow-same-origin');expect(r.headers.get('Content-Security-Policy')).toContain('frame-ancestors https://getpaid.co.in https://www.getpaid.co.in');
 expect(nativeFrameIsSeparate('https://ads-fixture.vercel.app','https://getpaid.co.in')).toBe(true);expect(nativeFrameIsSeparate('https://ads-fixture.vercel.app','https://ads-fixture.vercel.app')).toBe(false);
});
it('never selects the coupon domain, its cookie-sharing subdomains, unsafe schemes or credential URLs as a native host',()=>{
 for(const origin of['https://getpaid.co.in','https://www.getpaid.co.in','https://ads.getpaid.co.in','http://ads-fixture.vercel.app','https://user:pass@ads-fixture.vercel.app','https://ads-fixture.vercel.app/other'])expect(nativeFrameOrigin({NATIVE_AD_FRAME_ORIGIN:origin})).toBeUndefined();
 expect(nativeFrameOrigin({VERCEL_URL:'safe-deployment.vercel.app'})).toBe('https://getpaidapp.vercel.app');expect(nativeFrameOrigin({VERCEL_URL:'getpaid.co.in'})).toBeUndefined();
});
