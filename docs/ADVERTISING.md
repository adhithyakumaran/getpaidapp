# Visible advertising integration

## Formats and placements

Production pages load the three owner-supplied visible units automatically when
at least 25% of a placement is in view. There is no preference strip or stored
ad preference. Development, test and synthetic preview routes remain disabled.

| Unit | Script | Placement |
| --- | --- | --- |
| 728x90 | bauval.org/22/223929b640ef66070ae29b3989c19b13 | Below navigation at widths 800px+ |
| 300x250 | bauval.org/22/fb1eb20db406f6eb26613b1d7b42b325 | Below navigation on smaller screens; desktop catalogue sidebar at 1200px+ |
| Native | bauval.org/21/c567c1f1857b22c3352292625fe00f45 | Desktop catalogue sidebar below related coupons; otherwise below page content |

Each supplied key appears at most once per page. Desktop catalogues therefore
have two distinct sidebar units and one top banner. Other layouts have a top
banner and a native unit. Related coupons separate sidebar ads. All placements
say Advertisement and remain separate from search, copy and pagination controls.
Hidden sidebars do not request scripts. Scrolling does not refresh units;
pathname navigation remounts them once, while query-only pagination does not.
Blocked/erroring scripts or a 12-second loading timeout produce an unavailable
notice without affecting coupons. Native height messages are bounded.

The supplied Social Bar and popunder remain uninstalled. There are no overlays,
page-click hooks, fake clicks, timer refreshes or deceptive coupon controls.
No revenue, viewability, fill or click rate is promised.

## Native loading diagnosis and isolation

The supplied native tag reads document.cookie. A downloaded copy replayed with
all outbound requests blocked threw a SecurityError in the previous opaque
sandbox. Both banner tags returned HTTP 200; script availability alone does not
prove creative fill. Direct native execution in the coupon page was rejected by
automatic approval review because it would expose page cookies and data.

Banners continue in opaque sandboxed frames. Native ads instead use an independent
HTTPS origin, with allow-same-origin granted only to that foreign document.
The browser's same-origin policy prevents reading the parent coupon DOM/cookies.
The native iframe also requests credentialless isolation in supporting browsers.
This does not make third-party advertising tracking-free.

The origin defaults to https://VERCEL_URL, Vercel's unique deployment hostname.
Optionally set NATIVE_AD_FRAME_ORIGIN to an independently hosted, publicly
accessible instance of this app. It must not be getpaid.co.in or any subdomain;
non-HTTPS, credentials, paths, query strings and ports are rejected. The parent
also rejects an origin equal to its own. The native response grants cookie APIs
only when its request origin exactly matches configuration. On the coupon domain
it always retains the opaque sandbox. Allowed native ancestors are the bare and
www getpaid.co.in hosts. A protected Vercel deployment URL or a provider origin
restriction needs operator configuration; do not bypass deployment protection.

The allowlisted /advertising/frame endpoint rejects unknown/duplicate units,
emits noindex/nofollow and no-store, and is excluded from the sitemap. Messages
are accepted only from the exact iframe window. Scripts cannot overwrite the
parent's atOptions. Sandbox permissions exclude parent navigation and forms.

## Configuration and review

NEXT_PUBLIC_ADS_ENABLED defaults to enabled in production. Set it to 0 and rebuild/
redeploy to disable all placements and frame endpoints. Ad keys are public
configuration. No database changes or migrations are involved.

FAQ, advertising disclosure and the visibly draft privacy page describe default
loading and possible provider IP/device/origin/cookie data. Provider identity,
retention, geography, account/site approval, authorised ads.txt entries, content
categories and privacy requirements still need operator/provider review. An
independent native hostname may need approval in the advertising account.

## Verification

Run npm test, npm run typecheck, npm run lint, npm run build, then
npm run test:browser:ads, npm run test:browser:production and
npm run test:browser:fallback. Browser suites mock or abort external advertising
requests and never click ads. The ads suite checks default loading, unique keys,
two sidebar units, native cookie compatibility with parent isolation, blocked
status, coupon copy, eight widths and desktop/mobile axe accessibility.
Screenshots ads-default-sidebar-desktop.png and ads-default-mobile.png use mocks,
not live inventory. Actual check outcomes are recorded in PROGRESS.md.

Provider guidance: [banner placement and unique codes](https://adsterra.com/blog/how-banner-ads-make-money/).
Host configuration: [Vercel system variables](https://vercel.com/docs/environment-variables/system-environment-variables).
The isolation design is not represented as provider-certified.
