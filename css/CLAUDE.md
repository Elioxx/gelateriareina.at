# css/ – Stylesheet-Übersicht

Alle Dateien nutzen CSS Custom Properties aus `base.css`. Ladereihenfolge in `index.html` beachten.

| Datei         | Inhalt                                                                    |
|---------------|---------------------------------------------------------------------------|
| base.css      | Design Tokens (`--c-*`, `--f-*`, `--space-*`, `--tap`), Reset, Typo-Utils, Buttons, `.section-header`, globale Reduced-Motion-Regel |
| ornaments.css | **Das gezeichnete Gold**: `.ink`-System, Zeichenbewegung, `.hand-note`, `.swash-word` |
| layout.css    | `.site-header`, `.site-logo` (+ `.site-logo-mark`), `.site-nav`, `.nav-mobile`, `.site-footer` |
| hero.css      | `.hero` (weiße Bühne), `.hero-photo` (Bogenform), `.hero-status`, `.hero-figure` |
| menu.css      | `.menu-tabs-wrap` (Wisch-Leiste), `.menu-panel`, `.flavor-grid`, `.flavor-card`, `.flavor-scoop` |
| about.css     | `.about-grid`, `.about-visual` + `.quote-band` + `.gallery-grid` (Karussell/Mosaik) |
| video.css     | `.video-stage`, `.video-facade` (Click-to-Play), `.video-embed`            |
| contact.css   | `.contact-grid`, `.hours-list` (+ `.hours-row.is-today`), `.contact-item`, `.map-frame` |
| mobile.css    | `.action-bar` – zuletzt laden, überschreibt bewusst                        |

## Mobile first – die wichtigste Konvention

**Ausschließlich `min-width`.** Das Grundlayout ohne Media Query ist das Handy;
alles darüber sind Erweiterungen. Stufen:

| Stufe    | Wofür                                                        |
|----------|--------------------------------------------------------------|
| (keine)  | Handy, 360–639px – hier wird entworfen                       |
| 480px    | nur der Hero: Buttons nebeneinander statt gestapelt          |
| 640px    | großes Handy / kleines Tablet: Sorten und Galerie zweispaltig |
| 900px    | Laptop: waagrechte Navigation, zweispaltige Sections, Mosaik  |
| 1200px   | letzter Feinschliff                                          |

`max-width`-Queries bitte nicht wieder einführen. Gemischte Richtungen sind der
Zustand, in dem niemand mehr weiß, welche Regel gewinnt.

### Weitere Mobil-Regeln, die eingehalten werden müssen

- **Hover ist nie die einzige Quelle.** Jeder `:hover` steht in
  `@media (hover: hover)`. Auf Touch gibt es kein Hover – ein Effekt, der dort
  Information versteckt (z.B. Bildunterschriften), ist unsichtbar.
