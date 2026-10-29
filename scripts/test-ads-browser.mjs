import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const port=3124,base='http://127.0.0.1:'+port;let logs='';
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,NODE_ENV:'production',DATABASE_URL:'',PUBLIC_CATALOGUE_SNAPSHOT:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);
let browser;try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}if(child.exitCode!==null)throw new Error('Ads test server exited');await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});let mode='mock';const providerRequests=[];const otherExternal=[];
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.origin===base||['data:','about:','blob:'].includes(url.protocol)){await route.continue();return;}
  if(url.hostname==='bauval.org'){
   providerRequests.push(url.href);assert.ok(/^\/(21|22)\//.test(url.pathname),'No popup/social request');
   if(mode==='blocked'){await route.abort();return;}
   const native=url.pathname.startsWith('/21/');const id=native?'native':url.pathname.includes('fb1eb20')?'rectangle':'leaderboard';
   const html='<div data-mock-ad="'+id+'" style="font:16px Arial;padding:20px;box-sizing:border-box;height:'+(native?320:id==='rectangle'?250:90)+'px">Mock advertisement � test creative, not live inventory</div>';
   const code=native?'document.getElementById("container-c567c1f1857b22c3352292625fe00f45").innerHTML='+JSON.stringify(html)+';': 'if(!window.atOptions||window.atOptions.width!=='+(id==='rectangle'?300:728)+')throw new Error("Wrong isolated options");document.write('+JSON.stringify(html)+');';
   await route.fulfill({contentType:'application/javascript',body:code+'try{parent.document.documentElement.setAttribute("data-ad-escaped","yes");}catch(e){}'});return;
  }
  otherExternal.push(url.origin);await route.abort();
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const visit=async path=>{await page.goto(base+path);await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);};
 await visit('/');await page.getByRole('button',{name:'Allow ads',exact:true}).waitFor();assert.equal(providerRequests.length,0);assert.equal(await page.locator('iframe[src*="advertising/frame"]').count(),0);
 await page.getByRole('button',{name:'Keep ads off',exact:true}).click();await page.getByRole('button',{name:'Ad settings',exact:true}).waitFor();assert.equal(providerRequests.length,0);
 await page.getByRole('button',{name:'Ad settings',exact:true}).click();await page.getByRole('button',{name:'Allow ads',exact:true}).click();
 await page.frameLocator('.ad-slot-top iframe').locator('[data-mock-ad="leaderboard"]').waitFor();assert.ok(providerRequests.every(url=>!url.includes('/21/')),'Below-fold native is not fetched early');
 assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-ad-escaped')),null);assert.equal(await page.evaluate(()=>typeof window.atOptions),'undefined');
 await page.locator('.ad-slot-sidebar').scrollIntoViewIfNeeded();await page.frameLocator('.ad-slot-sidebar iframe').locator('[data-mock-ad="rectangle"]').waitFor();
 assert.equal(await page.locator('.ad-slot-sidebar iframe').getAttribute('sandbox'),'allow-scripts allow-popups allow-popups-to-escape-sandbox');
 await page.locator('.ad-slot-native').scrollIntoViewIfNeeded();await page.frameLocator('.ad-slot-native iframe').locator('[data-mock-ad="native"]').waitFor();assert.equal(await page.locator('[data-ad-unit="native"]').count(),1);
 assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);
 await mkdir('docs/screenshots',{recursive:true});await page.screenshot({path:'docs/screenshots/ads-mocked-desktop.png',fullPage:true});
 for(const path of ['/guides','/how-to-use-coupon-codes-india','/contact-report-an-offer','/terms','/faq']){await visit(path);await page.frameLocator('.ad-slot-top iframe').locator('[data-mock-ad="leaderboard"]').waitFor();assert.equal(await page.locator('.ad-slot-top iframe').count(),1);assert.equal(await page.locator('.ad-slot-native').count(),1);}
 await visit('/search?q=MYNTRA300');await page.getByRole('link',{name:'View details',exact:true}).click();await page.getByRole('button',{name:'Reveal & copy code',exact:true}).click();await page.getByRole('button',{name:'Copied',exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'MYNTRA300');
 for(const width of[320,375,414,768,1024,1280,1440,1920]){await page.setViewportSize({width,height:1000});await visit('/');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No ad overflow '+width);if(width<1200)assert.equal(await page.locator('.ad-slot-sidebar').count(),0);}
 await page.setViewportSize({width:375,height:812});await visit('/');await page.frameLocator('.ad-slot-top iframe').locator('[data-mock-ad="rectangle"]').waitFor();assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);await page.screenshot({path:'docs/screenshots/ads-mocked-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Ad settings',exact:true}).click();const beforeOff=providerRequests.length;await page.getByRole('button',{name:'Keep ads off',exact:true}).click();assert.equal(await page.locator('iframe[src*="advertising/frame"]').count(),0);await visit('/guides');assert.equal(providerRequests.length,beforeOff,'Opt out stops future requests across navigation');
 mode='blocked';await page.getByRole('button',{name:'Ad settings',exact:true}).click();await page.getByRole('button',{name:'Allow ads',exact:true}).click();await page.getByRole('heading',{name:'Better decisions before checkout.'}).waitFor();
 await visit('/search?q=MYNTRA300');assert.equal(await page.locator('.offer-row').count(),1);assert.equal(await page.locator('.ad-slot-top iframe').count(),1);assert.ok((await page.locator('.offer-row').innerText()).includes('Myntra'));
 const beforePreview=providerRequests.length;await visit('/preview');await page.getByRole('heading',{name:'That page is not available.'}).waitFor();assert.equal(await page.locator('iframe[src*="advertising/frame"]').count(),0);assert.equal(providerRequests.length,beforePreview);
 assert.deepEqual(otherExternal,[]);assert.deepEqual(errors,[]);console.log('PASS mocked ads: zero requests before opt-in/after opt-out; exact isolated banner options; native lazy load; no popup/social scripts or parent access; public-page coverage; navigation/no duplicate frames; ad-block failure isolation; copy works; 8 widths; mobile/desktop axe. All provider requests intercepted: no live impressions or clicks.');
}finally{await browser?.close();if(process.platform==='win32')await new Promise(r=>spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true}).on('exit',r));else child.kill();}
