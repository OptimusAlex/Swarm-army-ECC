# Direction: light page, dark stages

The second redesign. The owner found the oryzo-style dark page dated and asked for a fresh look,
choosing a mix of the two directions proposed in the mood board: a light, premium page (A) and a
dark, cinematic one (B). The choices draw on the reference scan in `sites/design-library/`.

## The idea

A light stone page holds three dark, rounded "stages": the hero, the process story and the
footer. The light world is for reading and deciding (services, the listing tool, consultancy,
the free audit, questions, the form). The dark stages are for the brand's big moments.

One type family changes width between the two worlds:

- Light world: Archivo condensed, heavy, uppercase headlines.
- Dark stages: Archivo wide, light weight, sentence case.
- Both: one italic Bodoni Moda word for warmth (grow, find you, audit, growth).
- Labels: IBM Plex Mono, small and uppercase.

## Colour

| Role | Value |
| --- | --- |
| Page | stone `#e9ece4`, surfaces `#f6f8f2` and `#dde2d6` |
| Light-world type | forest `#10291c`, secondary `#55635a` |
| Gold on light | `#75590a` for text, `#c69a1e` for shapes |
| Stages | night `#050d09`, type mist `#eef3e9`, secondary `#91a198` |
| Glow | signal green `#3ddc97` (lights and dots only), gold `#f2cf4f` |

## Sections

Hero stage (logo medallion with two orbiting light rings) → facts → statement → digital
marketing as bento tiles → search result zoom → listing preview tool → consultancy flip cards →
process stage → free audit card in forest → questions → form → footer stage.

## Motion

Pace follows the scan: quick feedback (140 to 180 ms), entrances around one second, slow loops.

- Smooth scrolling with Lenis (MIT, vendored in `site/vendor/`).
- Hero: headline lines rise, medallion settles, rings orbit with travelling beads, the glow drifts.
- Service tiles rise and tip back as they enter, then lean toward the pointer.
- Process: on wide screens with WebGL, the 3D view stays pinned while the steps scroll past.
  96 blocks rearrange from a scanned page (Audit) to a planning board with a timeline (Plan) to a
  tower with lit windows (Build) to a tree with gold fruit (Grow). Phones, reduced motion and
  devices without WebGL get the four drawn scenes instead.
- Reduced motion: no smooth scrolling, no 3D story, scenes shown finished, the medallion only follows scroll.

## Kept from the first version

The logo medallion, the search result zoom, the listing preview tool, the flip cards, the drawn
process scenes (now the fallback), the typing search query and all copy.
