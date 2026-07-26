/* Gelateria Reina — Nav, Öffnungsstatus, Galerie-Reveal */
(() => {
  'use strict';

  /* ── Header: Scroll-Zustand ─────────────────────────────── */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile Navigation ──────────────────────────────────── */
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Öffnungszeiten / Status ────────────────────────────── */
  // 0 = Sonntag … 6 = Samstag
  const OPENING_HOURS = {
    0: [12, 21], // So
    1: [12, 21], // Mo
    2: [11, 21], 3: [11, 21], 4: [11, 21],
    5: [11, 21], 6: [11, 21],
  };

  const status = document.getElementById('hero-status');
  const statusText = document.getElementById('hero-status-text');

  const inSeason = (el) => {
    const from = el.dataset.seasonFrom;
    const to = el.dataset.seasonTo;
    if (!from || !to) return true;
    const now = new Date();
    const mmdd = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const today = mmdd(now);
    return from <= to ? (today >= from && today <= to) : (today >= from || today <= to);
  };

  const updateStatus = () => {
    try {
      if (!status || !statusText) return;
      if (!inSeason(status)) {
        status.classList.add('is-closed');
        statusText.textContent = 'Winterpause – wir freuen uns auf die nächste Saison';
        return;
      }
      const now = new Date();
      const hours = OPENING_HOURS[now.getDay()];
      if (!hours) {
        status.classList.add('is-closed');
        statusText.textContent = 'Heute geschlossen';
        return;
      }
      const [from, to] = hours;
      const h = now.getHours() + now.getMinutes() / 60;
      if (h >= from && h < to) {
        status.classList.remove('is-closed');
        statusText.textContent = `Jetzt geöffnet · bis ${to}:00 Uhr`;
      } else {
        status.classList.add('is-closed');
        statusText.textContent = h < from
          ? `Heute ab ${from}:00 Uhr geöffnet`
          : `Geschlossen · morgen ab ${OPENING_HOURS[(now.getDay() + 1) % 7][0]}:00 Uhr`;
      }
    } catch (_) { /* Fallback-Text aus dem HTML bleibt stehen */ }
  };
  updateStatus();

  /* ── Heute-Zeile in der Öffnungszeiten-Tabelle ──────────── */
  const today = String(new Date().getDay());
  document.querySelectorAll('.hours tr[data-days]').forEach((row) => {
    if (row.dataset.days.split(',').includes(today)) row.classList.add('is-today');
  });

  /* ── Reveal-Animation ───────────────────────────────────── */
  const revealTargets = document.querySelectorAll(
    '.section-head, .menu-cat, .about-media, .about-text, .gallery-item, .contact-card, .extras'
  );
  if ('IntersectionObserver' in window) {
    revealTargets.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => io.observe(el));
  }

  /* ── Hero-Parallax (fein, nur Desktop) ──────────────────── */
  const heroImg = document.querySelector('.hero-arch img');
  const fine = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroImg && fine) {
    let ticking = false;
    const parallax = () => {
      const y = Math.min(window.scrollY, 600);
      heroImg.style.transform = `translateY(${y * 0.07}px)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
  }

  /* ── Jahr im Footer ─────────────────────────────────────── */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
