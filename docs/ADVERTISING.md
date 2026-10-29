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

The supplied Social Bar now loads once through next/script after hydration on
production public pages, per the owner?s explicit request. The provider controls
its floating formats. It runs in the main page context; the separate-origin
isolation below applies to banner/native units, not the Social Bar. The popunder
remains uninstalled. No custom fake clicks, timer refreshes or deceptive coupon
controls are added.
No revenue, viewability, fill or click rate is promised.

## Native loading diagnosis and isolation

The supplied native tag reads document.cookie. A downloaded copy replayed with
all outbound requests blocked threw a SecurityError in the previous opaque
sandbox. Both banner tags returned HTTP 200; script availability alone does not
prove creative fill. Direct native execution in the coupon page was rejected by
automatic approval review because it would expose page cookies and data.

Banner and native ads use an independent HTTPS origin, with allow-same-origin
granted only to that foreign document. The banner frames previously remained
opaque while only native frames received this compatibility change; this is now
consistent across all three display units.
The browser's same-origin policy prevents reading the parent coupon DOM/cookies.
The native iframe also requests credentialless isolation in supporting browsers.
This does not make third-party advertising tracking-free.

On Vercel, the origin defaults to this app's public production alias,
https://getpaidapp.vercel.app. Generated deployment URLs require Vercel SSO here
and cannot serve public ad frames. The existing production alias was verified
public with the exact app/native tag using HTTP-only requests.
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

## Supplied service-worker file

The owner-supplied sw.js has moved from the repository root to public/sw.js,
so Next.js serves its unchanged contents at https://www.getpaid.co.in/sw.js.
The latest supplied sw (1).js replaces the older worker: the served file now
imports 5gvci.com with zone 12149211, unchanged from the supplied download.
MultiTag may register this worker and offer push notifications; browser
notification permission is controlled by the visitor.

## Monetag MultiTag

The exact quge5.com/88/tag.min.js script with data-zone=303388, async and
data-cfasync=false is installed for production public pages. React 19 hoists
async external scripts into the document head and deduplicates by src. Existing
dev/test/initial-preview gating and the advertising kill switch are retained.
No verification meta tag was added, following the owner?s cancellation.

MultiTag automatically manages formats and placement; there is no manual left
sidebar container. It can serve Onclick, Push Notifications, In-Page Push and
Vignette Banner formats alongside existing advertising. Account settings control
the mix. The provider script runs in the main page context; disclosures describe
this, and mocked/blocked browser QA prevents generating live traffic.

References: [Monetag installation](https://help.monetag.com/en/articles/6726318-how-do-i-get-started-as-a-publisher-paste-the-ad-tag-into-your-website),
[MultiTag formats](https://help.monetag.com/en/articles/6726670-multitag-all-in-one),
[React async script head placement](https://react.dev/reference/react-dom/components/script).
