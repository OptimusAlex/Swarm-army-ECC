// VH Synergy Growth Services: the small amount of script the page needs.
// Everything here is progressive: without it, all content is visible and the form still submits.
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // Section entrances: reveal once, staggered by order inside each section.
  const reveals = document.querySelectorAll('[data-reveal]');
  const sections = new Map();
  reveals.forEach((el) => {
    const host = el.closest('section') || document.body;
    const i = sections.get(host) || 0;
    el.style.setProperty('--i', String(Math.min(i, 6)));
    sections.set(host, i + 1);
  });
  const verbs = document.querySelectorAll('.verb');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
    verbs.forEach((el) => io.observe(el));
    // Safety net: never leave something on screen hidden.
    window.addEventListener('load', () => setTimeout(() => {
      reveals.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    }, 2500));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // Colour by chapter: the header takes the ink and ground of the chapter beneath it.
  const chapters = document.querySelectorAll('[data-ink]');
  const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
  const ink = getComputedStyle(root).getPropertyValue('--ink').trim();
  if ('IntersectionObserver' in window) {
    const chapterIo = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const { ink: chapterInk, ground } = entry.target.dataset;
        root.style.setProperty('--header-ink', chapterInk);
        root.style.setProperty('--header-ground', ground);
        const onAccent = ground.toLowerCase() === accent.toLowerCase();
        root.style.setProperty('--header-btn', onAccent ? ink : accent);
        root.style.setProperty('--header-btn-ink', onAccent ? accent : ink);
      }
    }, { rootMargin: '0px 0px -94% 0px', threshold: 0 });
    chapters.forEach((el) => chapterIo.observe(el));
  }

  // The query inside the hero sentence types the searches real students make.
  const typed = document.querySelector('.query__text');
  if (typed && !reduced) {
    const queries = JSON.parse(typed.dataset.queries || '[]');
    let q = 0;
    let n = queries[0] ? queries[0].length : 0;
    let deleting = true;
    const tick = () => {
      const word = queries[q];
      if (deleting) {
        n -= 1;
        typed.textContent = word.slice(0, n);
        if (n <= 0) { deleting = false; q = (q + 1) % queries.length; }
        setTimeout(tick, 32);
      } else {
        const next = queries[q];
        n += 1;
        typed.textContent = next.slice(0, n);
        if (n >= next.length) { deleting = true; setTimeout(tick, 2400); return; }
        setTimeout(tick, 58 + Math.random() * 50);
      }
    };
    setTimeout(tick, 2600);
  }

  // Showcase: one frame, three distances, switched by invisible markers.
  const showcase = document.querySelector('.showcase');
  const frame = document.querySelector('.showcase__frame');
  if (showcase && frame && 'IntersectionObserver' in window) {
    const stepIo = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const stage = entry.target.dataset.step;
        frame.dataset.stage = stage;
        showcase.dataset.stage = stage;
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    document.querySelectorAll('.showcase__step').forEach((el) => stepIo.observe(el));
  } else if (showcase) {
    showcase.dataset.stage = '3';
  }

  // Live thing: write your listing and see it as a search result.
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
      if (!clean) return 'yourschool.com';
      return clean.split('/').filter(Boolean).join(' › ');
    };
    const render = () => {
      const t = fields.title.value.trim();
      const d = fields.desc.value.trim();
      out.title.textContent = cut(t || 'Your course title', LIMIT_TITLE);
      out.desc.textContent = cut(d || 'A sentence or two on who the course is for and what they will get.', LIMIT_DESC);
      out.url.textContent = prettyUrl(fields.url.value);
      out.cTitle.textContent = `${t.length} / ${LIMIT_TITLE}`;
      out.cDesc.textContent = `${d.length} / ${LIMIT_DESC}`;
      out.cTitle.classList.toggle('is-over', t.length > LIMIT_TITLE);
      out.cDesc.classList.toggle('is-over', d.length > LIMIT_DESC);
      const notes = [];
      if (!t) notes.push('Add a title: it is the line students click.');
      else if (t.length > LIMIT_TITLE) notes.push(`Your title is ${t.length - LIMIT_TITLE} characters too long and will likely be cut.`);
      else if (t.length < 25) notes.push('Your title is short. Name the subject and who it is for.');
      if (d.length > LIMIT_DESC) notes.push(`Your description runs ${d.length - LIMIT_DESC} characters over.`);
      else if (d && d.length < 70) notes.push('Your description is short. Say how it is taught and when it starts.');
      if (t && !/online/i.test(`${t} ${d}`)) notes.push('Students often search with the word “online”. Consider using it.');
      out.verdict.textContent = notes.length ? notes.join(' ') : 'Title and description both fit. Next, make sure the page itself answers the search.';
    };
    form.addEventListener('input', render);
    render();
  }

  // Clocks show the real time in each city.
  const clocks = document.querySelectorAll('[data-tz]');
  const setClocks = () => clocks.forEach((el) => {
    try {
      el.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: el.dataset.tz }).format(new Date());
    } catch (_e) { /* keep the written time */ }
  });
  if (clocks.length) { setClocks(); setInterval(setClocks, 30000); }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
