/* ═══════════════════════════════════════════════════════════════
   Gelateria Reina — Meta-Tag Loader
   Lädt data/config.json und setzt Metadaten aus der Konfiguration.
   Dadurch müssen Titel, Beschreibung & OG-Tags nur in der Config
   geändert werden, nicht im HTML.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const setMeta = (name, content, prop = 'name') => {
    let el = document.querySelector(`meta[${prop}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(prop, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setLink = (rel, href) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  fetch('data/config.json')
    .then((r) => { if (!r.ok) throw new Error('Config nicht gefunden'); return r.json(); })
    .then((cfg) => {
      /* ── Site-Titel & Description ── */
      if (cfg.site?.title) {
        document.title = cfg.site.title;
        setMeta('title', cfg.site.title);
      }
      if (cfg.site?.description) {
        setMeta('description', cfg.site.description);
      }

      /* ── Allgemeine Meta-Tags ── */
      if (cfg.meta) {
        Object.entries(cfg.meta).forEach(([k, v]) => setMeta(k, v));
      }

      /* ── Open Graph ── */
      if (cfg.openGraph) {
        const og = cfg.openGraph;
        if (og.title) setMeta('og:title', og.title, 'property');
        if (og.description) setMeta('og:description', og.description, 'property');
        if (og.image) setMeta('og:image', og.image, 'property');
        if (og.image_width) setMeta('og:image:width', og.image_width, 'property');
        if (og.image_height) setMeta('og:image:height', og.image_height, 'property');
        if (og.type) setMeta('og:type', og.type, 'property');
        if (og.locale) setMeta('og:locale', og.locale, 'property');
        if (cfg.site?.url) setMeta('og:url', cfg.site.url, 'property');
      }

      /* ── Twitter Card ── */
      setMeta('twitter:card', 'summary_large_image');
      if (cfg.openGraph?.title) setMeta('twitter:title', cfg.openGraph.title);
      if (cfg.openGraph?.description) setMeta('twitter:description', cfg.openGraph.description);
      if (cfg.openGraph?.image) setMeta('twitter:image', cfg.openGraph.image);

      /* ── Canonical ── */
      if (cfg.site?.url) setLink('canonical', cfg.site.url);
    })
    .catch(() => {
      /* Config nicht vorhanden oder fehlerhaft — statische Meta-Tags bleiben stehen */
    });
})();