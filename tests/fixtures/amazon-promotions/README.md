# Synthetic Amazon Promotions API fixtures

All samples are hand-authored test data based on the published 2025-12-01
Amazon Promotions API contract. No response was fetched from a live seller account.
The code FAKE20, promotion identifiers, selection identifiers, titles and conditions
are invented solely for deterministic tests. They are not real coupons.

page-1/page-2 cover a group-code basket promotion and an automatic price discount.
Missing commercial terms deliberately remain unknown. The HTML and malformed JSON
files model a changed/error response, not retailer markup intended for scraping.
COUPON/clipping and individual-code cases are constructed in tests and rejected
as unsupported redemption models rather than mislabeled automatic offers.
