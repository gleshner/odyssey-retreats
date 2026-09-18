/* ── Nav scroll effect ──────────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ── Mobile nav toggle ──────────────────────────────────────────────── */
(function () {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
    }
  });
})();

/* ── Hero background Ken-Burns effect ──────────────────────────────── */
(function () {
  const bg = document.getElementById('hero-bg');
  if (!bg) return;
  const img = new Image();
  img.onload = () => bg.classList.add('loaded');
  img.src = bg.style.backgroundImage.replace(/url\(["']?|["']?\)/g, '');
  if (!img.src) bg.classList.add('loaded');
})();

/* ── Intersection Observer — fade-up animations ─────────────────────── */
(function () {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => observer.observe(el));
})();

/* ── FAQ accordion ──────────────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = btn.classList.contains('open');

      // Close all others in the same group
      const group = btn.closest('.faq-items');
      if (group) {
        group.querySelectorAll('.faq-question.open').forEach(b => {
          b.classList.remove('open');
          b.closest('.faq-item').querySelector('.faq-answer').classList.remove('open');
        });
      }

      if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
      }
    });
  });

  // Open first item by default
  const first = document.querySelector('.faq-question');
  if (first) { first.classList.add('open'); first.nextElementSibling?.classList.add('open'); }
})();

/* ── FAQ sidebar navigation ─────────────────────────────────────────── */
(function () {
  const navBtns = document.querySelectorAll('.faq-nav-link');
  if (!navBtns.length) return;

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        const offset = 100;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Highlight nav based on scroll position
  const groups = document.querySelectorAll('.faq-group');
  if (!groups.length) return;
  window.addEventListener('scroll', () => {
    let current = '';
    groups.forEach(g => {
      if (window.scrollY >= g.offsetTop - 140) current = g.id;
    });
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.target === current));
  }, { passive: true });
})();

/* ── Workshop list hover ─────────────────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.ws-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
})();

/* ── Retreat card URL hash on load ───────────────────────────────────── */
(function () {
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 300);
    }
  }
})();
