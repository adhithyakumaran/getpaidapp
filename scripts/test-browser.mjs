import { spawn,execFile } from 'node:child_process';
import {promisify} from 'node:util';
import {randomBytes} from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

try { loadEnvFile('.env.local'); } catch { /* CI supplies environment variables. */ }
assert.ok(process.env.TEST_DATABASE_URL, 'A dedicated TEST_DATABASE_URL is required');
const production=process.argv.includes('--production');
const external=process.argv.includes('--external-server');
const port=production?3121:3120;
const base=`http://127.0.0.1:${port}`;
if(!external) await new Promise((resolve,reject)=>{
  const probe=createServer();probe.once('error',reject);
  probe.listen(port,'127.0.0.1',()=>probe.close(resolve));
});
const child=external?null:spawn(process.execPath,['node_modules/next/dist/bin/next',production?'start':'dev','--hostname','127.0.0.1','--port',String(port)],{
  env:{...process.env,NODE_ENV:production?'production':'development',ENABLE_UI_PREVIEW:'1',DATABASE_URL:process.env.TEST_DATABASE_URL},windowsHide:true,stdio:['ignore','pipe','pipe'],
});
let logs='';child?.stdout.on('data',chunk=>{logs+=chunk;});child?.stderr.on('data',chunk=>{logs+=chunk;});
let browser;
let importRun;
const exec=promisify(execFile);
const shots='docs/screenshots';
await mkdir(shots,{recursive:true});
await mkdir('.data',{recursive:true});
try {
  let ready=false;
  for(let i=0;i<120;i++) {
    if(child && child.exitCode!==null) throw new Error(`Server exited: ${logs}`);
    try { const response=await fetch(base);if(response.ok){ready=true;break;} } catch { /* Server is still starting. */ }
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  assert.ok(ready,'Server did not become ready');
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const visit=async path=>{await page.goto(base+path);await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);};
  const checkAxe=async()=>{const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);};
  await visit('/');
  assert.equal(await page.getByRole('link',{name:'List promo codes',exact:true}).getAttribute('href'),'https://wa.me/919965985951');
  assert.ok(await page.locator('link[rel="icon"]').count()>0);
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
  assert.ok(await page.getByRole('heading',{name:'No published offers yet.'}).isVisible());
  assert.equal(await page.locator('.offer-row').count(),0);
  await page.screenshot({path:`${shots}/homepage-desktop.png`,fullPage:true});
  await checkAxe();
  await page.getByRole('searchbox').fill('headphones');await page.getByRole('button',{name:'Search',exact:true}).click();
  await page.waitForURL('**/search?q=headphones');
  assert.equal(await page.locator('.offer-row').count(),0);
  await visit('/offers/demo-audio-code');assert.ok(await page.getByRole('heading',{name:'That page is not available.'}).isVisible());
  await visit('/guides');assert.equal(await page.locator('.guide-directory a').count(),8);await checkAxe();
  await visit('/how-to-use-coupon-codes-india');assert.ok(await page.locator('article h1').isVisible());assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://getpaid.co.in/how-to-use-coupon-codes-india');await checkAxe();
  await visit('/fashion-coupons');assert.equal(await page.locator('.offer-row').count(),0);await checkAxe();
  await visit('/faq');assert.equal(await page.locator('details').count(),8);await page.locator('summary').first().click();await checkAxe();
  await visit('/contact-report-an-offer');assert.equal(await page.getByRole('link',{name:'adhithyakumaran2005@gmail.com',exact:true}).getAttribute('href'),'mailto:adhithyakumaran2005@gmail.com');
  await page.getByLabel('Merchant',{exact:true}).fill('Myntra');await page.getByLabel('Code or offer title').fill('Example');await page.getByLabel('What happened?').fill('The code was not accepted.');await page.getByRole('button',{name:'Prepare report'}).click();await page.getByText('Report prepared.',{exact:false}).waitFor();assert.match(await page.getByRole('link',{name:'Open email app'}).getAttribute('href'),/^mailto:adhithyakumaran2005@gmail.com/);await checkAxe();
  await page.screenshot({path:shots+'/contact-desktop.png',fullPage:true});
  if(production) {
    for(const path of ['/preview','/preview/offers/demo-audio-code']) {
      await visit(path);assert.ok(await page.getByRole('heading',{name:'That page is not available.'}).isVisible());assert.ok(!(await page.locator('body').innerText()).includes('DEMOAUDIO'));
    }
    assert.equal(await page.getByRole('link',{name:'Design preview',exact:true}).count(),0);
    importRun=randomBytes(6).toString('hex');
    const seeded=await exec(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/browser-import-fixture.ts','seed',importRun],{env:process.env,timeout:30000});
    const imported=JSON.parse(seeded.stdout);
    await visit('/search?q='+encodeURIComponent(imported.code));
    await page.getByRole('heading',{name:imported.title,exact:true}).waitFor();
    assert.equal(await page.locator('.offer-row').count(),1);
    await page.getByRole('link',{name:'View details',exact:true}).click();
    await page.getByText('Submitted on',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Reveal & copy code',exact:true}).click();await page.getByRole('button',{name:'Copied',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),imported.code);
    assert.ok(!(await page.locator('body').innerText()).includes('PRIVATE_BROWSER_TEST'));
    await checkAxe();await page.screenshot({path:`${shots}/supplied-test-desktop.png`,fullPage:true});
    for(const slug of [imported.draftSlug,imported.syntheticSlug]) {await visit('/offers/'+slug);assert.ok(await page.getByRole('heading',{name:'That page is not available.'}).isVisible());}
    console.log('PASS production: noindex, preview blocked despite enabled flag; post-build supplied import appears in search/detail, copies code, hides private evidence, drafts and synthetic records');
  } else {
    await visit('/preview/stores/amazon-india');
    assert.equal(await page.locator('.offer-row').count(),7);
    await page.screenshot({path:`${shots}/store-preview-desktop.png`,fullPage:true});await checkAxe();
    await page.getByRole('link',{name:'Next',exact:true}).click();await page.getByText('Page 2 of 3',{exact:true}).waitFor();
    await page.getByRole('link',{name:'Next',exact:true}).click();await page.getByText('Page 3 of 3',{exact:true}).waitFor();assert.equal(await page.locator('.offer-row').count(),1);
    await page.locator('select[name="category"]').selectOption('audio');await page.locator('select[name="kind"]').selectOption('AUTOMATIC');await page.getByRole('button',{name:'Apply filters'}).click();
    await page.waitForURL('**kind=AUTOMATIC**');await page.getByRole('heading',{name:'Demo: speaker price discount'}).waitFor();assert.equal(await page.locator('.offer-row').count(),1);assert.match(await page.locator('.offer-row').innerText(),/speaker/);
    await visit('/preview');await page.getByRole('searchbox').fill('headphones');await page.getByRole('button',{name:'Search',exact:true}).click();await page.waitForURL('**q=headphones');assert.equal(await page.locator('.offer-row').count(),1);
    await page.getByRole('link',{name:'View details',exact:true}).click();await page.getByRole('button',{name:'Reveal & copy code',exact:true}).click();
    await page.getByRole('button',{name:'Copied',exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'DEMOAUDIO');
    await page.screenshot({path:`${shots}/offer-preview-desktop.png`,fullPage:true});await checkAxe();
    await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Denied');}}});});
    await visit('/preview/offers/demo-audio-code');await page.getByRole('button',{name:'Reveal & copy code',exact:true}).click();assert.match(await page.getByRole('status').innerText(),/select|copy|clipboard/i);
    await visit('/preview/offers/demo-laptop-auto');await page.getByRole('link',{name:'View offer',exact:true}).click();await page.getByRole('heading',{name:'This is a demonstration.'}).waitFor();
    await visit('/preview/offers/demo-stale-cashback');assert.ok(await page.getByText('This observation is older than 24 hours. Check the source for changes.').isVisible());
    await visit('/preview/offers/demo-expired-code');assert.ok(await page.getByRole('button',{name:'Offer expired',exact:true}).isDisabled());await page.screenshot({path:`${shots}/expired-preview.png`,fullPage:true});
    await visit('/preview/search?state=error');assert.ok(await page.locator('main').getByRole('alert').isVisible());
    await page.goto(base+'/preview/search?state=loading');assert.ok(await page.locator('[aria-busy="true"]').isVisible());
    for(const width of [320,375,414,768,1024,1280,1440,1920]) {
      await page.setViewportSize({width,height:1000});await visit('/');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`Homepage overflow at ${width}`);
      await visit('/preview/stores/amazon-india');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`Store overflow at ${width}`);
      const previous=await page.locator('.pagination-controls .btn').nth(0).boundingBox(),next=await page.locator('.pagination-controls .btn').nth(1).boundingBox();assert.ok(previous&&next&&(previous.x+previous.width<=next.x||previous.y+previous.height<=next.y),'Pagination controls overlap at '+width);
      await visit('/preview/offers/demo-audio-code');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`Detail overflow at ${width}`);
    }
    await page.setViewportSize({width:375,height:812});
    await visit('/');const menu=await page.locator('.mobile-menu-button svg').boundingBox();assert.ok(menu && menu.width>=20,'Menu icon must remain visible');
    for(const [path,name] of [['/','homepage-mobile'],['/preview/stores/amazon-india','store-preview-mobile'],['/preview/offers/demo-audio-code','offer-preview-mobile']]) {await visit(path);if(path.includes('/stores/'))assert.ok(await page.locator('.offer-benefit .merchant-logo').first().isVisible(),'Mobile card logos remain visible');await page.screenshot({path:`${shots}/${name}.png`,fullPage:true});await checkAxe();}
    await page.getByRole('button',{name:'Open navigation'}).focus();await page.keyboard.press('Enter');assert.ok(await page.getByRole('navigation',{name:'Mobile navigation'}).isVisible());await page.keyboard.press('Escape');assert.equal(await page.getByRole('navigation',{name:'Mobile navigation'}).count(),0);
    await visit('/');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Skip to content');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement?.id),'main-content');
    if(process.argv.includes('--hallmark')) {
      const report=spawn(process.execPath,['.data/hallmark/skills/hallmark/scripts/sloplint.mjs','app','components/catalogue','--scope','app','--genre','editorial','--render','--url',base,'--url',base+'/preview/stores/amazon-india','--url',base+'/preview/offers/demo-audio-code'],{env:{...process.env,HALLMARK_PUPPETEER:process.cwd()+'/.data/hallmark-tools',CHROME_PATH:chromium.executablePath()},windowsHide:true,stdio:'inherit'});
      const status=await new Promise(resolve=>report.on('exit',resolve));console.log(`Hallmark exit: ${status}`);
    }
    assert.deepEqual(errors,[]);console.log('PASS development: search, filters, pagination, copy + fallback, automatic offer, stale/expired/loading/error, keyboard navigation, 8 viewport widths, axe desktop/mobile, screenshots');
  }
} finally {
  await browser?.close();
  if(importRun)await exec(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/browser-import-fixture.ts','cleanup',importRun],{env:process.env,timeout:30000});
  if(child) {
    if(process.platform==='win32') await new Promise(resolve=>{const stop=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});stop.on('exit',code=>{if(code!==0)console.error(`Could not stop owned server tree ${child.pid}; exit ${code}`);resolve();});});else child.kill('SIGTERM');
  }
  await writeFile(`.data/browser-${production?'production':'development'}.log`,logs);
}



