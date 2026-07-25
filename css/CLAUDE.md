# css/ – Stylesheet-Übersicht

Alle Dateien nutzen CSS Custom Properties aus `base.css`. Ladereihenfolge in `index.html` beachten.

| Datei        | Inhalt                                                                    |
|--------------|---------------------------------------------------------------------------|
| base.css     | Design Tokens (`--c-*`, `--f-*`, `--space-*`), Reset, Typo-Utils, Buttons, `.section-header`, globale Reduced-Motion-Regel |
| layout.css   | `.site-header`, `.site-logo` (reine Wortmarke), `.site-nav`, `.nav-mobile`, `.site-footer` |
| hero.css     | `.hero` (Foto-Bühne), `.hero-img`, `.hero-scrim`, `.hero-status`, `.hero-scroll` |
| menu.css     | `.menu-tabs`, `.menu-panel`, `.flavor-grid`, `.flavor-card`, `.flavor-scoop` |
| about.css    | `.about-grid`, `.about-visual` + `.gallery-grid`, `.gallery-item--wide/--tall/--small` |
| contact.css  | `.contact-grid`, `.hours-list` (+ `.hours-row.is-today`), `.contact-item`, `.map-frame` |

## Besonderheiten

- **`.flavor-scoop`** liest seine Farbe aus `--scoop`. Die Variable setzt `js/menu.js`
  pro Karte inline aus `data/menu.json`. Ist keine gültige Farbe da, greift der
  Standardwert aus `.flavor-card`.
- **`--i`** steuert gestaffelte Auftritte (Sortenkarten, Mobile-Nav-Links) über
  `animation-delay: calc(var(--i) * …)`. Wird im Markup bzw. von `menu.js` gesetzt.
- **`.hours-row.is-today`** und **`.hero-status.is-open/.is-closed`** werden von
  `js/main.js → initOpeningStatus()` gesetzt, nicht im HTML.
- **`--header-offset`** (base.css) hält Ankersprünge unter dem fixen Header frei
  (`section[id] { scroll-margin-top }`).
- **`.map-frame`** hat bewusst eine feste Größe (400×300) statt einer
  prozentualen Fläche – Begründung in `js/CLAUDE.md → Karte`. Nicht auf
  `width: 100%` + `aspect-ratio` zurückbauen, ohne es im Browser zu prüfen.

## Bewegung

`base.css` kürzt unter `prefers-reduced-motion: reduce` global alle Transitions und
Animationen. Animationen mit `backwards`-Endzustand (Hero-Zoom, Hero-Auftritt,
Status-Puls) müssen zusätzlich explizit abgeschaltet werden – siehe Block am Ende
von `hero.css`. Wer dort neue Animationen ergänzt, muss sie dort mit eintragen.

## Neue Styles hinzufügen
- Bestehende Section: zur passenden Datei hinzufügen
- Neue Section: neue Datei anlegen + in `index.html` einbinden (nach den anderen `<link>`-Tags)
- Globale Tokens immer in `base.css`, nie duplizieren
