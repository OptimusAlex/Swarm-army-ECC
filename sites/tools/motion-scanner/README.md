# Motion scanner

Opens reference websites in a real browser and records how they look and move, so later
site builds can reuse the patterns. It stores measurements (fonts, colours, timings, easing,
which 3D libraries are used), screenshots and a scroll video. It does not copy any site's code,
images or 3D models.

## Run it on your computer

You need Node.js 18 or newer from <https://nodejs.org>.

```bash
cd sites/tools/motion-scanner
npm install
npm run setup
node scan.js https://www.awwwards.com/websites/3d/ --follow 6
```

`--follow 6` also scans the first six outside sites linked from a gallery page.
Results land in `scan-output/`, one folder per site:

| File | What it holds |
| --- | --- |
| `summary.md` | Readable digest: libraries, tokens, transitions, animations, sections |
| `scan.json` | Everything measured, for tools to read |
| `screens/` | Hero and scroll screenshots |
| `scroll.webm` | Video of the whole scroll |

Zip `scan-output/` and attach it to the chat so the findings can feed the next design.

## Limits

- Effects drawn inside WebGL or canvas only show up as screenshots and video, not numbers.
- Some galleries (Dribbble, Awwwards) may show a cookie banner or bot check; the screenshots
  will show it if so. Open such a page normally once, then try again.
- Respect each site's terms of use; use the findings as inspiration, not as a copy.
