import { expect, it } from 'vitest';
import { testPool } from '../integration/safety';
import { createPool } from '@/src/modules/database/client';
it('refuses missing configuration and unverified remote TLS', () => {
  expect(()=>createPool(undefined)).toThrow('DATABASE_URL');
  expect(()=>createPool('https://example.invalid')).toThrow();
  expect(()=>createPool('postgresql://role:fixture@example.invalid/catalogue')).toThrow('verify-full');
});
it('refuses non-allowlisted test destinations before any connection or reset', async () => {
  const original=process.env.TEST_DATABASE_URL;
  try {
    for (const url of [undefined,'postgresql://coupon_test:fixture@localhost:55433/production',
      'postgresql://admin:fixture@localhost:55433/coupon_integration',
      'postgresql://coupon_test:fixture@remote.invalid:55433/coupon_integration']) {
      if(url) process.env.TEST_DATABASE_URL=url; else delete process.env.TEST_DATABASE_URL;
      await expect(testPool()).rejects.toThrow();
    }
  } finally {
    if(original) process.env.TEST_DATABASE_URL=original; else delete process.env.TEST_DATABASE_URL;
  }
});
