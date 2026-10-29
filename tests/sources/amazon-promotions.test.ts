import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import page1 from '../fixtures/amazon-promotions/page-1.json';
import page2 from '../fixtures/amazon-promotions/page-2.json';
import empty from '../fixtures/amazon-promotions/empty.json';
import { AmazonPromotionsAdapter, amazonPolicy, AMAZON_ENDPOINT, extractPromotion } from '@/src/modules/sources/amazon-promotions';
import { Requester, type HttpResponse, type Transport } from '@/src/modules/sources/http';
const at='2026-10-29T00:00:00Z';
const response=(data:unknown):HttpResponse=>({status:200,headers:{'content-type':'application/json'},body:JSON.stringify(data)});
const context=(signal=new AbortController().signal)=>({runId:'fixture-run',signal,now:()=>new Date(at)});
function adapter(pages:HttpResponse[], budget=10) {
  const requests:URL[]=[];
  const transport:Transport=async url=>{ requests.push(url); return pages.shift()??response({}); };
  const ctx=context();
  return {requests,ctx,adapter:new AmazonPromotionsAdapter('amazon-in-promotions-fixture',
    new Requester({...amazonPolicy,minIntervalMs:0,maxRetries:0,requestBudget:budget},ctx.signal,transport),['B000FAKE01'],true)};
}
describe('Amazon seller Promotions API extraction (synthetic only)',()=> {
  it('collects paginated code/automatic offers with traceable evidence and exact terms',async()=> {
    const test=adapter([response(page1),response(page2)]);
    const result=await test.adapter.collect(test.ctx);
    expect(result.completeness).toBe('COMPLETE'); expect(result.snapshotAuthoritative).toBe(false);
    expect(result.statistics).toEqual({requests:2,discovered:2,rejected:0});
    const [code,automatic]=result.listings;
    expect(code.terms).toMatchObject({kind:'CODE',code:'FAKE20',minSpendPaise:100010,discountBps:2000,validUntil:null,maxDiscountPaise:null});
    expect(automatic.terms).toMatchObject({kind:'AUTOMATIC',code:null,discountPaise:null,discountBps:null,minSpendPaise:null,
      validFrom:'2026-10-29T01:00:00.000Z',validUntil:'2026-11-01T18:29:00.000Z'});
    expect(automatic.terms.eligibility.customerSegments).toBeNull();
    expect(code.rawEvidenceRef).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(code.rawEvidence).toMatchObject({synthetic:true,ref:code.rawEvidenceRef});
    expect(JSON.parse(code.rawEvidence.rawJson as string)).toEqual(page1.promotions[0]);
    expect(code.originalUrl).toContain(AMAZON_ENDPOINT);
    expect(code.observedAt).toBe(new Date(at).toISOString()); expect(code.sourceReportedVerification).toBeNull();
    expect(test.requests[1].searchParams.get('paginationToken')).toBe('synthetic-page-2');
    expect(test.requests[0].searchParams.get('asins')).toBe('B000FAKE01');
  });
  it('accepts a proven empty query without making it catalogue-authoritative',async()=> {
    const test=adapter([response(empty)]);
    expect(await test.adapter.collect(test.ctx)).toMatchObject({completeness:'COMPLETE',listings:[],snapshotAuthoritative:false,errors:[]});
  });
  it('continues after an empty intermediate page',async()=> {
    const test=adapter([response({totalResults:1,promotions:[],pagination:{nextToken:'next'}}),response({...page2,totalResults:1})]);
    expect(await test.adapter.collect(test.ctx)).toMatchObject({completeness:'COMPLETE',statistics:{discovered:1,requests:2}});
  });
  it('retains partial results on a denied next page',async()=> {
    const test=adapter([response(page1),{status:403,headers:{},body:'denied'}]);
    expect(await test.adapter.collect(test.ctx)).toMatchObject({completeness:'PARTIAL',statistics:{discovered:1},
      errors:[{code:'ACCESS_DENIED',location:'page:2'}]});
  });
  it('reports request-budget exhaustion as partial rather than empty success',async()=> {
    const test=adapter([response(page1)],1);
    const result=await test.adapter.collect(test.ctx);
    expect(result.listings).toHaveLength(1); expect(result.completeness).toBe('PARTIAL');
    expect(result.errors[0].code).toBe('REQUEST_BUDGET_EXHAUSTED');
  });
  it('rejects malformed JSON and changed markup/content type',async()=> {
    const malformed=await readFile(new URL('../fixtures/amazon-promotions/malformed.json',import.meta.url),'utf8');
    const html=await readFile(new URL('../fixtures/amazon-promotions/changed.html',import.meta.url),'utf8');
    for(const [body,type,code] of [[malformed,'application/json','MALFORMED_RESPONSE'],[html,'text/html','UNEXPECTED_CONTENT_TYPE']] as const) {
      const test=adapter([{status:200,headers:{'content-type':type},body}]);
      expect(await test.adapter.collect(test.ctx)).toMatchObject({listings:[],completeness:'PARTIAL',errors:[{code}]});
    }
  });
  it('treats changed JSON schema as extraction failure, never an empty catalogue',async()=> {
    const test=adapter([response({items:[],total:0})]);
    expect(await test.adapter.collect(test.ctx)).toMatchObject({completeness:'PARTIAL',errors:[{code:'SCHEMA_CHANGED'}]});
  });
  it('rejects invalid listings while preserving valid siblings',async()=> {
    const test=adapter([response({totalResults:2,promotions:[{...page1.promotions[0],promotionTitle:''},page2.promotions[0]]})]);
    expect(await test.adapter.collect(test.ctx)).toMatchObject({completeness:'PARTIAL',statistics:{discovered:2,rejected:1},errors:[{code:'INVALID_PROMOTION'}]});
  });
  it.each(['COUPON','INDIVIDUAL'])('does not fabricate supported redemption for %s',kind=> {
    const raw=kind==='COUPON'?{...page2.promotions[0],promotionType:'COUPON'}:
      {...page1.promotions[0],purchaseRequirements:{...page1.promotions[0].purchaseRequirements,claimCode:{type:'INDIVIDUAL'}}};
    expect(()=>extractPromotion(raw,'fixture',AMAZON_ENDPOINT,at,true)).toThrow('UNSUPPORTED_REDEMPTION');
  });
  it('converts a documented fixed discount exactly and rejects excess decimal precision',()=> {
    const raw={...page2.promotions[0],benefit:{discount:{type:'AMOUNT_OFF',amountOff:1000.10,currencyCode:'INR'}}};
    expect(extractPromotion(raw,'fixture',AMAZON_ENDPOINT,at,true).terms.discountPaise).toBe(100010);
    expect(()=>extractPromotion({...raw,benefit:{discount:{...raw.benefit.discount,amountOff:1.001}}},'fixture',AMAZON_ENDPOINT,at,true)).toThrow();
  });
  it('flags inconsistent totals and repeated pagination tokens',async()=> {
    const mismatch=adapter([response({...empty,totalResults:1})]);
    expect((await mismatch.adapter.collect(mismatch.ctx)).errors[0].code).toBe('TOTAL_MISMATCH');
    const loop=adapter([response(page1),response({...page1,promotions:[],pagination:{nextToken:'synthetic-page-2'}})]);
    expect((await loop.adapter.collect(loop.ctx)).errors.some(e=>e.code==='PAGINATION_LOOP')).toBe(true);
  });
  it('honors cancellation before any request',async()=> {
    const test=adapter([response(page1)]); const controller=new AbortController(); controller.abort();
    expect(await test.adapter.collect(context(controller.signal))).toMatchObject({listings:[],errors:[{code:'CANCELLED'}],statistics:{requests:0}});
  });
});
