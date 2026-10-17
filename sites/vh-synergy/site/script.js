// VH Synergy Growth Solution: the script the page needs.
// Everything is progressive: without it, all content is visible and the form still submits.
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storyQuery = window.matchMedia('(min-width: 64em)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- smooth scrolling (Lenis), skipped for reduced motion ----------
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -88 } });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ---------- entrances: reveal once, staggered by order inside each section ----------
  const reveals = document.querySelectorAll('[data-reveal]');
  const counts = new Map();
  reveals.forEach((el) => {
    const host = el.closest('section, ul, dl') || document.body;
    const i = counts.get(host) || 0;
    el.style.setProperty('--i', String(Math.min(i, 6)));
    counts.set(host, i + 1);
  });
  const reveal = (el) => {
    el.classList.add('is-in');
    // After the entrance, tiles switch to a quick transition so the pointer tilt feels direct.
    if (el.classList.contains('tile')) setTimeout(() => el.classList.add('is-settled'), 2200);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
    window.addEventListener('load', () => setTimeout(() => {
      reveals.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) reveal(el);
      });
    }, 2500));
  } else {
    reveals.forEach(reveal);
  }

  // ---------- service tiles lean toward the pointer ----------
  if (finePointer && !reduced) {
    document.querySelectorAll('.tile').forEach((tile) => {
      tile.addEventListener('pointermove', (e) => {
        const r = tile.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tile.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
        tile.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
      });
      tile.addEventListener('pointerleave', () => {
        tile.style.setProperty('--ry', '0deg');
        tile.style.setProperty('--rx', '0deg');
      });
    });
  }

  // ---------- header and reading progress ----------
  const bar = document.querySelector('.bar');
  let ticking = false;
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--progress', String(max > 0 ? Math.min(1, scrollY / max) : 0));
    if (bar) bar.classList.toggle('is-scrolled', scrollY > 24);
    updateSteps();
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // ---------- decode: letters scramble, then settle on the real word ----------
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const decode = (el) => {
    if (reduced || el.dataset.decoding || el.children.length) return;
    const text = el.dataset.text || el.textContent;
    el.dataset.text = text;
    el.dataset.decoding = '1';
    // Hold the element's box so scrambled letters of a different width never move the layout.
    const box = el.getBoundingClientRect();
    const inline = getComputedStyle(el).display === 'inline';
    if (inline) el.style.display = 'inline-block';
    el.style.width = `${box.width}px`;
    el.style.height = `${box.height}px`;
    el.style.overflow = 'visible';
    const start = performance.now();
    const length = 1600;
    let lastSwap = 0;
    let scrambled = text;
    const frame = (now) => {
      const p = Math.min(1, (now - start) / length);
      // Letters settle left to right on an ease-out curve; unsettled letters change about 12 times a second.
      const settled = Math.floor((1 - (1 - p) * (1 - p)) * text.length);
      if (now - lastSwap > 85) {
        lastSwap = now;
        scrambled = [...text].map((ch) => (ch === ' ' || /[^A-Za-z0-9]/.test(ch) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('');
      }
      el.textContent = text.slice(0, settled) + scrambled.slice(settled);
      if (p < 1) { requestAnimationFrame(frame); return; }
      el.textContent = text;
      el.style.width = '';
      el.style.height = '';
      el.style.overflow = '';
      if (inline) el.style.display = '';
      delete el.dataset.decoding;
    };
    requestAnimationFrame(frame);
  };
  document.querySelectorAll('[data-decode]').forEach((el) => {
    if (el.children.length) return;
    el.setAttribute('aria-label', el.textContent.trim());
    el.addEventListener('pointerenter', () => decode(el));
    el.addEventListener('focus', () => decode(el));
  });

  // ---------- the query inside the hero sentence types real searches ----------
  const typed = document.querySelector('.query__text');
  if (typed && !reduced) {
    const queries = JSON.parse(typed.dataset.queries || '[]');
    let q = 0;
    let n = queries[0] ? queries[0].length : 0;
    let deleting = true;
    const tick = () => {
      if (deleting) {
        n -= 1;
        typed.textContent = queries[q].slice(0, n);
        if (n <= 0) { deleting = false; q = (q + 1) % queries.length; }
        setTimeout(tick, 50);
      } else {
        n += 1;
        typed.textContent = queries[q].slice(0, n);
        if (n >= queries[q].length) { deleting = true; setTimeout(tick, 3400); return; }
        setTimeout(tick, 95 + Math.random() * 60);
      }
    };
    setTimeout(tick, 2800);
  }

  // ---------- showcase: one frame, three distances ----------
  const showcase = document.querySelector('.showcase');
  const frame = document.querySelector('.showcase__frame');
  if (showcase && frame && 'IntersectionObserver' in window) {
    const stepIo = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        frame.dataset.stage = entry.target.dataset.step;
        showcase.dataset.stage = entry.target.dataset.step;
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    document.querySelectorAll('.showcase__step').forEach((el) => stepIo.observe(el));
  } else if (showcase) {
    showcase.dataset.stage = '3';
  }

  // the frame shows its own size, like a design tool
  const sizeTag = document.querySelector('.showcase__size');
  if (sizeTag && frame && 'ResizeObserver' in window) {
    new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      sizeTag.textContent = `${Math.round(width)} × ${Math.round(height)}`;
    }).observe(frame);
  }

  // ---------- live tool: see your page as a search result ----------
  const form = document.getElementById('snippet-form');
  if (form) {
    const fields = { title: form.elements.title, desc: form.elements.desc, url: form.elements.url };
    const out = {
      title: document.getElementById('p-title'),
      desc: document.getElementById('p-desc'),
      url: document.getElementById('p-url'),
      cTitle: document.getElementById('c-title'),
      cDesc: document.getElementById('c-desc'),
      verdict: document.getElementById('verdict'),
    };
    const LIMIT_TITLE = 60;
    const LIMIT_DESC = 155;
    const cut = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
    const prettyUrl = (raw) => {
      const clean = raw.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      if (!clean) return 'yourbusiness.com';
      return clean.split('/').filter(Boolean).join(' › ');
    };
    const render = () => {
      const t = fields.title.value.trim();
      const d = fields.desc.value.trim();
      out.title.textContent = cut(t || 'Your page title', LIMIT_TITLE);
      out.desc.textContent = cut(d || 'A sentence or two on what you offer, who it is for, and what to do next.', LIMIT_DESC);
      out.url.textContent = prettyUrl(fields.url.value);
      out.cTitle.textContent = `${t.length} / ${LIMIT_TITLE}`;
      out.cDesc.textContent = `${d.length} / ${LIMIT_DESC}`;
      out.cTitle.classList.toggle('is-over', t.length > LIMIT_TITLE);
      out.cDesc.classList.toggle('is-over', d.length > LIMIT_DESC);
      const notes = [];
      if (!t) notes.push('Add a title: it is the line customers click.');
      else if (t.length > LIMIT_TITLE) notes.push(`Your title is ${t.length - LIMIT_TITLE} characters too long and will likely be cut.`);
      else if (t.length < 25) notes.push('Your title is short. Name the service and who it is for.');
      if (d.length > LIMIT_DESC) notes.push(`Your description runs ${d.length - LIMIT_DESC} characters over.`);
      else if (d && d.length < 70) notes.push('Your description is short. Say what makes you different and what to do next.');
      if (d && !/\b(call|book|visit|order|shop|get|try|contact|enquire|request)\b/i.test(d)) notes.push('Add a next step to the description, such as “Book a visit” or “Order today”.');
      out.verdict.textContent = notes.length ? notes.join(' ') : 'Title and description both fit. Next, make sure the page itself answers the search.';
    };
    form.addEventListener('input', render);
    render();
  }

  // ---------- process: drawn scenes play while on screen (the fallback view) ----------
  const steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const sceneIo = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.classList.toggle('is-playing', entry.isIntersecting);
    }, { threshold: 0.25 });
    steps.forEach((el) => sceneIo.observe(el));
  } else {
    steps.forEach((el) => el.classList.add('is-playing'));
  }

  // Story progress: 0 at the first step, 3 at the last, measured at the middle of the screen.
  const meter = [...document.querySelectorAll('.story__meter li')];
  let storyProgress = 0;
  function updateSteps() {
    if (!root.classList.contains('has-story') || !steps.length) return;
    const mid = innerHeight / 2;
    const centers = steps.map((el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; });
    let p = 0;
    if (mid >= centers[centers.length - 1]) p = centers.length - 1;
    else if (mid > centers[0]) {
      for (let i = 0; i < centers.length - 1; i += 1) {
        if (mid >= centers[i] && mid < centers[i + 1]) { p = i + (mid - centers[i]) / (centers[i + 1] - centers[i]); break; }
      }
    }
    storyProgress = p;
    const active = Math.round(p);
    steps.forEach((el, i) => el.classList.toggle('is-active', i === active));
    meter.forEach((el, i) => el.classList.toggle('is-on', i === active));
  }

  // ---------- consultancy: cards turn on tap ----------
  document.querySelectorAll('.flip__inner').forEach((btn) => {
    btn.addEventListener('click', () => btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'));
  });

  // ---------- shared pointer for the 3D scenes ----------
  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / innerWidth) * 2 - 1;
    pointerY = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  // Runs draw() every frame while the element is on screen, once on resize, and on scroll when motion is reduced.
  function animateWhileVisible(el, canvas, renderer, camera, draw) {
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw(performance.now());
    };
    let raf = 0;
    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (reduced) return;
        if (entry.isIntersecting && !raf) raf = requestAnimationFrame(loop);
        if (!entry.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
      }).observe(el);
    } else if (!reduced) {
      raf = requestAnimationFrame(loop);
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    resize();
    if (reduced) window.addEventListener('scroll', () => draw(performance.now()), { passive: true });
  }

  function makeRenderer(THREE, canvas) {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.outputEncoding = THREE.sRGBEncoding;
      return renderer;
    } catch (_e) {
      return null;
    }
  }

  // ---------- hero: the logo as a glowing medallion with orbiting light rings ----------
  function startMedal() {
    const canvas = document.getElementById('medal');
    const fallback = document.querySelector('.medal__fallback');
    const THREE = window.THREE;
    if (!canvas || !fallback || !THREE) return;
    const renderer = makeRenderer(THREE, canvas);
    if (!renderer) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const texture = new THREE.TextureLoader().load(fallback.currentSrc || fallback.src, () => {
      root.classList.add('has-webgl');
      draw(performance.now());
    });
    texture.encoding = THREE.sRGBEncoding;
    texture.center.set(0.5, 0.5);
    texture.rotation = -Math.PI / 2;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(-1, -1);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const geometry = new THREE.CylinderGeometry(1, 1, 0.13, 128, 1);
    geometry.rotateX(Math.PI / 2);
    const edge = new THREE.MeshStandardMaterial({ color: 0xc9a43a, metalness: 0.85, roughness: 0.3 });
    const face = new THREE.MeshStandardMaterial({ map: texture, metalness: 0.15, roughness: 0.55 });
    const medal = new THREE.Mesh(geometry, [edge, face, face]);
    scene.add(medal);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.03, 16, 180), edge);
    rim.position.z = 0.066;
    medal.add(rim);
    const rimBack = rim.clone();
    rimBack.position.z = -0.066;
    medal.add(rimBack);

    // Two thin rings of light orbit the medallion at different tilts.
    const ringGold = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.006, 8, 240), new THREE.MeshBasicMaterial({ color: 0xdcbf62, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    const ringGreen = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.004, 8, 240), new THREE.MeshBasicMaterial({ color: 0x7cbf98, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }));
    const orbitA = new THREE.Group();
    const orbitB = new THREE.Group();
    orbitA.add(ringGold);
    orbitB.add(ringGreen);
    orbitA.rotation.x = 1.15;
    orbitB.rotation.x = 1.35;
    orbitB.rotation.y = 0.5;
    scene.add(orbitA, orbitB);
    // A small bright bead travels along each ring.
    const bead = (r, color) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), new THREE.MeshBasicMaterial({ color })); m.position.x = r; return m; };
    const beadA = bead(1.32, 0xe8d79a);
    const beadB = bead(1.5, 0xb5d9c3);
    ringGold.add(beadA);
    ringGreen.add(beadB);

    scene.add(new THREE.AmbientLight(0xfff3dc, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    const warm = new THREE.PointLight(0xdcbf62, 1.2, 12);
    warm.position.set(-3, -1.5, 3);
    scene.add(warm);
    const cool = new THREE.PointLight(0x7cbf98, 0.8, 12);
    cool.position.set(3, 1, 2.5);
    scene.add(cool);

    let tiltX = 0;
    let tiltY = 0;
    function draw(now) {
      const t = now / 1000;
      const hero = canvas.closest('.hero');
      const scrolled = hero ? Math.min(1, Math.max(0, scrollY / hero.offsetHeight)) : 0;
      tiltX += (pointerY * 0.35 - tiltX) * 0.035;
      tiltY += (pointerX * 0.45 - tiltY) * 0.035;
      medal.rotation.x = tiltX + (reduced ? 0.15 : Math.sin(t * 0.4) * 0.06);
      medal.rotation.y = -0.35 + tiltY + scrolled * Math.PI * 1.2 + (reduced ? 0 : Math.sin(t * 0.28) * 0.25);
      medal.position.y = reduced ? 0 : Math.sin(t * 0.55) * 0.04;
      ringGold.rotation.z = reduced ? 0.6 : t * 0.35;
      ringGreen.rotation.z = reduced ? 2.4 : -t * 0.22;
      orbitA.rotation.y = tiltY * 0.5;
      orbitB.rotation.x = 1.35 + tiltX * 0.4;
      renderer.render(scene, camera);
    }
    animateWhileVisible(canvas, canvas, renderer, camera, draw);
  }

  // ---------- process: 96 blocks rearrange into Audit, Plan, Build and Grow ----------
  function startStory() {
    const canvas = document.getElementById('story');
    const section = document.getElementById('process');
    const THREE = window.THREE;
    if (!canvas || !section || !THREE || reduced) return;
    const renderer = makeRenderer(THREE, canvas);
    if (!renderer) return;
    const setMode = () => { root.classList.toggle('has-story', storyQuery.matches); updateSteps(); };
    if (storyQuery.addEventListener) storyQuery.addEventListener('change', setMode);
    setMode();

    const N = 96;
    const C = { mist: 0xc9d8c4, sage: 0x8fae94, gold: 0xc9aa52, deep: 0x1d4a33, leaf: 0x3d8455, leaf2: 0x4d9a63, bark: 0x8a7350 };
    // Each layout gives every block a position, a size and a colour.
    const audit = [];
    for (let i = 0; i < N; i += 1) {
      const row = Math.floor(i / 12);
      const col = i % 12;
      // Rows read like lines of text on a page; short last line, a highlighted finding in gold.
      const lineLength = [12, 11, 12, 9, 12, 10, 12, 6][row];
      const on = col < lineLength;
      audit.push({ p: [(col - 5.5) * 0.17, (3.5 - row) * 0.26, 0], s: on ? [0.15, 0.07, 0.07] : [0.001, 0.001, 0.001], c: row === 3 && col < 9 ? C.gold : C.mist });
    }
    const plan = [];
    const columnSizes = [6, 8, 5, 7];
    let k = 0;
    columnSizes.forEach((size, col) => {
      for (let r = 0; r < size; r += 1) {
        plan.push({ p: [(col - 1.5) * 0.52, 0.95 - r * 0.27, 0], s: [0.42, 0.2, 0.05], c: (col + r) % 4 === 0 ? C.gold : C.sage });
        k += 1;
      }
    });
    // The rest become a timeline along the bottom.
    for (let i = k; i < N; i += 1) {
      const j = i - k;
      plan.push({ p: [-1.1 + (j / (N - k - 1)) * 2.2, -1.35, 0], s: [0.035, 0.035, 0.035], c: j % 10 === 0 ? C.gold : C.sage });
    }
    const build = [];
    for (let i = 0; i < N; i += 1) {
      const floor = Math.floor(i / 16);
      const x = i % 4;
      const z = Math.floor(i / 4) % 4;
      const lit = (x + z + floor) % 5 === 0;
      build.push({ p: [(x - 1.5) * 0.24, -1.2 + floor * 0.34, (z - 1.5) * 0.24], s: [0.22, 0.3, 0.22], c: lit ? C.gold : (floor % 2 ? C.sage : C.mist) });
    }
    const grow = [];
    for (let i = 0; i < N; i += 1) {
      if (i < 12) { grow.push({ p: [0, -1.4 + i * 0.13, 0], s: [0.16, 0.14, 0.16], c: C.bark }); continue; }
      if (i < 20) {
        const side = i % 2 ? 1 : -1;
        const j = Math.floor((i - 12) / 2);
        grow.push({ p: [side * (0.15 + j * 0.13), -0.2 + j * 0.12, (j % 2 ? 0.08 : -0.08)], s: [0.1, 0.1, 0.1], c: C.bark });
        continue;
      }
      // Canopy: points spread over a sphere, with gold fruit among the leaves.
      const n = i - 20;
      const phi = Math.acos(1 - 2 * (n + 0.5) / (N - 20));
      const theta = Math.PI * (1 + Math.sqrt(5)) * n;
      const r = 0.82 + ((n * 37) % 10) / 60;
      grow.push({ p: [Math.cos(theta) * Math.sin(phi) * r, 0.55 + Math.cos(phi) * r * 0.78, Math.sin(theta) * Math.sin(phi) * r], s: n % 9 === 0 ? [0.11, 0.11, 0.11] : [0.17, 0.17, 0.17], c: n % 9 === 0 ? C.gold : (n % 3 ? C.leaf : C.leaf2) });
    }
    const layouts = [audit, plan, build, grow];
    const tilts = [[0.0, 0.0], [-0.12, 0.0], [0.35, 0.65], [0.12, 0.0]];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.15 }), N);
    const group = new THREE.Group();
    group.add(mesh);
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xe6f0e2, 0.5));
    const key = new THREE.DirectionalLight(0xf0f5ec, 0.7);
    key.position.set(3, 4, 5);
    scene.add(key);
    const glow = new THREE.PointLight(0x7cbf98, 0.9, 14);
    glow.position.set(-3, -1, 3);
    scene.add(glow);
    const warm = new THREE.PointLight(0xdcbf62, 0.8, 14);
    warm.position.set(3, 2, 2);
    scene.add(warm);

    const dummy = new THREE.Object3D();
    const colA = new THREE.Color();
    const colB = new THREE.Color();
    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    let shown = 0;
    let tiltX = 0;
    let tiltY = 0;
    function draw(now) {
      const t = now / 1000;
      shown += (storyProgress - shown) * 0.06;
      const stage = Math.min(2, Math.floor(shown));
      const local = Math.min(1, Math.max(0, shown - stage));
      const from = layouts[stage];
      const to = layouts[stage + 1];
      for (let i = 0; i < N; i += 1) {
        // Blocks leave one after another, so each change ripples through the form.
        const delay = (i / N) * 0.45;
        const m = ease(Math.min(1, Math.max(0, (local - delay) / 0.55)));
        const a = from[i];
        const b = to[i];
        const lift = Math.sin(m * Math.PI) * 0.35;
        dummy.position.set(a.p[0] + (b.p[0] - a.p[0]) * m, a.p[1] + (b.p[1] - a.p[1]) * m + lift, a.p[2] + (b.p[2] - a.p[2]) * m);
        dummy.scale.set(a.s[0] + (b.s[0] - a.s[0]) * m, a.s[1] + (b.s[1] - a.s[1]) * m, a.s[2] + (b.s[2] - a.s[2]) * m);
        dummy.rotation.set(m * (1 - m) * 2.4, m * (1 - m) * 3.2, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        colA.setHex(a.c);
        colB.setHex(b.c);
        mesh.setColorAt(i, colA.lerp(colB, m));
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      const fromTilt = tilts[stage];
      const toTilt = tilts[stage + 1];
      const tm = ease(local);
      tiltX += (pointerY * 0.18 - tiltX) * 0.04;
      tiltY += (pointerX * 0.3 - tiltY) * 0.04;
      group.rotation.x = fromTilt[0] + (toTilt[0] - fromTilt[0]) * tm + tiltX;
      group.rotation.y = fromTilt[1] + (toTilt[1] - fromTilt[1]) * tm + tiltY + Math.sin(t * 0.3) * 0.12;
      group.position.y = Math.sin(t * 0.6) * 0.04;
      renderer.render(scene, camera);
    }
    animateWhileVisible(section, canvas, renderer, camera, draw);
  }

  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  startMedal();
  startStory();
  onScroll();

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
