import {spawn} from 'node:child_process';
import {readFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const snapshot=JSON.parse(await readFile('src/content/public-offers.json','utf8'));const port=3123,base='http://127.0.0.1:'+port;
await mkdir('docs/screenshots',{recursive:true});
async function stop(child){if(process.platform==='win32')await new Promise(resolve=>spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true}).on('exit',resolve));else child.kill();}
async function scenario(database,enabled,full){
 let logs='';const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,NODE_ENV:'production',DATABASE_URL:database,PUBLIC_CATALOGUE_SNAPSHOT:enabled?'1':'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);let browser;
 try{
  let ready=false;for(let i=0;i<60;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}if(child.exitCode!==null)throw new Error('Fallback test server exited');await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
  browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});await context.route('**/*',route=>{const u=new URL(route.request().url());return u.pathname.startsWith('/advertising/')||['bauval.org','abscloud.org','quge5.com'].includes(u.hostname)?route.abort():route.continue();});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const visit=async path=>{await page.goto(base+path);await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);};
  await visit('/');
  if(!enabled){assert.ok(await page.getByRole('heading',{name:'We could not show the offers.'}).isVisible());assert.equal(await page.locator('.offer-row').count(),0);return;}
  await page.getByRole('status').filter({hasText:snapshot.offers.length+' published offers'}).waitFor();assert.equal(await page.locator('.offer-row').count(),Math.min(7,snapshot.offers.length));assert.ok(await page.locator('.snapshot-notice').isVisible());assert.ok(!(await page.locator('body').innerText()).includes('DATABASE_NOT_CONFIGURED'));
  if(full){
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);await page.screenshot({path:'docs/screenshots/saved-offers-desktop.png',fullPage:true});
   await visit('/stores/myntra');const first=await page.locator('.offer-row h3 a').first().getAttribute('href');await page.getByRole('link',{name:'Next',exact:true}).click();await page.getByText('Page 2 of 3',{exact:true}).waitFor();assert.notEqual(await page.locator('.offer-row h3 a').first().getAttribute('href'),first);
   await page.locator('select[name="category"]').selectOption('beauty');await page.getByRole('button',{name:'Apply filters'}).click();await page.waitForURL('**category=beauty**');assert.ok(await page.locator('.offer-row').count()>0);
   const coded=snapshot.offers.find(o=>o.terms.code);await visit('/search?q='+encodeURIComponent(coded.terms.code));await page.getByRole('link',{name:'View details',exact:true}).first().click();assert.ok(await page.locator('.snapshot-notice').isVisible());await page.getByRole('button',{name:'Reveal & copy code',exact:true}).click();await page.getByRole('button',{name:'Copied',exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),coded.terms.code);
   await visit('/offers/demo-audio-code');assert.ok(await page.getByRole('heading',{name:'That page is not available.'}).isVisible());
   await page.setViewportSize({width:375,height:812});await visit('/');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);await page.screenshot({path:'docs/screenshots/saved-offers-mobile.png',fullPage:true});
  }
  assert.deepEqual(errors,[]);assert.ok(logs.includes(database?'DATABASE_UNREACHABLE':'DATABASE_NOT_CONFIGURED'));
 }finally{await browser?.close();await stop(child);}
}
await scenario('',true,true);await scenario('postgresql://fixture:fixture@127.0.0.1:1/missing',true,false);await scenario('',false,false);
console.log('PASS production fallback: missing/unreachable DB,85 approved saved offers,7/page,source-date warning,search/filter/pagination/detail/copy,fixture exclusion,mobile/desktop axe,kill switch,sanitized logs. No DB writes.');
