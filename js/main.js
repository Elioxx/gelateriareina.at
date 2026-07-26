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
    '.section-head, .vitrine-cat, .vitrine-card, .about-media, .about-text, .gallery-item, .contact-card, .extras'
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

  /* ── Vitrine: endloser Smooth-Loop durch die Eissorten ───── */
  // Karten werden geklont (1x), sodass der Loop nahtlos von vorne
  // beginnen kann ohne sichtbaren Sprung. rAF-basiert, ~35 px/s.
  // Pausiert bei Berührung/Hover, reduced-motion und wenn nicht
  // sichtbar. Läuft auf Mobile UND Desktop.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const SPEED_PX_PER_SEC = 35;
    document.querySelectorAll('.vitrine-row').forEach((row) => {
      // Karten so oft klonen, bis die Reihe mindestens doppelt so breit
      // ist wie der Viewport — erst dann gibt es einen nahtlosen Loop.
      const originals = Array.from(row.children);
      const cloneOnce = () => {
        originals.forEach((card) => {
          const clone = card.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.classList.add('is-visible');
          row.appendChild(clone);
        });
      };
      // Mindestens 1x klonen. Auf breiten Viewports mehrfach, damit
      // scrollWidth > clientWidth (sonst kein Scroll moeglich).
      let guard = 0;
      do {
        cloneOnce();
        guard++;
      } while (guard < 6 && row.scrollWidth < row.clientWidth * 2);

      let halfWidth = 0;
      const measure = () => {
        // Einmal durch alle Sets = Gesamtbreite / Anzahl Sets
        const sets = row.children.length / originals.length;
        halfWidth = row.scrollWidth / sets;
      };
      measure();
      window.addEventListener('resize', measure, { passive: true });

      let rafId = null;
      let lastTime = 0;
      let paused = false;
      let visible = false;
      let resumeTimer = null;

      const tick = (now) => {
        rafId = null;
        if (paused || !visible || halfWidth <= 0) return;
        const dt = Math.min(now - lastTime, 100); // Tab-Wechsel abfangen
        lastTime = now;
        let next = row.scrollLeft + (SPEED_PX_PER_SEC * dt) / 1000;
        // Nahtlos auf Anfang zurueck, wenn die Klon-Haelfte erreicht ist
        if (next >= halfWidth) next -= halfWidth;
        row.scrollLeft = next;
        rafId = requestAnimationFrame(tick);
      };

      const start = () => {
        if (rafId || paused || !visible) return;
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      };
      const stop = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      };
      const pauseTemporarily = () => {
        paused = true;
        stop();
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
          paused = false;
          start();
        }, 4000); // nach 4s Ruhe weiter
      };

      row.addEventListener('pointerdown', pauseTemporarily, { passive: true });
      row.addEventListener('touchstart', pauseTemporarily, { passive: true });
      row.addEventListener('wheel', pauseTemporarily, { passive: true });
      row.addEventListener('mouseenter', () => { paused = true; stop(); });
      row.addEventListener('mouseleave', () => { paused = false; start(); });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            visible = entry.isIntersecting;
            visible ? start() : stop();
          });
        }, { threshold: 0.2 }).observe(row);
      } else {
        visible = true;
        start();
      }
    });
  }
})();
