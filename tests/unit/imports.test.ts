import {expect,it} from 'vitest';
import {CouponBatch,canonical,digest,identityHash} from '@/src/modules/imports/schema';
import fixture from '../fixtures/supplied-batch.json';
it('validates batches and keeps missing commercial fields null',()=>{
  const b=CouponBatch.parse(fixture);const terms=b.coupons[0].terms;
  expect(terms.validUntil).toBeNull();expect(terms.minSpendPaise).toBeNull();expect(terms.description).toBeNull();expect(terms.eligibility).toEqual({});
  expect(CouponBatch.safeParse({...fixture,extra:'unrecognized'}).success).toBe(false);
});
it('requires provenance, exact values, safe URLs and explicit approval',()=>{
  const c=fixture.coupons[0];
  for(const coupon of [{...c,evidenceReference:''},{...c,approved:true},{...c,originalUrl:'https://evil.invalid/'},
    {...c,terms:{...c.terms,discountBps:10001}},{...c,terms:{...c.terms,discountPaise:1.1}},
    {...c,terms:{...c.terms,code:null}},{...c,terms:{...c.terms,eligibility:{private:'secret'}}}]) {
    expect(CouponBatch.safeParse({...fixture,coupons:[coupon]}).success).toBe(false);
  }
  expect(CouponBatch.safeParse({...fixture,coupons:[c,c]}).success).toBe(false);
});
it('hashes canonical content independently of JSON key order and presentation title',()=>{
  expect(canonical({b:1,a:2})).toBe(canonical({a:2,b:1}));expect(digest({b:1,a:2})).toBe(digest({a:2,b:1}));
  const c=CouponBatch.parse(fixture).coupons[0];
  expect(identityHash(c)).toBe(identityHash({...c,terms:{...c.terms,title:'Different title'}}));
  expect(identityHash(c)).toBe(identityHash({...c,originalUrl:'https://amazon.in/gp/product/B000FAKE01/'}));
  expect(identityHash(c)).not.toBe(identityHash({...c,terms:{...c.terms,minSpendPaise:100}}));
});
