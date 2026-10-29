import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { BlockList, isIP } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { CollectionError } from './contracts';

export interface HttpResponse { status: number; headers: Record<string,string>; body: string }
export type Transport = (url: URL, headers: Record<string,string>, signal: AbortSignal, maxBytes: number) => Promise<HttpResponse>;
export interface RequestPolicy {
  origin: string; path: string; queryKeys: readonly string[]; requestBudget: number;
  timeoutMs: number; maxRetries: number; maxRedirects: number; maxBytes: number;
  minIntervalMs: number; maxWaitMs: number;
}
const blocked = new BlockList();
for (const [ip,prefix] of [ ['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],
  ['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],
  ['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4] ] as const)
  blocked.addSubnet(ip,prefix,'ipv4');
blocked.addSubnet('2001::',23,'ipv6');
blocked.addSubnet('2001:db8::',32,'ipv6');
export function isPublicAddress(ip: string): boolean {
  if (isIP(ip) === 4) return !blocked.check(ip,'ipv4');
  // Restrict IPv6 to global unicast; this also excludes mapped IPv4 and local ranges.
  return isIP(ip) === 6 && /^[23][0-9a-f]{3}:/i.test(ip) && !blocked.check(ip,'ipv6');
}
export function validateDestination(url: URL, policy: RequestPolicy): void {
  if (url.protocol !== 'https:' || url.origin !== policy.origin || url.pathname !== policy.path ||
      url.username || url.password || url.hash || [...url.searchParams.keys()].some(k=>!policy.queryKeys.includes(k)))
    throw new CollectionError('DESTINATION_DENIED');
}
async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  return new Promise((resolve,reject)=> {
    const aborted=()=>reject(signal.reason);
    signal.addEventListener('abort',aborted,{once:true});
    promise.then(resolve,reject).finally(()=>signal.removeEventListener('abort',aborted));
  });
}

// Resolve and pin a public address for each connection, avoiding a DNS check/fetch race.
// HTTPS still verifies the original host's certificate; no cookies or proxy credentials.
export const httpsTransport: Transport = async (url,headers,signal,maxBytes) => {
  const addresses = await abortable(lookup(url.hostname,{all:true,verbatim:true}),signal);
  if (!addresses.length || addresses.some(a=>!isPublicAddress(a.address))) throw new CollectionError('DESTINATION_DENIED');
  const address=addresses.find(a=>a.family===4) ?? addresses[0];
  return new Promise((resolve,reject)=> {
    const req=request(url,{method:'GET',headers,signal,agent:false,family:address.family,servername:url.hostname,
      lookup: (_host,_options,callback)=>callback(null,address.address,address.family)},response=> {
      const chunks: Buffer[]=[];
      let size=0;
      response.on('data',(chunk:Buffer)=> {
        size+=chunk.length;
        if(size>maxBytes) { response.destroy(new CollectionError('RESPONSE_TOO_LARGE')); return; }
        chunks.push(chunk);
      });
      response.on('error',reject);
      response.on('end',()=> {
        const responseHeaders:Record<string,string>={};
        for(const [key,value] of Object.entries(response.headers))
          if(value!==undefined) responseHeaders[key]=Array.isArray(value)?value.join(','):value;
        resolve({status:response.statusCode??0,headers:responseHeaders,body:Buffer.concat(chunks).toString('utf8')});
      });
    });
    req.on('error',reject);
    req.end();
  });
};
export type Sleep = (ms:number,signal:AbortSignal)=>Promise<void>;
const sleep:Sleep=async(ms,signal)=>{ await delay(ms,undefined,{signal}); };

export class Requester {
  requests=0;
  private lastRequestAt: number | null=null;
  constructor(readonly policy: RequestPolicy, private readonly signal: AbortSignal,
    private readonly transport: Transport=httpsTransport, private readonly wait: Sleep=sleep) {
    if(!Number.isInteger(policy.requestBudget) || policy.requestBudget<1 || policy.requestBudget>10 ||
       policy.maxRetries<0 || policy.maxRetries>2 || policy.maxRedirects<0 || policy.maxRedirects>2 ||
       policy.timeoutMs<1 || policy.timeoutMs>10000 || policy.maxBytes<1 || policy.maxBytes>524288)
      throw new CollectionError('INVALID_REQUEST_POLICY');
  }
  async get(input: URL, headers: Record<string,string>={}): Promise<HttpResponse> {
    let url=new URL(input); let retries=0; let redirects=0;
    while(true) {
      if(this.signal.aborted) throw new CollectionError('CANCELLED');
      validateDestination(url,this.policy);
      if(this.requests>=this.policy.requestBudget) throw new CollectionError('REQUEST_BUDGET_EXHAUSTED');
      if(this.lastRequestAt!==null) {
        const spacing=this.policy.minIntervalMs-(Date.now()-this.lastRequestAt);
        if(spacing>0) await this.pause(spacing);
      }
      this.requests++; this.lastRequestAt=Date.now();
      const timeout=AbortSignal.timeout(this.policy.timeoutMs);
      const signal=AbortSignal.any([this.signal,timeout]);
      let response:HttpResponse;
      try {
        response=await abortable(this.transport(url,headers,signal,this.policy.maxBytes),signal);
      } catch(error) {
        if(this.signal.aborted) throw new CollectionError('CANCELLED');
        if(error instanceof CollectionError) throw error;
        if(retries++<this.policy.maxRetries) { await this.pause(100+Math.floor(Math.random()*100)); continue; }
        throw new CollectionError(timeout.aborted?'TIMEOUT':'NETWORK_ERROR');
      }
      if(Buffer.byteLength(response.body)>this.policy.maxBytes) throw new CollectionError('RESPONSE_TOO_LARGE');
      if(response.status>=300 && response.status<400) {
        if(!response.headers.location || redirects++>=this.policy.maxRedirects) throw new CollectionError('REDIRECT_DENIED');
        let target:URL;
        try { target=new URL(response.headers.location,url); } catch { throw new CollectionError('REDIRECT_DENIED'); }
        validateDestination(target,this.policy);
        if(target.search!==url.search) throw new CollectionError('REDIRECT_DENIED');
        url=target; // Never forward auth across an unapproved redirect.
        continue;
      }
      if(response.status===401 || response.status===403) throw new CollectionError('ACCESS_DENIED');
      if([429,500,502,503,504].includes(response.status)) {
        const raw=response.headers['retry-after'];
        const parsed=raw===undefined?0: (/^\d+$/.test(raw)?Number(raw)*1000:Date.parse(raw)-Date.now());
        const backoff=Math.max(Number.isFinite(parsed)?parsed:0,250*2**retries+Math.floor(Math.random()*100));
        if(retries++>=this.policy.maxRetries || backoff>this.policy.maxWaitMs)
          throw new CollectionError(response.status===429?'RATE_LIMITED':'HTTP_ERROR');
        await this.pause(backoff); continue;
      }
      if(response.status!==200) throw new CollectionError('HTTP_ERROR');
      if(!/^application\/json(?:;|$)/i.test(response.headers['content-type']??'')) throw new CollectionError('UNEXPECTED_CONTENT_TYPE');
      return response;
    }
  }
  private async pause(ms:number) {
    try { await this.wait(ms,this.signal); }
    catch { throw new CollectionError(this.signal.aborted?'CANCELLED':'WAIT_FAILED'); }
  }
}
