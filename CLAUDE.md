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

### Fotos austauschen
Alle Fotos liegen als WebP unter `assets/images/`. Die Platzhalter-Varianten gibt es nicht mehr –
Bilder werden direkt ersetzt:

| Datei                         | Ort im Layout                         | Format   |
|-------------------------------|---------------------------------------|----------|
| `hero-eisdiele-front.webp`    | Hero – `background-image` in hero.css | 3:2 quer |
| `ueber-uns-eisverkauf.webp`   | `.about-img-main`                     | 4:5 hoch |
| `ueber-uns-portionieren.webp` | `.about-img-accent`                   | 4:5 hoch |
| `galerie-innenraum.webp`      | Galerie `--wide` (Panorama)           | 3:2 quer |
| `galerie-gaeste.webp`         | Galerie `--tall` (hoher Anker)        | 2:3 hoch |
| `galerie-uebergabe.webp`      | Galerie `--small`                     | 3:2 quer |
| `galerie-schlange.webp`       | Galerie `--small`                     | 3:2 quer |

Neues Foto aus einem JPG erzeugen (max. 2000 px breit, Qualität 85):
```sh
ffmpeg -i FOTO.jpg -vf "scale=1600:-2" -frames:v 1 \
  -c:v libwebp -quality 85 -compression_level 6 -preset photo assets/images/NAME.webp
```
Beim Ersetzen die `width`/`height`-Attribute im HTML mitziehen (verhindert Layout-Shift).
Der Bildausschnitt lässt sich pro Kachel über `style="object-position: …"` feinjustieren.

**Galerie-Mosaik:** Die vier Kacheln sind in `about.css` fest im 12-Spalten-Raster platziert
(`--wide` 7 Spalten, `--tall` 5 Spalten über beide Reihen, zwei `--small` mit 4 + 3 Spalten).
Kommt eine Kachel dazu oder fällt eine weg, müssen diese Regeln angepasst werden – sonst
bleibt eine Lücke im Raster.

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
