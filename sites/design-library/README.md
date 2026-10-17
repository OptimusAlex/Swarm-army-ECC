# Design library

Measurements from reference websites, gathered with `sites/tools/motion-scanner`. Each folder in
`sites/` holds `scan.json` (everything measured) and `summary.md` (readable digest). Screenshots and
videos stay out of the repo because they belong to the sites' owners. Use these as patterns and
numbers to learn from, never as code or assets to copy.

Scanned on 17 October 2026 from:

- landing.love, business category, page 2 (15 featured sites; iyo.ai timed out)
- Made in Webflow, 3D animation (9 demos)
- oryzo.ai (the reference for the current VH Synergy design)
- squarespace.com, behance.net and Figma's "Top Web design trends for 2026" article
- siteofsites.co and the first 8 sites it featured that day: tlb.betteroff.studio, btay.ca,
  odysseeclinic.com.au, brik.space, letude.group, seventeenagency.com, samthies.com, aino.agency

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

## Second batch: Squarespace, Behance, Figma trends and Site of Sites

| Site | What stands out | Numbers worth reusing |
| --- | --- | --- |
| squarespace.com | Dark full-screen video hero, one large centred headline, a fan of tilted site cards rising from the bottom edge, frosted panels | Radius 30px on cards; blur 25px; standard curve `cubic-bezier(0.645, 0.045, 0.355, 1)` at 300 ms; stat cards fade in over 1200 ms on scroll |
| behance.net | Big three-line headline with one coloured line, floating image tiles around it, pill buttons, sticky search and category chips | Hover 150 to 200 ms; one bright accent (blue) only on the key word and main button |
| odysseeclinic.com.au | Calm clinic site: full-screen soft photo, serif plus grotesk, navy on warm white `#fffcf8`, no rounded corners | Lenis; fades 300 to 500 ms with `cubic-bezier(0.16, 1, 0.3, 1)` |
| letude.group | Bold red, cobalt blue and black studio site, huge wordmark over an image, video tiles | Lenis; 700 ms fades with `cubic-bezier(0.165, 0.84, 0.44, 1)`; 750 ms wipes with `cubic-bezier(0.76, 0, 0.24, 1)` |
| seventeenagency.com | Full motion stack: three.js, GSAP ScrollTrigger, Lenis, Lottie and Barba page transitions | Width reveals 1000 ms with `cubic-bezier(0.32, 0.72, 0, 1)` |
| btay.ca | Friendly illustrated hero for a solo web designer, cream `#f7f4ed`, 16px radius cards | Lenis plus Framer Motion |
| tlb.betteroff.studio | Mono type index, a "enter with sound" start screen, canvas effects | 700 ms moves with expo `cubic-bezier(0.19, 1, 0.22, 1)` |
| aino.agency | ASCII art drawn in characters on an off-white `#f5f5f0` page, mono navigation | Almost no CSS motion; the effect is text based |
| brik.space | AI tool landing: headline with an inline image, a large prompt box with coloured suggestion chips | Hover 150 to 200 ms with `cubic-bezier(0.4, 0, 0.2, 1)` |
| samthies.com | Film maker portfolio, one mono typeface, warm white, image led | Lenis; simple opacity fades 250 to 500 ms |

### Figma trend list for 2026

The article names 13 trends: 3D and immersive elements, experimental navigation, vibrant colour
palettes, bold typography, dark mode, motion design and animation, gamified design, neumorphism,
retrofuturism, maximalism, collage, neo-brutalism ("anti-design") and sustainable web design. It adds
three AI trends: chatbots, voice interfaces and progressive lead nurturing.

### What this batch adds for VH Synergy

- **Already in place:** 3D elements, motion on scroll, smooth scrolling (Lenis is now on 14 of 36
  scanned sites), soft rounded cards close to Squarespace's 30px.
- **Worth adopting:** Behance's single accent word in the headline (one gold word instead of a whole
  coloured line); Squarespace's tilted card fan for showing sample work or reports; brik.space's
  prompt box with suggestion chips as the entry to a free audit; Odyssée's restraint (more space,
  fewer colours) for a calmer consultancy feel.
- **Fits the AI trends:** a chat assistant and progressive lead nurturing (a short audit form that
  asks one question at a time) match Figma's AI trend list and our roadmap.
- **Better avoided for us:** maximalism, neo-brutalism and collage. They suit creative studios such
  as L'Étude but would work against a calm, trustworthy consultancy look.

### Pinterest board (mycre8ivelife, "Website Design")

The board (about 698 pins) opens behind a login pop-up for visitors who are not signed in, and its
pins are still images, so there is no motion to measure and nothing was stored. The visible pins lean
towards dark, photo-led outdoor and food layouts with large condensed headlines. To use it properly,
save the pins you like and share them as images.
