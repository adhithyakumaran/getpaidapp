# Coupon catalogue design system

The owner requested white, black, blue and lime, with distinctive token/ticket
shapes. Preserve the Next.js app and PostgreSQL foundation. This is a catalogue
interface rather than a marketing landing page.

Use Rethink Sans (self-hosted, SIL Open Font License), black text on white,
cobalt for primary actions/focus and lime for the condition ticket and notices.
All colours, typography, spacing and shape decisions live in app/tokens.css and
the declared daisyUI coupon theme. No gradients, fabricated brand logos, badges,
popularity statistics, decorative stock photography or oversized marketing blocks.

The signature is a cut-corner offer ticket: the benefit and redemption action
remain visually separate from the conditions and evidence. Use small control
radii, a 1200px maximum width and a shared comparison layout. Mobile puts the
redemption action directly after the offer heading. Labels use sentence case.

The owner-supplied CSV workflow may publish identifiable merchant records with
source-listed/unverified claims and retained private provenance. Automatic
collection stays behind its separate closed gate. Ambiguous merchants stay
withheld. Synthetic previews require an explicit development flag and banner;
fixtures never seed the application database. Never expose raw operational evidence.

Use actual website image assets from public/brands/manifest.json on brand pages,
directories and coupon tickets, including mobile. Official brand imagery can form
a restrained banner. Never fabricate promotional campaign images. Mask codes
until reveal/copy, with accessible confirmation and a manual fallback. Input focus
uses a compact, visible dark outline.

Hallmark app-screen scope applies: useful density, URL state, meaningful empty,
loading/error/full states and real keyboard controls take priority over landing
page section counts and decorative imagery. The owner's explicit palette and
shape direction take precedence over skill theme suggestions.

Refinement: seven offers per page, real circular alpha-mask cuts, stable blue/lime/paper tones, full-width perforated action row. Desktop uses capped category/advertising and related-offer rails; below 1200px the list has one column. Related cards show actual offer titles; ad spaces are explicitly reserved. Editorial pages share the same type, tokens and accessible controls. Contact opens the supplied email/phone; no fake form submission.
