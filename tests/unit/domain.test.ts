import { describe, expect, it } from 'vitest';
import { OfferInput, SourceInput, VerificationInput } from '@/src/modules/domain/schemas';
import { decimalRupeesToPaise, paiseFromDatabase } from '@/src/modules/normalize/money';
import fixture from '../fixtures/offer.json';

describe('domain boundaries', () => {
  it('preserves unknowns and code case', () => {
    const offer = OfferInput.parse(fixture);
    expect(offer.minSpendPaise).toBeNull();
    expect(offer.validUntil).toBeNull();
    expect(offer.code).toBeNull();
    expect(OfferInput.parse({...fixture, kind:'CODE',code:' MiXeD '}).code).toBe('MiXeD');
  });
  it.each([{kind:'CODE'}, {minSpendPaise:-1}, {discountPaise:1.1}, {discountBps:10001},
    {maxDiscountPaise:Number.MAX_SAFE_INTEGER+1}, {title:' '}, {validUntil:'tomorrow'},
    {validFrom:'2026-10-30T00:00:00Z',validUntil:'2026-10-29T00:00:00Z'}, {invented:true}])('rejects invalid terms %j', patch => {
    expect(OfferInput.safeParse({...fixture,...patch}).success).toBe(false);
  });
  it('rejects unapproved enabled sources and source claims promoted to checkout assurance', () => {
    expect(SourceInput.safeParse({id:'s',name:'s',enabled:true,permission:'UNREVIEWED',permissionEvidence:null,
      reviewedAt:null,accessMethod:null,allowedHosts:[],attribution:null,requestBudget:1,timeoutMs:1000}).success).toBe(false);
    expect(VerificationInput.safeParse({id:'v',offerId:'o',method:'SOURCE',status:'CHECKOUT_VERIFIED',attemptedAt:'2026-10-29T00:00:00Z',actor:'fixture',evidence:{},failureReason:null,verifierVersion:'1'}).success).toBe(false);
  });
});
it('converts exact paise and checks driver boundaries', () => {
  expect(decimalRupeesToPaise('1000.10')).toBe(100010);
  expect(decimalRupeesToPaise('0.01')).toBe(1);
  expect(decimalRupeesToPaise('90071992547409.91')).toBe(Number.MAX_SAFE_INTEGER);
  for (const token of ['1.001','-1','1e3','₹100','1,000',' 1','90071992547409.92'])
    expect(() => decimalRupeesToPaise(token)).toThrow();
  expect(paiseFromDatabase(null)).toBeNull();
  expect(paiseFromDatabase('100010')).toBe(100010);
  expect(() => paiseFromDatabase('9007199254740992')).toThrow();
});
