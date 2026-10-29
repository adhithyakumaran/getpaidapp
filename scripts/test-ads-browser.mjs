import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const port=3124,base='http://127.0.0.1:'+port,nativeOrigin='https://getpaidapp.vercel.app';let logs='';
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,NODE_ENV:'production',DATABASE_URL:'',PUBLIC_CATALOGUE_SNAPSHOT:'1',NATIVE_AD_FRAME_ORIGIN:'',VERCEL_URL:'getpaidapp-fixture.vercel.app'},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);
let browser;try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}if(child.exitCode!==null)throw new Error('Ads test server exited');await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});let mode='mock';const providerRequests=[],otherExternal=[];
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin===nativeOrigin){
   assert.equal(url.pathname,'/advertising/frame');const response=await context.request.get(base+url.pathname+url.search);
   const headers={...response.headers()};headers['content-security-policy']="default-src https: data:; script-src https: 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors "+base+"; sandbox allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";
   await route.fulfill({status:200,headers,body:await response.text()});return;
  }
  if(url.origin===base||['data:','about:','blob:'].includes(url.protocol)){await route.continue();return;}
  if(url.hostname==='quge5.com'&&url.pathname==='/88/tag.min.js'){await route.fulfill({contentType:'application/javascript',body:'window.__mockMonetagLoads=(window.__mockMonetagLoads||0)+1;'});return;}
  if(url.hostname==='bauval.org'){
   providerRequests.push(url.href);if(url.pathname==='/14/5b63cc037017f3182c7f3102e6adf4e0'){await route.fulfill({contentType:'application/javascript',body:'window.__mockSocialBarLoads=(window.__mockSocialBarLoads||0)+1;'});return;}assert.ok(/^\/(21|22)\//.test(url.pathname),'No popunder request');if(mode==='blocked'){await route.abort();return;}
   const native=url.pathname.startsWith('/21/'),id=native?'native':url.pathname.includes('fb1eb20')?'rectangle':'leaderboard';
   const html='<div data-mock-ad="'+id+'" style="font:16px Arial;padding:20px;box-sizing:border-box;height:'+(native?320:id==='rectangle'?250:90)+'px">Mock advertisement - not live inventory</div>';
   const code=native?'void document.cookie;document.getElementById("container-c567c1f1857b22c3352292625fe00f45").innerHTML='+JSON.stringify(html)+';':'if(!window.atOptions||window.atOptions.width!=='+(id==='rectangle'?300:728)+')throw new Error("Wrong options");document.write('+JSON.stringify(html)+');';
   await route.fulfill({contentType:'application/javascript',body:'void document.cookie;'+code+'try{parent.document.documentElement.setAttribute("data-ad-escaped","yes");}catch(e){}'});return;
  }
  otherExternal.push(url.origin);await route.abort();
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const visit=async path=>{await page.goto(base+path);await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);};
 await visit('/');assert.equal(await page.getByRole('button',{name:'Allow ads',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Ad settings',exact:true}).count(),0);
 await page.waitForFunction(()=>window.__mockSocialBarLoads===1);
 await page.waitForFunction(()=>window.__mockMonetagLoads===1);assert.equal(await page.locator('head script#getpaid-monetag').count(),1);
 await page.frameLocator('.ad-slot-top iframe').locator('[data-mock-ad="leaderboard"]').waitFor();assert.ok(providerRequests.length>0,'Loads by default');assert.ok(providerRequests.every(url=>!url.includes('/21/')),'Native still waits for viewport');
 await page.locator('.ad-slot-sidebar').scrollIntoViewIfNeeded();await page.frameLocator('.ad-slot-sidebar iframe').locator('[data-mock-ad="rectangle"]').waitFor();
 await page.locator('.ad-slot-sidebar-native').scrollIntoViewIfNeeded();await page.frameLocator('.ad-slot-sidebar-native iframe').locator('[data-mock-ad="native"]').waitFor();
 assert.equal(await page.locator('[data-ad-unit="native"]').count(),1);assert.equal(await page.locator('[data-ad-unit="rectangle"]').count(),1);assert.equal(await page.locator('.ad-slot-native').count(),0);
 assert.ok((await page.locator('.ad-slot-sidebar-native iframe').getAttribute('src')).startsWith(nativeOrigin));assert.ok((await page.locator('.ad-slot-sidebar-native iframe').getAttribute('sandbox')).includes('allow-same-origin'));assert.equal(await page.locator('.ad-slot-sidebar-native iframe').getAttribute('credentialless'),'');
 assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-ad-escaped')),null);assert.equal(await page.evaluate(()=>typeof window.atOptions),'undefined');
 assert.equal(await page.locator('.ad-slot-sidebar').getAttribute('data-ad-status'),'loaded');assert.equal(await page.locator('.ad-slot-sidebar-native').getAttribute('data-ad-status'),'loaded');
 assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);await mkdir('docs/screenshots',{recursive:true});await page.screenshot({path:'docs/screenshots/ads-default-sidebar-desktop.png',fullPage:true});
 for(const path of ['/guides','/how-to-use-coupon-codes-india','/contact-report-an-offer','/terms','/faq']){await visit(path);await page.frameLocator('.ad-slot-top iframe').locator('[data-mock-ad="leaderboard"]').waitFor();assert.equal(await page.locator('.ad-slot-top iframe').count(),1);assert.equal(await page.locator('[data-ad-unit="native"]').count(),1);}
 await visit('/search?q=MYNTRA300');await page.getByRole('link',{name:'View details',exact:true}).click();await page.getByRole('button',{name:'Reveal & copy code',exact:true}).click();await page.getByRole('button',{name:'Copied',exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'MYNTRA300');
 for(const width of[320,375,414,768,1024,1280,1440,1920]){await page.setViewportSize({width,height:1000});await visit('/');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+width);assert.equal(await page.locator('[data-ad-unit="native"]').count(),1);if(width<1200){assert.equal(await page.locator('.ad-slot-sidebar').count(),0);assert.equal(await page.locator('.ad-slot-sidebar-native').count(),0);}}
 await page.setViewportSize({width:375,height:812});await visit('/');await page.frameLocator('.ad-slot-top iframe').locator('[data-mock-ad="rectangle"]').waitFor();assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);await page.screenshot({path:'docs/screenshots/ads-default-mobile.png',fullPage:true});
 mode='blocked';await visit('/search?q=MYNTRA300');await page.locator('.ad-slot-top[data-ad-status="unavailable"]').waitFor();assert.ok(await page.locator('.ad-slot-top .ad-slot-message').isVisible());assert.equal(await page.locator('.offer-row').count(),1);
 await page.waitForLoadState('networkidle');const before=providerRequests.length;await visit('/preview');await page.getByRole('heading',{name:'That page is not available.'}).waitFor();assert.equal(await page.locator('[data-ad-unit]').count(),0);assert.equal(providerRequests.length,before);
 assert.deepEqual(otherExternal,[]);assert.deepEqual(errors,[]);console.log('PASS mocked default ads: no preference bar; scripts load automatically on view; two distinct desktop sidebar units with no duplicate codes; native cookie API works only on separate origin, parent remains inaccessible; blocked status; copy; eight widths; desktop/mobile axe. No live views/clicks.');
}finally{await browser?.close();if(process.platform==='win32')await new Promise(r=>spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true}).on('exit',r));else child.kill();}
