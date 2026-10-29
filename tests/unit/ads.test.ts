import {afterEach,expect,it,vi} from 'vitest';
import {AD_PREFERENCE_KEY,adUnits,adFrameHtml,adsEnabled,parseAdPreference} from '@/src/modules/ads/config';
import {GET} from '@/app/advertising/frame/route';
afterEach(()=>vi.unstubAllEnvs());
it('retains the supplied visible ad URLs and separate banner option dictionaries',()=>{
 expect(adUnits.rectangle.src).toBe('https://bauval.org/22/fb1eb20db406f6eb26613b1d7b42b325');
 expect(adUnits.leaderboard.src).toBe('https://bauval.org/22/223929b640ef66070ae29b3989c19b13');
 expect(adFrameHtml('rectangle')).toContain('"width":300');expect(adFrameHtml('leaderboard')).toContain('"width":728');
 expect(adFrameHtml('rectangle')).toContain('window.atOptions=');expect(adFrameHtml('rectangle')).not.toContain('_atOptions');
 expect(adFrameHtml('native')).toContain('container-c567c1f1857b22c3352292625fe00f45');
 for(const id of ['rectangle','leaderboard','native'] as const){expect(adFrameHtml(id)).not.toContain('abscloud.org');expect(adFrameHtml(id)).not.toContain('window.open');}
});
it('requires a valid unexpired on/off choice instead of treating missing/tampered storage as consent',()=>{
 expect(AD_PREFERENCE_KEY).toBe('getpaid-ad-preference-v1');
 for(const raw of [null,'bad json','{}',JSON.stringify({choice:'on',expires:1}),JSON.stringify({choice:'yes',expires:200})])expect(parseAdPreference(raw,100)).toBe('unknown');
 expect(parseAdPreference(JSON.stringify({choice:'on',expires:200}),100)).toBe('on');expect(parseAdPreference(JSON.stringify({choice:'off',expires:200}),100)).toBe('off');
});
it('keeps production ads disabled in development/test and respects the build-time kill switch',()=>{
 expect(adsEnabled({NODE_ENV:'production'})).toBe(true);expect(adsEnabled({NODE_ENV:'production',NEXT_PUBLIC_ADS_ENABLED:'0'})).toBe(false);
 expect(adsEnabled({NODE_ENV:'development'})).toBe(false);expect(adsEnabled({NODE_ENV:'test'})).toBe(false);
});
it('rejects arbitrary, repeated and disabled ad frame requests without embedding arbitrary script URLs',()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('NEXT_PUBLIC_ADS_ENABLED','1');
 for(const query of['unit=https://attacker.invalid/x','unit=rectangle&unit=native','unit=popunder'])expect(GET(new Request('https://getpaid.co.in/advertising/frame?'+query)).status).toBe(404);
 vi.stubEnv('NEXT_PUBLIC_ADS_ENABLED','0');expect(GET(new Request('https://getpaid.co.in/advertising/frame?unit=rectangle')).status).toBe(404);
});
it('isolates provider scripts from the parent with noindex, sandbox and restricted navigation/form policies',async()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('NEXT_PUBLIC_ADS_ENABLED','1');
 const response=GET(new Request('https://getpaid.co.in/advertising/frame?unit=rectangle'));
 expect(response.status).toBe(200);expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
 const policy=response.headers.get('Content-Security-Policy')!;expect(policy).toContain('sandbox allow-scripts allow-popups');expect(policy).not.toContain('allow-same-origin');expect(policy).toContain("form-action 'none'");expect(policy).toContain("base-uri 'none'");
 expect(await response.text()).toContain(adUnits.rectangle.src);
});
