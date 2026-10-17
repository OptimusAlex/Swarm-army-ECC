# Direction: dark product page, after oryzo.ai

The owner asked for the design of [oryzo.ai](https://oryzo.ai/) (built by Lusion). The page takes that site's design language and applies it to the VH Synergy brand. It reuses no Oryzo content, imagery or code.

The reference could not be opened from the build machine (network policy), so its traits come from published descriptions: the studio's behind-the-scenes post, a Refero design-system extraction and the Awwwards listing.

## Traits taken from the reference

- A warm near-black page with cream type, and one bright accent used sparingly.
- One typeface for almost everything, set in uppercase at medium weight for display and labels, sentence case for body copy.
- Pill-shaped navigation and buttons.
- A 3D product as the hero, moving with scroll and pointer.
- Dotted "design tool" frames with corner handles.
- A pinned horizontal carousel, 3D flip cards, text that scrambles and decodes on hover, and a spec sheet.

## Applied to this brand

- The 3D product is the owner's logo as a gold-rimmed medallion (three.js r128, vendored in `site/vendor/`, MIT licence). It turns with scroll and tilts with the pointer. Without WebGL it falls back to the flat logo image.
- The spec sheet describes the free growth audit, with real terms only.

## Type

Hanken Grotesk 400 / 500 / 600 (Google Fonts), standing in for Oryzo's Halyard Display, which is a paid font.

## Colour

| Role | Value |
| --- | --- |
| Page | `#07150e`, near-black tinted with the logo green |
| Raised surface | `#0c2117`, `#12301f` |
| Type | `#f3e9d2` cream |
| Secondary type | `#a7ad97` muted olive |
| Accent | `#f2cf4f`, the logo's gold: progress line, small highlights, the "Free" mark, credits |

## Sections

Hero with the medallion → four facts in dotted frames → statement → digital marketing as a pinned horizontal carousel → search result zooming in three stages → listing preview tool → business consultancy as flip cards → process (Audit, Plan, Build, Grow) → free audit spec sheet on cream → FAQ → contact form → footer with the email at display size.

## Motion

- Load: headline lines rise out of masks, the medallion settles in, the hero text decodes.
- Scroll: gold progress line; medallion turns; the carousel moves sideways while the page scrolls (native swipe on phones); search result zooms; sections and drawings enter in sequence.
- Hover: pills fill, headings and labels scramble then settle, process words shift and turn gold, flip cards turn (tap on touch).
- Reduced motion: no scrambling, no flips (both card faces shown), no zoom transitions; the medallion only follows scroll.

## Departures from the Taste skill's house rules

The owner's chosen reference uses uppercase labels, small labels above figures, divider lines, a cream palette and a long pinned carousel, all of which the Taste inspector flags. They are kept on purpose, because the owner's direction takes precedence.
