import {expect,it} from 'vitest';
import {parseCsv,csvBatch} from '@/src/modules/imports/csv';
const header='record_id,coupon_code,store,category,advertised_offer,conditions_and_limits,source_url,market,collected_at_ist,source_type,verification_status,expiry_date_claimed,duplicate_group_key,notes';
const line='INCP-0001,EXAMPLE,Myntra,Fashion,Source claim,Selected items,https://www.grabon.in/myntra-coupons/,India,2026-10-29,Third party,NOT_TESTED,unknown_or_not_stated,myntra-example,Confirm at checkout';
const now='2026-10-29T08:00:00Z';
it('parses quoted CSV commas, escaped quotes and embedded newlines without executing cell content',()=>{
  expect(parseCsv('a,b\r\n"a,b","a""b\nsecond line"\r\n')).toEqual([{a:'a,b',b:'a"b\nsecond line'}]);
  expect(()=>parseCsv('a,b\n"unclosed')).toThrow();expect(()=>parseCsv('a,b\nx')).toThrow();
});
it('retains source claims and nulls instead of inventing savings or expiry instants',()=>{
  const batch=csvBatch(header+'\n'+line,true,now);
  expect(batch.coupons[0].terms.validUntil).toBeNull();expect(batch.coupons[0].terms.discountPaise).toBeNull();
  expect(batch.coupons[0].terms.retailerId).toBe('myntra');expect(batch.coupons[0].sourceRecord?.verification_status).toBe('NOT_TESTED');
  expect(batch.coupons[0].approved).toBe(true);
});
it('withholds ambiguous merchants, retains their raw data and refuses duplicate row identities',()=>{
  const unknown=line.replace('INCP-0001','INCP-0002').replace('Myntra','Food delivery listing');
  const batch=csvBatch(header+'\n'+line+'\n'+unknown,false,now);expect(batch.coupons).toHaveLength(1);expect(batch.withheldCandidates).toHaveLength(1);
  expect(batch.withheldCandidates[0].reason).toBe('MERCHANT_NOT_IDENTIFIED');
  expect(()=>csvBatch(header+'\n'+line+'\n'+line,false,now)).toThrow('INVALID_CSV_ID');
});
