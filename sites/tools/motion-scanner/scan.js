#!/usr/bin/env node
// Motion scanner: opens each URL in Chromium and records design tokens, CSS motion,
// live animations while scrolling and hovering, 3D/animation libraries, screenshots and a video.
// Usage: node scan.js <url> [url...] [--follow 6] [--out scan-output]
// It stores measurements and patterns for reference. It does not copy site code or assets.

const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (_e) {
  console.error('[motion-scanner] Playwright is missing. Run: npm install && npx playwright install chromium');
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const FOLLOW = Number(flag('--follow', '0'));
const OUT = path.resolve(flag('--out', 'scan-output'));
const urls = args.filter((a) => /^https?:\/\//.test(a));
if (urls.length === 0) {
  console.error('Usage: node scan.js <url> [url...] [--follow 6] [--out scan-output]');
  process.exit(1);
}

const SKIP_HOSTS = /(facebook|twitter|x\.com|instagram|linkedin|youtube|pinterest|tiktok|google|apple\.com|discord|behance|github|t\.co)/i;
const slug = (url) => new URL(url).hostname.replace(/^www\./, '') +
  (new URL(url).pathname.replace(/\/+$/, '').replace(/[^a-z0-9]+/gi, '-') || '');

// Runs inside the page: tokens, libraries, CSS rules and external links.
function collectStatic() {
  const counts = (values) => {
    const map = {};
    values.filter(Boolean).forEach((v) => { map[v] = (map[v] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([value, uses]) => ({ value, uses }));
  };
  const els = [...document.querySelectorAll('body *')].slice(0, 4000);
  const styles = els.map((el) => getComputedStyle(el));
  const visibleText = els.filter((el, i) => el.childNodes[0] && el.childNodes[0].nodeType === 3 &&
    el.textContent.trim() && styles[i].display !== 'none');
  const textStyles = visibleText.map((el) => getComputedStyle(el));

  const tokens = {
    fonts: counts(textStyles.map((s) => s.fontFamily.split(',')[0].replace(/["']/g, '').trim())),
    fontSizes: counts(textStyles.map((s) => s.fontSize)),
    fontWeights: counts(textStyles.map((s) => s.fontWeight)),
    letterSpacing: counts(textStyles.map((s) => s.letterSpacing).filter((v) => v !== 'normal')),
    textColors: counts(textStyles.map((s) => s.color)),
    backgrounds: counts(styles.map((s) => s.backgroundColor).filter((v) => v !== 'rgba(0, 0, 0, 0)')),
    gradients: counts(styles.map((s) => (s.backgroundImage.includes('gradient') ? s.backgroundImage.slice(0, 160) : ''))),
    radii: counts(styles.map((s) => s.borderRadius).filter((v) => v !== '0px')),
    shadows: counts(styles.map((s) => (s.boxShadow !== 'none' ? s.boxShadow : ''))),
    blur: counts(styles.map((s) => (s.backdropFilter && s.backdropFilter !== 'none' ? s.backdropFilter : ''))),
    bodyBackground: getComputedStyle(document.body).backgroundColor
  };

  const transitions = counts(styles.map((s) => (s.transitionDuration !== '0s'
    ? `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}` : '')));

  const keyframes = [];
  const unreadableSheets = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch (_e) { unreadableSheets.push(sheet.href); continue; }
    for (const rule of rules) {
      if (rule.type === CSSRule.KEYFRAMES_RULE) keyframes.push({ name: rule.name, css: rule.cssText.slice(0, 600) });
    }
  }

  const w = window;
  const libraries = {
    three: Boolean(w.THREE || w.__THREE__),
    gsap: Boolean(w.gsap || w.TweenMax),
    scrollTrigger: Boolean(w.ScrollTrigger || (w.gsap && w.gsap.plugins && w.gsap.plugins.scrollTrigger)),
    lenis: Boolean(w.Lenis || w.lenis || document.documentElement.classList.contains('lenis')),
    locomotive: Boolean(document.querySelector('[data-scroll-container]')),
    lottie: Boolean(w.lottie || w.bodymovin || document.querySelector('lottie-player, dotlottie-player')),
    spline: Boolean(document.querySelector('spline-viewer, canvas[data-engine*="spline" i]') ||
      [...document.scripts].some((s) => /spline/i.test(s.src))),
    framerMotion: Boolean(document.querySelector('[data-framer-component-type], [data-framer-name]')),
    webflow: Boolean(w.Webflow || document.documentElement.dataset.wfPage),
    barba: Boolean(w.barba),
    pixi: Boolean(w.PIXI),
    babylon: Boolean(w.BABYLON),
    canvases: document.querySelectorAll('canvas').length,
    webglCanvases: [...document.querySelectorAll('canvas')].filter((c) => {
      try { return Boolean(c.getContext('webgl2') || c.getContext('webgl')); } catch (_e) { return false; }
    }).length,
    videos: document.querySelectorAll('video').length,
    scriptHosts: [...new Set([...document.scripts].map((s) => s.src && new URL(s.src).hostname).filter(Boolean))]
  };

  const sections = [...document.querySelectorAll('section, header, footer, main > div')].slice(0, 30).map((el) => ({
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    heading: (el.querySelector('h1, h2, h3') || {}).textContent?.trim().slice(0, 90) || null,
    height: Math.round(el.getBoundingClientRect().height),
    pinned: getComputedStyle(el).position === 'sticky'
  }));

  const links = [...document.querySelectorAll('a[href^="http"]')].map((a) => a.href);
  return { title: document.title, tokens, transitions, keyframes, unreadableSheets, libraries, sections, links };
}

// Runs inside the page: snapshot of every running Web Animation (CSS and JS driven).
function collectAnimations(label) {
  return document.getAnimations().slice(0, 60).map((a) => {
    const effect = a.effect;
    const timing = effect && effect.getComputedTiming ? effect.getComputedTiming() : {};
    const frames = effect && effect.getKeyframes ? effect.getKeyframes() : [];
    const target = effect && effect.target;
    return {
      when: label,
      name: a.animationName || a.transitionProperty || a.id || 'web-animation',
      kind: a.constructor.name,
      target: target ? `${target.tagName.toLowerCase()}${target.id ? '#' + target.id : ''}${target.classList.length ? '.' + [...target.classList].slice(0, 2).join('.') : ''}` : null,
      duration: timing.duration,
      delay: timing.delay,
      easing: timing.easing,
      iterations: timing.iterations,
      properties: [...new Set(frames.flatMap((f) => Object.keys(f).filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k))))],
      timeline: a.timeline && a.timeline.constructor.name
    };
  });
}

async function scan(browser, url) {
  const dir = path.join(OUT, slug(url));
  fs.mkdirSync(path.join(dir, 'screens'), { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir, size: { width: 1280, height: 800 } },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
  });
  const page = await ctx.newPage();
  const result = { url, scannedAt: new Date().toISOString(), errors: [] };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(dir, 'screens', '00-hero.png') });

    const animations = await page.evaluate(collectAnimations, 'load');
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = 700;
    for (let y = step, i = 1; y < Math.min(height, 40000); y += step, i += 1) {
      await page.mouse.wheel(0, step);
      await page.waitForTimeout(650);
      animations.push(...await page.evaluate(collectAnimations, `scroll ${y}px`));
      if (i % 2 === 0 && i <= 24) await page.screenshot({ path: path.join(dir, 'screens', `${String(i).padStart(2, '0')}-scroll.png`) });
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    const hoverTargets = await page.$$('a, button, [role="button"], h1, h2');
    for (const el of hoverTargets.slice(0, 25)) {
      const box = await el.boundingBox();
      if (!box || box.y > 3000) continue;
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await el.hover({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(250);
      animations.push(...await page.evaluate(collectAnimations, 'hover'));
    }

    Object.assign(result, await page.evaluate(collectStatic));
    const seen = new Set();
    result.animations = animations.filter((a) => {
      const key = `${a.name}|${a.target}|${a.duration}|${a.easing}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    result.pageHeight = height;
  } catch (e) {
    result.errors.push(e.message);
  }
  await ctx.close();
  const video = fs.readdirSync(dir).find((f) => f.endsWith('.webm'));
  if (video) fs.renameSync(path.join(dir, video), path.join(dir, 'scroll.webm'));
  fs.writeFileSync(path.join(dir, 'scan.json'), JSON.stringify(result, null, 2));
  fs.writeFileSync(path.join(dir, 'summary.md'), summarize(result));
  console.log(`[motion-scanner] ${url} -> ${dir}`);
  return result;
}

function summarize(r) {
  const libs = r.libraries ? Object.entries(r.libraries).filter(([k, v]) => v && k !== 'scriptHosts').map(([k, v]) => (v === true ? k : `${k}: ${v}`)) : [];
  const top = (list) => (list || []).slice(0, 6).map((t) => `${t.value} (${t.uses})`).join(', ') || 'none';
  const anim = (r.animations || []).slice(0, 40).map((a) =>
    `| ${a.when} | ${a.name} | ${a.target || ''} | ${Math.round(a.duration) || a.duration} | ${a.easing} | ${a.properties.join(' ')} |`);
  return [
    `# ${r.title || r.url}`, '', `Source: ${r.url}`, `Scanned: ${r.scannedAt}`, '',
    r.errors.length ? `Errors: ${r.errors.join('; ')}\n` : '',
    '## Libraries', '', libs.join(', ') || 'none detected', '',
    '## Tokens', '',
    `- Fonts: ${top(r.tokens && r.tokens.fonts)}`,
    `- Sizes: ${top(r.tokens && r.tokens.fontSizes)}`,
    `- Text colours: ${top(r.tokens && r.tokens.textColors)}`,
    `- Backgrounds: ${top(r.tokens && r.tokens.backgrounds)}`,
    `- Radii: ${top(r.tokens && r.tokens.radii)}`,
    `- Backdrop blur: ${top(r.tokens && r.tokens.blur)}`, '',
    '## Transitions', '', ...(r.transitions || []).slice(0, 10).map((t) => `- ${t.value} (${t.uses})`), '',
    '## Animations seen', '', '| When | Name | Target | ms | Easing | Properties |', '| --- | --- | --- | --- | --- | --- |', ...anim, '',
    '## Sections', '', ...(r.sections || []).map((s) => `- ${s.tag}${s.id ? '#' + s.id : ''} ${s.height}px${s.pinned ? ' pinned' : ''}: ${s.heading || ''}`), ''
  ].join('\n');
}

(async () => {
  const browser = await chromium.launch({ args: process.env.NO_SANDBOX ? ['--no-sandbox'] : [] });
  const index = [];
  for (const url of urls) {
    const r = await scan(browser, url);
    index.push({ url, title: r.title, errors: r.errors });
    if (FOLLOW > 0 && r.links) {
      const host = new URL(url).hostname.replace(/^www\./, '').split('.').slice(-2).join('.');
      const picks = [...new Set(r.links.map((l) => new URL(l).origin + '/'))]
        .filter((l) => !l.includes(host) && !SKIP_HOSTS.test(l)).slice(0, FOLLOW);
      for (const link of picks) {
        const sub = await scan(browser, link);
        index.push({ url: link, from: url, title: sub.title, errors: sub.errors });
      }
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`[motion-scanner] done: ${index.length} pages in ${OUT}`);
})();
