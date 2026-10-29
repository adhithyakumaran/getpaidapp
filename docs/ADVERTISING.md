# Visible advertising integration

## Active formats and placements

Only the three owner-supplied visible units are configured:

| Unit | Script | Placement |
| --- | --- | --- |
|728x90|bauval.org/22/223929b640ef66070ae29b3989c19b13|Below navigation/preferences on screens800px and wider|
|300x250|bauval.org/22/fb1eb20db406f6eb26613b1d7b42b325|Top placement below800px; one additional catalogue sidebar at1200px and wider|
|Native|bauval.org/21/c567c1f1857b22c3352292625fe00f45|After page content, before the footer|

Regular pages inherit top/native slots from the existing root layout. Home,
search, stores and category catalogue layouts also have one desktop sidebar slot.
Each placement is explicitly labelled Advertisement, separated from search,
reveal/copy and pagination controls. The former fake reserved ad boxes are removed.
Top and sidebar units reserve their known dimensions. Native height is bounded
and reported by its frame. No sticky overlay, timed auto-refresh, click incentive,
click bot, disguised coupon, fake close button or background click generation.
There is no guarantee of more revenue, viewability or clicks.

The supplied bauval.org/14 Social Bar and abscloud.org/1 popunder are **not
installed**. Page-wide click listeners and floating/popup formats do not suit this
restrained placement. All mock tests assert that those URLs are never requested.

The pasted implementation attachment was treated as reference, not instructions:
its placeholder URLs and `_atOptions` array were not copied. Actual iframe banner
snippets require `window.atOptions`; each unit gets its own frame/global dictionary
so sizes and keys cannot overwrite one another.

## Visitor choice and loading

Production only. Initial state makes **no third-party ad requests**. An inline,
nonmodal preference strip offers Allow ads and Keep ads off. The choice is saved
in localStorage for30days; malformed/expired storage is not permission. Ad settings
below the navigation lets visitors change it. If storage is blocked, the choice
lasts in memory. Turning ads off removes frames and stops future requests; it does
not erase data already received by third parties. This is a simple local choice,
not a claim of a certified CMP or comprehensive legal compliance.

After opt-in, each slot requests its script only when at least25% of that slot is
in view. Hidden mobile sidebars never mount a frame. Scrolling does not refresh
an ad. Navigation to another pathname remounts that page's slots once; query-only
pagination does not trigger a refresh. Synthetic preview routes never load ads.
An ad blocker/script failure leaves coupons and navigation functional.

## Isolation and provider compatibility

The allowlisted `/advertising/frame?unit=rectangle|leaderboard|native` route serves
small HTML documents with the exact supplied keys/scripts. It rejects arbitrary
units and duplicate unit parameters. Both the iframe and its response CSP sandbox
permit scripts/pop-up destinations for genuine creative links but do not grant
same-origin access, parent navigation or forms. Provider scripts cannot read the
main page DOM or overwrite its `atOptions`. Frame-to-parent messages only accept
bounded numeric native heights from that exact frame window. Referrers are reduced
to the origin for cross-origin requests. Frames emit noindex/nofollow and are
excluded from the public sitemap/crawl policy.

Third-party code still controls the creative it serves within its frame. Real
fill, origin/referrer checks, sandbox compatibility, content categories and
account approval must be checked by the operator with the provider. No live
creative was requested or clicked during implementation/testing. Request the
provider's authorised ads.txt entries if required; publisher IDs cannot be
inferred from these ad keys. Ad availability and revenue were not invented.

## Configuration and disclosure

`NEXT_PUBLIC_ADS_ENABLED` defaults to enabled for production builds. Set it to0
and **rebuild/redeploy** to remove ad UI and disable frame endpoints. Development
and test environments stay off; use the mocked production suite for local QA.
The units are public configuration, not credentials. No database/migration or
collection changes are involved.

FAQ and advertising disclosure now describe optional paid ads without inventing
merchant partnerships or affiliate tracking. The privacy draft describes the
30-day preference and possible provider IP/device/browser/origin/cookie data.
Provider identity, retention, terms, geography and privacy details still need
operator review; the privacy page remains visibly a draft. Existing noindex is
unchanged.

## Verification

```
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser:ads
npm run test:browser:production
npm run test:browser:fallback
```

The ads suite intercepts every bauval.org request with clearly labelled mock
creatives, aborts all other external origins, never clicks an advertisement, and
checks consent/no requests, lazy loading, separate banner dictionaries, sandbox
parent isolation, route changes, blocked scripts, real coupon copy, eight widths
and mobile/desktop axe. Screenshots `ads-mocked-desktop.png` and
`ads-mocked-mobile.png` show test creatives/placeholders, not live readiness.
CI runs this suite. This prevents automated QA from producing live impressions.

Provider references consulted: [formats](https://adsterra.com/ad-formats/),
[banner/native embedding](https://adsterra.com/blog/how-to-add-ads-to-wix-website-with-ad-codes/)
and [placement guidance](https://adsterra.com/blog/how-put-ads-on-your-website-and-get-paid/).
Our sandbox implementation is an application isolation choice, not a claimed
provider-certified integration.
