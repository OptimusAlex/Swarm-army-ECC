# Direction: The sentence is the layout

Dealt by the Taste skill (`design-taste-frontend`), seed 1684932448, sector agency. Full sheet: `.taste-skill/direction.json` (reprint with `node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`).

## The idea

On this page, **the search a future customer types** becomes **the sentence that carries the layout**. The hero sentence holds a live search query; the showcase zooms into a results page; the listing tool lets owners see their own page as a result.

## The live thing

"See your page as customers do": the visitor types a page title and description and sees it as a search result, with length checks and advice. Works without script as a plain form with a sample preview.

## Brand

The owner's logo (VH monogram in a gold ornamental ring on green) sets the palette. Every logo instance sits on a gold disc so it reads on both light and green grounds.

## Type

- Display: Libre Caslon Condensed 400 (Google Fonts), stand-in for the dealt Gambarino because Fontshare was unreachable from the build machine.
- Text: Hanken Grotesk 400 / 500 (Google Fonts), stand-in for the dealt General Sans.

## Colour

| Role | Value |
| --- | --- |
| Ground | `#f7f7f7` |
| Surface | `#ebebeb` |
| Ink (logo green) | `#012f1d` |
| Muted | `#5f6b64` |
| Accent (logo gold) | `#f2cf4f` on actions, the services strip, the pricing field and logo discs |

## Sections

Hero (two fields) → moving services strip → intro statement with inline frames → digital marketing rows with animated drawings → pinned search result at three distances → live listing preview → business consultancy (pinned statement beside the list) → four verbs (Audit, Plan, Build, Grow) → free audit offer on gold → FAQ → contact band with form → footer with the email as the headline.

## Motion

- Signature: colour by chapter (the fixed header takes the ink of the field beneath it).
- Load: the green field rises, the headline lines rise out of their masks, the logo pops in, the hero query types real searches.
- Scroll: a gold reading-progress line; staggered entrances in every section; drawings open like shutters, then their parts move (post grid, chat bubbles, brand swatches, ad budget bar, calendar, report meters); the search result zooms in three stages; the price block wipes in.
- Ambient: the services strip scrolls at a constant pace and pauses under the pointer; the magnifier drifts; the consultancy logo floats.
- Feedback: press scale 0.97 on buttons, arrow nudge on hover, underline motion on links, logo tilt on hover.
- All of it is switched off under reduced motion, and no content depends on script to be visible.

## Taste dials

Design variance 7, motion intensity 6, visual density 5.
