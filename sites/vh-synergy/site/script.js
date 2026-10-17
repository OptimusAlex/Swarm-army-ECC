// VH Synergy Growth Services: the script the page needs.
// Everything is progressive: without it, all content is visible and the form still submits.
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = () => window.matchMedia('(min-width: 40.01em)').matches;

  // ---------- entrances: reveal once, staggered by order inside each section ----------
  const reveals = document.querySelectorAll('[data-reveal]');
  const counts = new Map();
  reveals.forEach((el) => {
    const host = el.closest('section') || document.body;
    const i = counts.get(host) || 0;
    el.style.setProperty('--i', String(Math.min(i, 6)));
    counts.set(host, i + 1);
  });
  const watched = [...reveals, ...document.querySelectorAll('.facts, .card')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    watched.forEach((el) => io.observe(el));
    window.addEventListener('load', () => setTimeout(() => {
      watched.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    }, 2500));
  } else {
    watched.forEach((el) => el.classList.add('is-in'));
  }

  // ---------- header and reading progress ----------
  const bar = document.querySelector('.bar');
  let ticking = false;
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--progress', String(max > 0 ? Math.min(1, scrollY / max) : 0));
    if (bar) bar.classList.toggle('is-scrolled', scrollY > 24);
    updateRail();
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // ---------- decode: letters scramble, then settle on the real word ----------
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const decode = (el) => {
    if (reduced || el.dataset.decoding) return;
    const text = el.dataset.text || el.textContent;
    el.dataset.text = text;
    el.dataset.decoding = '1';
    const start = performance.now();
    const length = 420;
    const frame = (now) => {
      const p = Math.min(1, (now - start) / length);
      const settled = Math.floor(p * text.length);
      let out = '';
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        out += i < settled || ch === ' ' || /[^A-Za-z0-9]/.test(ch) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else { el.textContent = text; delete el.dataset.decoding; }
    };
    requestAnimationFrame(frame);
  };
  document.querySelectorAll('[data-decode]').forEach((el) => {
    if (el.children.length) return;
    el.setAttribute('aria-label', el.textContent.trim());
    el.addEventListener('pointerenter', () => decode(el));
    el.addEventListener('focus', () => decode(el));
  });
  if ('IntersectionObserver' in window) {
    const headIo = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        decode(entry.target);
        headIo.unobserve(entry.target);
      }
    }, { threshold: 0.6 });
    document.querySelectorAll('h1 [data-decode], h2[data-decode], .step__word').forEach((el) => headIo.observe(el));
  }

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
        setTimeout(tick, 32);
      } else {
        n += 1;
        typed.textContent = queries[q].slice(0, n);
        if (n >= queries[q].length) { deleting = true; setTimeout(tick, 2400); return; }
        setTimeout(tick, 58 + Math.random() * 50);
      }
    };
    setTimeout(tick, 2800);
  }

  // ---------- digital marketing: the rail moves sideways while the page scrolls ----------
  const rail = document.querySelector('.rail');
  const track = document.querySelector('.rail__track');
  const viewport = document.querySelector('.rail__viewport');
  const railIndex = document.getElementById('rail-index');
  let railDistance = 0;
  function sizeRail() {
    if (!rail || !track || !viewport) return;
    if (!wide()) { rail.style.removeProperty('--rail-height'); railDistance = 0; track.style.transform = ''; return; }
    railDistance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    rail.style.setProperty('--rail-height', `${innerHeight + railDistance}px`);
  }
  function updateRail() {
    if (!rail || !track || !railDistance) return;
    const r = rail.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / railDistance));
    track.style.transform = `translate3d(${-p * railDistance}px, 0, 0)`;
    if (railIndex) railIndex.textContent = String(Math.min(6, 1 + Math.round(p * 5)));
  }
  if (viewport && railIndex) {
    viewport.addEventListener('scroll', () => {
      if (wide()) return;
      const card = track.firstElementChild;
      const step = card ? card.getBoundingClientRect().width : 1;
      railIndex.textContent = String(Math.min(6, 1 + Math.round(viewport.scrollLeft / step)));
    }, { passive: true });
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
  const sizeTag = document.querySelector('.dotframe__size');
  if (sizeTag && frame && 'ResizeObserver' in window) {
    new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      sizeTag.textContent = `${Math.round(width)} × ${Math.round(height)}`;
    }).observe(frame);
  }

  // ---------- live thing: see your page as a search result ----------
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

  // ---------- consultancy: cards turn on tap ----------
  document.querySelectorAll('.flip__inner').forEach((btn) => {
    btn.addEventListener('click', () => btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'));
  });

  // ---------- hero: the logo as a 3D medallion ----------
  function startMedal() {
    const canvas = document.getElementById('medal');
    const fallback = document.querySelector('.medal__fallback');
    const THREE = window.THREE;
    if (!canvas || !fallback || !THREE) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (_e) {
      return;
    }
    renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    const texture = new THREE.TextureLoader().load(fallback.currentSrc || fallback.src, () => {
      root.classList.add('has-webgl');
      draw(0);
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

    scene.add(new THREE.AmbientLight(0xfff3dc, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    const warm = new THREE.PointLight(0xf2cf4f, 1.6, 12);
    warm.position.set(-3, -1.5, 3);
    scene.add(warm);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw(performance.now());
    };
    let pointerX = 0;
    let pointerY = 0;
    let tiltX = 0;
    let tiltY = 0;
    window.addEventListener('pointermove', (e) => {
      pointerX = (e.clientX / innerWidth) * 2 - 1;
      pointerY = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });

    function draw(now) {
      const t = now / 1000;
      const hero = canvas.closest('.hero');
      const scrolled = hero ? Math.min(1, Math.max(0, scrollY / hero.offsetHeight)) : 0;
      tiltX += (pointerY * 0.35 - tiltX) * 0.06;
      tiltY += (pointerX * 0.45 - tiltY) * 0.06;
      medal.rotation.x = tiltX + (reduced ? 0.15 : Math.sin(t * 0.7) * 0.06);
      medal.rotation.y = -0.35 + tiltY + scrolled * Math.PI * 1.2 + (reduced ? 0 : Math.sin(t * 0.45) * 0.25);
      medal.position.y = reduced ? 0 : Math.sin(t * 0.9) * 0.04;
      renderer.render(scene, camera);
    }

    let visible = true;
    let raf = 0;
    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (reduced) return;
        if (visible && !raf) raf = requestAnimationFrame(loop);
        if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
      }).observe(canvas);
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    resize();
    if (reduced) window.addEventListener('scroll', () => draw(performance.now()), { passive: true });
    else if (visible) raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { sizeRail(); updateRail(); });
  window.addEventListener('load', () => { sizeRail(); onScroll(); });
  sizeRail();
  onScroll();
  startMedal();

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
