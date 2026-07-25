# css/ – Stylesheet-Übersicht

Alle Dateien nutzen CSS Custom Properties aus `base.css`. Ladereihenfolge in `index.html` beachten.

| Datei        | Inhalt                                                              |
|--------------|---------------------------------------------------------------------|
| base.css     | Design Tokens (--c-*, --f-*, --space-*), Reset, Typo-Utils, Buttons |
| layout.css   | `.site-header`, `.site-nav`, `.nav-mobile`, `.site-footer`          |
| hero.css     | `.hero` (Foto als background-image), `.hero-content`, `.hero-scroll` |
| menu.css     | `.menu-tabs`, `.menu-panel`, `.flavor-grid`, `.flavor-card`         |
| about.css    | `.about-grid`, `.about-visual` + `.gallery-grid`, `.gallery-item--wide/--tall/--small` |
| contact.css  | `.contact-grid`, `.hours-list`, `.contact-item`, `.map-frame`       |

## Neue Styles hinzufügen
- Bestehende Section: zur passenden Datei hinzufügen
- Neue Section: neue Datei anlegen + in `index.html` einbinden (nach den anderen `<link>`-Tags)
- Globale Tokens immer in `base.css`, nie duplizieren
