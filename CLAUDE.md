# Gelateria Reina – Website

Statische One-Page-Website für die Gelateria Reina in Gleisdorf, Österreich.  
Kein Build-Schritt, kein Framework – läuft direkt von einem einfachen HTTP-Server.

## Dateistruktur

```
/
├── index.html          # Einzige HTML-Datei, alle Sections, keine Templates
├── css/
│   ├── base.css        # ZUERST laden: CSS-Variablen, Reset, Typografie, Utils
│   ├── layout.css      # Header, Navigation, Footer
│   ├── hero.css        # Hero-Section (Startseite)
│   ├── menu.css        # Speisekarte-Section (Tabs + Karten)
│   ├── about.css       # Über-uns + Galerie-Section
│   └── contact.css     # Kontakt & Öffnungszeiten-Section
├── js/
│   ├── main.js         # Nav, Scroll-Verhalten, Reveal-Animationen
│   └── menu.js         # Lädt data/menu.json und rendert Speisekarte
├── data/
│   ├── menu.json       # Eissorten nach Kategorie (Quelle für menu.js)
│   └── info.json       # Adresse, Öffnungszeiten, Kontakt (Referenz; aktuell statisch in HTML)
└── assets/
    └── images/         # Platzhalter – hier Fotos ablegen (JPG/WebP)
```

**Wichtige Regel:** `css/base.css` definiert alle CSS Custom Properties (`--c-*`, `--f-*`, `--space-*`).  
Alle anderen CSS-Dateien setzen base.css voraus. Ladereihenfolge in index.html nicht ändern.

## Sections in index.html (Reihenfolge)

| Section-ID   | CSS-Datei      | JS-Datei    | Datenquelle     |
|--------------|----------------|-------------|-----------------|
| `#home`      | hero.css       | —           | —               |
| `#sorten`    | menu.css       | menu.js     | data/menu.json  |
| `#ueber-uns` | about.css      | —           | —               |
| `#galerie`   | about.css      | —           | —               |
| `#kontakt`   | contact.css    | —           | data/info.json  |

## Inhalte anpassen

### Fotos hinzufügen
Bilder unter `assets/images/` ablegen (bevorzugt WebP). Dann im HTML:
- Hero: `<div class="hero-img">` → `<div class="hero-img"><img src="assets/images/NAME.webp" alt="..."></div>`
- Galerie: `<div class="gallery-item gallery-item--placeholder">` → `<div class="gallery-item"><img ...></div>` (Klasse `gallery-item--placeholder` entfernen)
- Über uns: analog mit `.about-img-main` und `.about-img-accent`

### Öffnungszeiten ändern
Zwei Stellen: `index.html` (Section `#kontakt` + Footer) und `data/info.json`.

### Eissorten ändern
Nur `data/menu.json` bearbeiten – das JS rendert die Karten automatisch neu.  
Kategorien können frei hinzugefügt/entfernt werden (Array `categories`).

### Texte / Über uns
Direkt in `index.html` in der Section `#ueber-uns`.

## Design-System

Alle Farben/Abstände als CSS Custom Properties in `css/base.css`:

| Variable          | Wert       | Verwendung              |
|-------------------|------------|-------------------------|
| `--c-bg`          | #FAFAF7    | Seitenhintergrund        |
| `--c-bg-soft`     | #F3EDE6    | Alternate sections       |
| `--c-text`        | #1A1818    | Fließtext                |
| `--c-text-muted`  | #8A7E76    | Zweite Textebene         |
| `--c-accent`      | #B8935A    | Caramel-Gold, CTA-Farbe  |
| `--c-accent-light`| #EAD9C4    | Badges, Hover-BG         |
| `--c-border`      | #E0D5CB    | Rahmen, Trennlinien      |
| `--f-serif`       | Cormorant Garamond | Überschriften   |
| `--f-sans`        | Inter      | Fließtext, Labels        |

## Reveal-Animationen
Elemente mit `data-reveal` Attribut werden beim Einblenden in den Viewport sanft eingeblendet.  
Das CSS dazu steht inline in `index.html` (4 Zeilen), die Logik in `js/main.js → initRevealOnScroll()`.  
Dynamisch gerenderte Elemente (Speisekarte) nutzen `menu.js → initRevealAfterRender()`.

## Deployment

Einfach den Ordner auf einen HTTP-Server legen (z.B. `python3 -m http.server 8080`).  
Wegen `fetch('data/menu.json')` in menu.js funktioniert `file://` nicht – immer über HTTP.
