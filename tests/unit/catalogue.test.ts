import { expect, it } from 'vitest';
import { CatalogueOffer, PUBLIC_PUBLICATION_READY, ShopperUrl, benefit, catalogueHref, conditionLines, offerState, parseCatalogueQuery, previewAllowed } from '@/src/modules/catalogue/model';
import fixture from '../fixtures/offer.json';
const now='2026-10-29T08:00:00Z';
const offer=CatalogueOffer.parse({id:'example',slug:'example',terms:fixture,category:'audio',lifecycle:'UNKNOWN',observedAt:now,
  source:{name:'Test source',url:'https://www.amazon.in/dp/B000FAKE01'},conditions:[],preview:false});
it('does not turn unknown code savings into an automatic offer or cashback into an immediate discount',()=>{
  expect(benefit({...offer,terms:{...offer.terms,kind:'CODE',discountBps:null,discountPaise:null,discountType:null}})).toBe('Coupon code');
  expect(benefit({...offer,terms:{...offer.terms,kind:'CASHBACK',discountBps:1000,discountPaise:null}})).toBe('10% cashback');
});
it('keeps the public publication gate closed and preview restricted to explicitly enabled development',()=> {
  expect(PUBLIC_PUBLICATION_READY).toBe(false);
  expect(previewAllowed('development','1')).toBe(true);
  for(const environment of ['production','test',undefined]) expect(previewAllowed(environment,'1')).toBe(false);
  expect(previewAllowed('development',undefined)).toBe(false);
});
it('validates bounded URL search state and retains filters when paginating',()=> {
  const query=parseCatalogueQuery({q:'  audio  ',category:'audio',kind:'CODE',page:'2'});
  expect(catalogueHref('/stores/myntra',parseCatalogueQuery({store:'myntra'}),{page:2})).toBe('/stores/myntra?page=2');expect(query.q).toBe('audio');expect(catalogueHref('/search',query,{page:3})).toBe('/search?q=audio&category=audio&kind=CODE&page=3');
  for(const raw of [{q:'a'.repeat(121)},{q:['a','b']},{page:'0'},{page:'1001'},{kind:'PUBLISHED'},{category:'secrets'}]) expect(()=>parseCatalogueQuery(raw)).toThrow();
});
it('rejects credential-bearing, operational or off-domain source links',()=> {
  for(const url of ['https://sellingpartnerapi-eu.amazon.com/promotions/2025-12-01/promotions',
    'https://user:secret@www.amazon.in/dp/B000FAKE01','https://www.amazon.in/dp/B000FAKE01?token=secret',
    'javascript:alert(1)','https://evil.invalid/dp/B000FAKE01','http://www.amazon.in/dp/B000FAKE01'])
    expect(ShopperUrl.safeParse(url).success).toBe(false);
});
it('keeps unknown conditions unknown and projects only explicit customer-facing fields',()=> {
  expect(conditionLines({...offer.terms,eligibility:{rawEvidence:'PRIVATE',credentials:'PRIVATE',products:'Selected headphones only.'}})).toEqual(['Selected headphones only.']);
  expect(conditionLines(offer.terms)).toEqual([]);
});
it('distinguishes stale evidence from expired validity, and handles upcoming dates',()=> {
  expect(offerState(offer,now)).toBe('observed');
  expect(offerState({...offer,observedAt:'2026-10-25T08:00:00Z'},now)).toBe('stale');
  expect(offerState({...offer,terms:{...offer.terms,validUntil:'2026-10-28T08:00:00Z'}},now)).toBe('expired');
  expect(offerState({...offer,terms:{...offer.terms,validFrom:'2026-10-30T08:00:00Z'}},now)).toBe('upcoming');
});