- **Trefferflächen ≥ `var(--tap)` (44px).** Gilt für alles Antippbare. Die
  optische Größe darf kleiner sein, die Trefferfläche nicht. Ausgenommen sind
  Links **im Fließtext** („Größere Karte" in der Kartenunterschrift) – die kann
  man nicht vergrößern, ohne den Satz zu zerreißen.
- **Safe Areas**: fixer Header und `.action-bar` rechnen mit
  `env(safe-area-inset-top/bottom)`.
- **`dvh` statt `vh`** bei allem, was bildschirmhoch ist (`.nav-mobile`) –
  sonst schneidet die iOS-Adressleiste unten ab.

## Das gezeichnete Gold (`ornaments.css`)

Alle verspielten Elemente sind **Inline-SVG im Markup**, kein Sprite und kein
`<use>`: `<use>` erzeugt einen Shadow-Tree, in den `stroke-dasharray` pro Pfad
nicht hineinreicht – und genau darauf beruht die Zeichenbewegung.

Muster:

```html
<svg class="ink ink--swash" viewBox="0 0 200 28" aria-hidden="true" focusable="false">
  <path data-draw pathLength="100" d="…"/>
</svg>
```

- **`pathLength="100"`** normiert jede Pfadlänge auf 100. Dadurch reicht ein
  einziger `stroke-dasharray`-Wert für alle Ornamente, egal wie lang der Pfad
  wirklich ist.
- **`data-draw`** = dieser Pfad zeichnet sich. Pfade ohne das Attribut sind
  sofort da (Logo, Footer-Welle) – die Marke darf nie erst nach einer
  Animation erscheinen.
- **`.ink-hatch`** um eine `<g>` legt die Schraffur zurück; sie darf nie so
  laut sein wie die Kontur.
- **`--i`** staffelt mehrere Pfade eines Ornaments.
- **`.ink--autodraw`** für Ornamente über dem Falz (Hero): die zeichnen sich
  zeitgesteuert, weil sie nie in den Viewport „scrollen".
- **`vector-effect: non-scaling-stroke`** an jedem Pfad. Ohne das werden
  Schraffuren am Handy zu Matsch und gestreckte Rahmen bekommen ungleich dicke
  Kanten.
- **`.ink--frame` braucht `width`/`height`.** Ein `<svg>` ohne
  width/height-Attribut ist ein ersetztes Element mit Standardgröße 300×150 –
  über `inset` allein bekommt es die Größe des Elternteils *nicht*. Der Versatz
  läuft deshalb über `margin`, nicht über `inset`.
- **Versetzte Rahmen brauchen `isolation: isolate` am Elternteil.** Sonst
  rutscht `z-index: -1` hinter den Hintergrund der ganzen Section und ist weg.
- **`ink-wrap`** (`overflow: clip`) um alles, was über eine Kante ragt.
  `clip` statt `hidden`: erzeugt keinen Scroll-Container.

Die Zeichenbewegung hängt am bestehenden Reveal-System: sobald ein Vorfahre mit
`[data-reveal]` die Klasse `.revealed` bekommt (`js/main.js`), laufen die
Striche los. **Kein eigenes JavaScript.** Alles ist an `.js` am `<html>`
gekoppelt – ohne JavaScript wird nichts versteckt.

## Besonderheiten

- **`.flavor-scoop`** liest seine Farbe aus `--scoop`. Die Variable setzt
  `js/menu.js` pro Karte inline aus `data/menu.json`. Ist keine gültige Farbe
  da, greift der Standardwert aus `.flavor-card`.
- **`--i`** steuert gestaffelte Auftritte (Sortenkarten, Mobile-Nav-Links,
  Ornament-Pfade) über `animation-delay: calc(var(--i) * …)`.
- **`.hours-row.is-today`** und **`.hero-status.is-open/.is-closed`** werden von
  `js/main.js → initOpeningStatus()` gesetzt, nicht im HTML.
- **`--header-h`** muss zur tatsächlichen Headerhöhe passen (Logo `--tap` plus
  Polsterung). Davon hängen `--header-offset` (Ankersprünge) und das obere
  Polster des Hero ab.
- **`.map-frame`** hat eine **feste Höhe** (300px), die Breite ist fließend mit
  `max-width: 400px`. Die feste Höhe hat einen Grund – siehe
  `js/CLAUDE.md → Karte`. Nicht auf `aspect-ratio` umbauen, ohne es im Browser
  zu prüfen. Fix 400px Breite ging nicht: das ragte bei 360px über den Rand.
- **`.gallery-grid`** ist am Handy ein Flex-Karussell mit `scroll-snap`, ab
  640px ein Raster, ab 900px das 12-Spalten-Mosaik. Die vier Kacheln sind im
  Mosaik fest platziert – kommt eine dazu oder fällt eine weg, müssen diese
  vier Regeln angepasst werden, sonst bleibt eine Lücke.

## Bewegung

`base.css` kürzt unter `prefers-reduced-motion: reduce` global alle Transitions
und Animationen. Das reicht **nicht** für:

- Animationen mit `backwards`-Endzustand (Hero-Auftritt, Hero-Zoom,
  Status-Puls) – sonst bleibt der Startzustand stehen. Block am Ende von
  `hero.css`.
- Die Zeichenbewegung – die globale Regel kürzt die Dauer, nicht die
  Verzögerung. Block am Ende von `ornaments.css` setzt `stroke-dashoffset: 0`.

**Wer dort eine Animation ergänzt, trägt sie in den jeweiligen Block mit ein.**

## Neue Styles hinzufügen
- Bestehende Section: zur passenden Datei hinzufügen
- Neue Section: neue Datei anlegen + in `index.html` einbinden – **vor**
  `mobile.css`, das bleibt das letzte Stylesheet
- Globale Tokens immer in `base.css`, nie duplizieren
