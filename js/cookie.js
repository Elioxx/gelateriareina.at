/* ═══════════════════════════════════════════════════════════════
   Gelateria Reina — Cookie-Consent Logik
   Banner mit Accept/Reject, lädt Meta Ads Pixel nur bei Consent.
   Speichert Entscheidung dauerhaft im localStorage.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const STORAGE_KEY = 'reina_cookie_consent';
  const CONSENT_ACCEPTED = 'accepted';
  const CONSENT_REJECTED = 'rejected';

  const stored = localStorage.getItem(STORAGE_KEY);

  /* ── Pixel laden, wenn Consent erteilt wurde ──────────────── */
  const loadPixel = () => {
    // Meta Ads / Facebook Pixel – wird nur bei Consent geladen
    // Pixel-ID austauschen sobald vorhanden
    const pixelId = 'PIXEL_ID_HIER';
    if (pixelId === 'PIXEL_ID_HIER') return; // noch keine ID hinterlegt

    const f = document.getElementsByTagName('script')[0];
    const p = document.createElement('script');
    p.type = 'text/javascript';
    p.async = true;
    p.src = `https://connect.facebook.net/en_US/fbevents.js`;
    f.parentNode.insertBefore(p, f);

    window.fbq = window.fbq || function() {
      (window.fbq.q = window.fbq.q || []).push(arguments);
    };
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  };

  /* ── Consent bereits erteilt? → Pixel laden, kein Banner ──── */
  if (stored === CONSENT_ACCEPTED) {
    loadPixel();
    return;
  }

  if (stored === CONSENT_REJECTED) {
    return; // nichts tun, kein Banner, kein Pixel
  }

  /* ── Noch keine Entscheidung → Banner anzeigen ────────────── */
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  requestAnimationFrame(() => {
    banner.classList.add('is-visible');
  });

  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, CONSENT_ACCEPTED);
      banner.classList.remove('is-visible');
      setTimeout(() => { banner.remove(); }, 500);
      loadPixel();
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, CONSENT_REJECTED);
      banner.classList.remove('is-visible');
      setTimeout(() => { banner.remove(); }, 500);
    });
  }
})();