/**
 * main.js — Navigation, Scroll-Verhalten, Mobile-Menü, Öffnungsstatus.
 * Läuft nach DOMContentLoaded. Keine Abhängigkeiten.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initNavHighlight();
  initRevealOnScroll();
  initOpeningStatus();
  initMap();
});

/* --- Karte ---
   Die OSM-Einbettung misst ihre Kachelfläche einmal beim Erzeugen des
   Dokuments und danach nie wieder — weder beim Neuladen noch beim
   Größenwechsel. Wird das Iframe zu früh erzeugt, steht die endgültige
   Rasterbreite noch nicht fest und die Karte bleibt auf halber Breite
   in der Ecke stehen. Deshalb setzen wir src erst, wenn die Karte in
   den Blick kommt: dann ist das Layout fertig.
   Ohne JavaScript bleibt der Link „Größere Karte" unter der Karte. */
function initMap() {
  const frame = document.querySelector('.map-frame[data-src]');
  if (!frame) return;

  const load = () => {
    if (frame.src) return;
    frame.src = frame.dataset.src;
  };

  if (!('IntersectionObserver' in window)) { load(); return; }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      // Ein Frame warten, damit Breite und Höhe sicher stehen
      requestAnimationFrame(load);
    });
  }, { rootMargin: '200px' });

  observer.observe(frame);
}

/* --- Sticky Header --- */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- Mobile Navigation --- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('nav-mobile');
  const closeBtn = document.getElementById('nav-mobile-close');

  if (!toggle || !mobileNav) return;

  const open = () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
    closeBtn?.focus();
  };

  const close = () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

/* --- Aktiver Nav-Link beim Scrollen --- */
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));
}

/* --- Einblenden beim Scrollen --- */
function initRevealOnScroll() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  els.forEach(el => observer.observe(el));
}

/* =========================================================
   Öffnungsstatus

   Beantwortet die Frage, mit der die meisten Besucher kommen:
   „Kann ich jetzt hin?" Gerechnet wird immer in Wiener Zeit —
   sonst zeigt ein Handy im Urlaub etwas Falsches an.

   Öffnungszeiten ändern: unten in OPENING_HOURS eintragen UND
   in index.html (#kontakt + Footer) sowie data/info.json.
   ========================================================= */

/* Index = Wochentag (0 = Sonntag). null bedeutet geschlossen,
   sonst [Öffnung, Schließung] in vollen Stunden. */
const OPENING_HOURS = [
  [10, 18],  // Sonntag
  null,      // Montag
  null,      // Dienstag
  null,      // Mittwoch
  [10, 18],  // Donnerstag
  [10, 18],  // Freitag
  [10, 18]   // Samstag
];

const WEEKDAY_NAMES = [
  'Sonntag', 'Montag', 'Dienstag', 'Mittwoch',
  'Donnerstag', 'Freitag', 'Samstag'
];

function initOpeningStatus() {
  const el = document.getElementById('hero-status');
  const now = viennaTime();
  if (!now) return;

  // Saisonbetrieb: greift nur, wenn in index.html ein Zeitraum
  // hinterlegt ist (data-season-from / data-season-to, je "MM-TT").
  // Ohne Angabe wird ganzjährig nach OPENING_HOURS gerechnet.
  const outOfSeason = el && isOutOfSeason(el.dataset.seasonFrom, el.dataset.seasonTo, now);

  if (el) {
    const status = outOfSeason
      ? { open: false, text: 'Winterpause – wir sind bald wieder für euch da' }
      : describeStatus(now);

    el.textContent = status.text;
    el.classList.toggle('is-open', status.open);
    el.classList.toggle('is-closed', !status.open);
  }

  // Heutige Zeile in der Öffnungszeiten-Tabelle hervorheben
  document.querySelectorAll('.hours-row[data-days]').forEach(row => {
    const days = row.dataset.days.split(',').map(Number);
    row.classList.toggle('is-today', !outOfSeason && days.includes(now.day));
  });
}

/* Aktuelle Zeit in Europe/Vienna, unabhängig von der Geräte-Zeitzone */
function viennaTime() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Vienna',
      weekday: 'short',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).formatToParts(new Date());

    const get = type => parts.find(p => p.type === type)?.value;
    const dayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    return {
      day: dayIndex[get('weekday')],
      // hour12:false liefert je nach Engine 24 statt 0 um Mitternacht
      hour: parseInt(get('hour'), 10) % 24,
      minute: parseInt(get('minute'), 10),
      month: parseInt(get('month'), 10),
      date: parseInt(get('day'), 10)
    };
  } catch {
    return null;  // Intl nicht verfügbar → Status bleibt wie im HTML
  }
}

function describeStatus(now) {
  const today = OPENING_HOURS[now.day];
  const minutesNow = now.hour * 60 + now.minute;

  if (today) {
    const [from, to] = today;
    if (minutesNow < from * 60) {
      return { open: false, text: `Heute ab ${from} Uhr geöffnet` };
    }
    if (minutesNow < to * 60) {
      return { open: true, text: `Jetzt geöffnet · bis ${to} Uhr` };
    }
  }

  // Nächsten offenen Tag suchen (max. eine Woche voraus)
  for (let step = 1; step <= 7; step++) {
    const day = (now.day + step) % 7;
    const hours = OPENING_HOURS[day];
    if (!hours) continue;

    const when = step === 1 ? 'morgen' : `am ${WEEKDAY_NAMES[day]}`;
    return { open: false, text: `Heute geschlossen · ${when} ab ${hours[0]} Uhr` };
  }

  return { open: false, text: 'Aktuell geschlossen' };
}

/* "MM-TT"-Zeitraum, der über den Jahreswechsel gehen darf */
function isOutOfSeason(from, to, now) {
  if (!from || !to) return false;

  const toNum = value => {
    const [m, d] = String(value).split('-').map(Number);
    return Number.isFinite(m) && Number.isFinite(d) ? m * 100 + d : null;
  };

  const start = toNum(from);
  const end = toNum(to);
  const today = now.month * 100 + now.date;
  if (start === null || end === null) return false;

  return start <= end
    ? today < start || today > end      // Saison innerhalb eines Jahres
    : today < start && today > end;     // Saison über den Jahreswechsel
}
