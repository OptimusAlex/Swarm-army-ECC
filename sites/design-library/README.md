# Design library

Measurements from reference websites, gathered with `sites/tools/motion-scanner`. Each folder in
`sites/` holds `scan.json` (everything measured) and `summary.md` (readable digest). Screenshots and
videos stay out of the repo because they belong to the sites' owners. Use these as patterns and
numbers to learn from, never as code or assets to copy.

Scanned on 17 October 2026 from:

- landing.love, business category, page 2 (15 featured sites; iyo.ai timed out)
- Made in Webflow, 3D animation (9 demos)
- oryzo.ai (the reference for the current VH Synergy design)

Dribbble and Awwwards were not reachable from the build machine and are not included yet.

## What the strongest sites share

| Pattern | Seen on | Notes |
| --- | --- | --- |
| Smooth scrolling (Lenis) | 9 of 24 | ivress, diamondrosesanctuary, ownprimland, skylrk, worldofnrg, anima, champions4good, icomat, thisisstudiox |
| Real WebGL 3D (mostly three.js) | 9 of 24 | ivress, drinksom, icomat, skylrk, ownprimland, oryzo, refokus, spline-globe, diamondrosesanctuary |
| GSAP with ScrollTrigger | 2 detected | diamondrosesanctuary, thisisstudiox; Webflow interactions may hide more |
| Warm light page colour | about half of the business sites | ciridae `#eae1ce`, studiox `#f2f0e6`, diamondrose `#dfd7c9`, anima `#f5f6f6` |
| One display face plus a mono for labels | most | ciridae (Pragmatica Cond and Monument Mono), anima (Parabole and Martian Mono), drinksom (Diatype and Diatype Mono) |
| Ease-out quint `cubic-bezier(0.23, 1, 0.32, 1)` | ciridae, skylrk, ownprimland | the most repeated curve; expo `cubic-bezier(0.19, 1, 0.22, 1)` comes second |
| Quick hover feedback, 140 to 200 ms | ciridae, drinksom, skylrk | entrance motion 600 to 1000 ms; ambient loops 4 to 7 s |
| Glass panels, `backdrop-filter: blur(16 to 24px)` | skylrk, drinksom, icomat, anima | used on nav and small panels only |

## Most relevant to VH Synergy

- **ciridae.com**, a business transformation consultancy. Warm cream page, near-black type, one orange
  call to action, condensed uppercase headline, isometric line drawings for a three-stage process
  (3 days, 3 weeks, 3 months), quote cards from clients. Closest match to our offer.
- **anima.ai**, "growing nature-inspired companies". A single 3D natural object behind a large
  headline, light grey page, lime pill buttons, mono labels. The growth story fits our brand.
- **diamondrosesanctuary.com**. Deep green `#20462b` with sand `#dfd7c9` and a serif display, close to
  the green and gold of our logo, with a WebGL scene and GSAP scroll motion.
- **thisisstudiox.com**. Warm off-white, compressed serif with italic emphasis, pinned sections,
  page transitions (Barba).
- **while-scrolling-cards-animation-3d** (Webflow demo). Cards that tilt in 3D as they stack on scroll,
  a good fit for a services or process section.
