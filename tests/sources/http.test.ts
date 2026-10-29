import { expect, it } from 'vitest';
import { Requester, isPublicAddress, validateDestination, type HttpResponse, type Transport } from '@/src/modules/sources/http';
import { AMAZON_ENDPOINT, amazonPolicy } from '@/src/modules/sources/amazon-promotions';
const ok:HttpResponse={status:200,headers:{'content-type':'application/json'},body:'{}'};
const url=new URL(AMAZON_ENDPOINT);
function client(transport:Transport, overrides:Partial<typeof amazonPolicy>={}) {
  const controller=new AbortController(); const waits:number[]=[];
  return {controller,waits,requester:new Requester({...amazonPolicy,minIntervalMs:0,...overrides},controller.signal,transport,async(ms,signal)=>{signal.throwIfAborted();waits.push(ms);})};
}
it('retries rate limiting with Retry-After included in the total request budget',async()=> {
  let calls=0;
  const c=client(async()=>++calls===1?{status:429,headers:{'retry-after':'2'},body:''}:ok);
  expect(await c.requester.get(url)).toEqual(ok);
  expect(c.requester.requests).toBe(2); expect(c.waits).toContain(2000);
});
it('does not retry a long Retry-After sooner than requested',async()=> {
  const c=client(async()=>({status:429,headers:{'retry-after':'3600'},body:''}));
  await expect(c.requester.get(url)).rejects.toThrow('RATE_LIMITED');
  expect(c.requester.requests).toBe(1); expect(c.waits).toEqual([]);
});
it('bounds server-error retries and budget across attempts',async()=> {
  const c=client(async()=>({status:503,headers:{},body:''}));
  await expect(c.requester.get(url)).rejects.toThrow('HTTP_ERROR');
  expect(c.requester.requests).toBe(3);
  const limited=client(async()=>({status:503,headers:{},body:''}),{requestBudget:1});
  await expect(limited.requester.get(url)).rejects.toThrow('REQUEST_BUDGET_EXHAUSTED');
  expect(limited.requester.requests).toBe(1);
});
it.each([401,403])('never retries access denial %s',async status=> {
  const c=client(async()=>({status,headers:{},body:'private details'}));
  await expect(c.requester.get(url)).rejects.toThrow('ACCESS_DENIED'); expect(c.requester.requests).toBe(1);
});
it('enforces a timeout even when a transport ignores its abort signal',async()=> {
  const c=client(()=>new Promise(()=>{}),{timeoutMs:10,maxRetries:0});
  await expect(c.requester.get(url)).rejects.toThrow('TIMEOUT');
});
it('cancels an in-flight request without retry',async()=> {
  const c=client(()=>new Promise(()=>{}));
  const pending=c.requester.get(url); c.controller.abort();
  await expect(pending).rejects.toThrow('CANCELLED'); expect(c.requester.requests).toBe(1);
});
it('limits response bytes and rejects non-JSON bodies',async()=> {
  const c=client(async()=>({...ok,body:'x'.repeat(11)}),{maxBytes:10});
  await expect(c.requester.get(url)).rejects.toThrow('RESPONSE_TOO_LARGE');
  const changed=client(async()=>({...ok,headers:{'content-type':'text/html'},body:'<p>changed</p>'}));
  await expect(changed.requester.get(url)).rejects.toThrow('UNEXPECTED_CONTENT_TYPE');
});
it('rejects off-scope redirects before forwarding credentials or following them',async()=> {
  const c=client(async()=>({status:302,headers:{location:'http://169.254.169.254/metadata'},body:''}));
  await expect(c.requester.get(url,{'x-amz-access-token':'synthetic-secret'})).rejects.toThrow('DESTINATION_DENIED');
  expect(c.requester.requests).toBe(1);
  const changed=client(async()=>({status:302,headers:{location:AMAZON_ENDPOINT+'?asins=OUTOFSCOPE'},body:''}));
  await expect(changed.requester.get(url)).rejects.toThrow('REDIRECT_DENIED');
});
it('bounds same-scope redirect loops and counts every request',async()=> {
  const c=client(async()=>({status:302,headers:{location:AMAZON_ENDPOINT},body:''}));
  await expect(c.requester.get(url)).rejects.toThrow('REDIRECT_DENIED'); expect(c.requester.requests).toBe(3);
});
it('enforces HTTPS, exact origin/path/query scope and public destination addresses',()=> {
  for(const candidate of ['http://sellingpartnerapi-eu.amazon.com'+url.pathname,
    AMAZON_ENDPOINT+'#fragment',AMAZON_ENDPOINT+'?unknown=1','https://user:password@sellingpartnerapi-eu.amazon.com'+url.pathname,
    'https://sellingpartnerapi-eu.amazon.com/other','https://sellingpartnerapi-eu.amazon.com.evil.invalid'+url.pathname])
    expect(()=>validateDestination(new URL(candidate),amazonPolicy)).toThrow();
  for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','192.168.1.1','100.64.0.1','::1','fc00::1','fe80::1','::ffff:127.0.0.1','2001:db8::1'])
    expect(isPublicAddress(ip)).toBe(false);
  expect(isPublicAddress('8.8.8.8')).toBe(true); expect(isPublicAddress('2606:4700:4700::1111')).toBe(true);
});
it('applies configured request spacing to sequential requests',async()=> {
  const c=client(async()=>ok,{minIntervalMs:10000});
  await c.requester.get(url); await c.requester.get(url);
  expect(c.waits[0]).toBeGreaterThan(9000);
});
