# Gelateria Reina – Website

Statische One-Page-Website für die Gelateria Reina in Gleisdorf, Österreich.
Kein Build-Schritt, kein Framework – läuft direkt von einem einfachen HTTP-Server.
Live unter https://gelateriareina.at

## Dateistruktur

```
/
├── index.html          # Einzige HTML-Datei, alle Sections, keine Templates
├── css/
│   ├── base.css        # ZUERST laden: CSS-Variablen, Reset, Typografie, Buttons, Utils
│   ├── layout.css      # Header, Navigation, Footer
│   ├── hero.css        # Hero-Section (Foto-Bühne)
│   ├── menu.css        # Speisekarte („Vitrine": Tabs + Sortenkarten)
│   ├── about.css       # Über-uns + Galerie-Section
│   └── contact.css     # Kontakt & Öffnungszeiten-Section
├── js/
│   ├── main.js         # Nav, Scroll-Verhalten, Reveal, Öffnungsstatus
│   └── menu.js         # Lädt data/menu.json und rendert die Speisekarte
├── data/
│   ├── menu.json       # Eissorten inkl. Kugelfarbe (Quelle für menu.js)
│   └── info.json       # Adresse, Öffnungszeiten, Kontakt (Referenz; HTML ist statisch)
└── assets/
    └── images/         # Fotos (WebP)
```

**Wichtige Regel:** `css/base.css` definiert alle CSS Custom Properties (`--c-*`, `--f-*`, `--space-*`).
Alle anderen CSS-Dateien setzen base.css voraus. Ladereihenfolge in index.html nicht ändern.

**Schriften** werden in `index.html` per `<link>` geladen, nicht per `@import` in der CSS –
ein `@import` in der ersten Datei kostet eine zusätzliche Rundreise vor dem ersten Rendern.

## Sections in index.html (Reihenfolge)

| Section-ID   | CSS-Datei      | JS-Datei    | Datenquelle     |
|--------------|----------------|-------------|-----------------|
| `#home`      | hero.css       | main.js     | —               |
| `#sorten`    | menu.css       | menu.js     | data/menu.json  |
| `#ueber-uns` | about.css      | —           | —               |
| `#galerie`   | about.css      | —           | —               |
| `#kontakt`   | contact.css    | main.js     | data/info.json  |

## Inhalte anpassen

### Eissorten ändern
Nur `data/menu.json` bearbeiten – das JS rendert die Karten neu.
Jede Sorte hat ein Feld `color`: **die Farbe der Eiskugel auf der Website.**
Möglichst nah an der echten Sorte wählen; sehr helle Farben sind in Ordnung,
die Kugel bekommt im CSS einen feinen Rand und ein Glanzlicht.
Ungültige Werte werden von `menu.js` verworfen (Rückfall auf die Standardfarbe).
Kategorien können frei hinzugefügt/entfernt werden (Array `categories`).

### Öffnungszeiten ändern
**Drei** Stellen, alle drei nötig:
1. `index.html` – Section `#kontakt` und Footer
2. `data/info.json`
3. `js/main.js` → Konstante `OPENING_HOURS` (steuert die „Jetzt geöffnet"-Anzeige)

Die Zeilen der Öffnungszeiten-Tabelle tragen `data-days` (0 = Sonntag).
Darüber hebt `main.js` die heutige Zeile hervor.

### Saisonpause anzeigen
Am Element `#hero-status` in `index.html` die Attribute
`data-season-from="03-01"` und `data-season-to="10-31"` setzen (Format `MM-TT`).
Außerhalb des Zeitraums meldet die Seite „Winterpause" statt Öffnungszeiten.
Ohne diese Attribute wird ganzjährig nach `OPENING_HOURS` gerechnet.
Der Zeitraum darf über den Jahreswechsel gehen (z.B. `11-01` bis `02-28`).

### Fotos austauschen
Alle Fotos liegen als WebP unter `assets/images/`:

| Datei                         | Ort im Layout                    | Format   |
|-------------------------------|----------------------------------|----------|
| `hero-eisdiele-front.webp`    | Hero – `.hero-img` (Vollbild)    | 3:2 quer |
| `ueber-uns-eisverkauf.webp`   | `.about-img-main`                | 4:5 hoch |
| `ueber-uns-portionieren.webp` | `.about-img-accent`              | 4:5 hoch |
| `galerie-innenraum.webp`      | Galerie `--wide` (Panorama)      | 3:2 quer |
| `galerie-gaeste.webp`         | Galerie `--tall` (hoher Anker)   | 2:3 hoch |
| `galerie-uebergabe.webp`      | Galerie `--small`                | 3:2 quer |
| `galerie-schlange.webp`       | Galerie `--small`                | 3:2 quer |

Neues Foto aus einem JPG erzeugen (max. 2000 px breit, Qualität 85):
```sh
ffmpeg -i FOTO.jpg -vf "scale=1600:-2" -frames:v 1 \
  -c:v libwebp -quality 85 -compression_level 6 -preset photo assets/images/NAME.webp
```
Beim Ersetzen die `width`/`height`-Attribute im HTML mitziehen (verhindert Layout-Shift).
Der Bildausschnitt lässt sich pro Bild über `object-position` feinjustieren –
beim Hero in `css/hero.css` (getrennt für Desktop und Hochformat), in der Galerie
per `style="object-position: …"` am `<img>`.

**Galerie-Mosaik:** Die vier Kacheln sind in `about.css` fest im 12-Spalten-Raster
platziert (`--wide` 7 Spalten, `--tall` 5 Spalten über beide Reihen, zwei `--small`
mit 4 + 3 Spalten). Kommt eine Kachel dazu oder fällt eine weg, müssen diese Regeln
angepasst werden – sonst bleibt eine Lücke im Raster.

### Texte / Über uns
Direkt in `index.html` in der Section `#ueber-uns`.

## Design-System

Die Identität kommt vom Ladenschild: goldene Eistüte auf Schwarz, warme Fassade,
Honigholz. Das Gold ist die bestehende Markenfarbe. Alle Tokens in `css/base.css`:

| Variable           | Wert     | Verwendung                        |
|--------------------|----------|-----------------------------------|
| `--c-bg`           | #FBF9F5  | Seitenhintergrund, warmes Papierweiß |
| `--c-bg-soft`      | #F2EBE0  | Abwechselnde Sections             |
| `--c-text`         | #211A15  | Fließtext, warmes Schwarz         |
| `--c-text-muted`   | #7D7168  | Zweite Textebene                  |
| `--c-accent`       | #B8935A  | Gold vom Schild, CTA-Farbe        |
| `--c-accent-bright`| #E3C384  | Gold auf dunklem Grund            |
| `--c-accent-light` | #EBDCC4  | Badges, Hover-Flächen             |
| `--c-ink`          | #17110D  | Hero-Verlauf, Footer              |
| `--c-pistachio`    | #8FA872  | Zweite Markenfarbe (vegan-Badge)  |
| `--c-border`       | #E3D9CD  | Rahmen, Trennlinien               |
| `--f-display`      | Fraunces | Überschriften, Sortennamen, Logo  |
| `--f-sans`         | Karla    | Fließtext, Labels, Buttons        |

`--f-serif` bleibt als Aliasname auf `--f-display` bestehen.
Die Skala ab `--text-3xl` ist fluid (`clamp`) – Überschriften skalieren mit dem Viewport.

### Gestalterische Leitidee
- **Hero:** das echte Ladenfoto in voller Deckkraft. Der Verlauf deckt nur so viel ab,
  wie der Text zum Lesen braucht. Eine sehr langsame Zoomfahrt ersetzt die Bewegung,
  die früher ein Hintergrundvideo geliefert hat – ohne Ladezeit und ohne Fremd-Embed.
- **Speisekarte = Vitrine:** jede Sorte trägt ihre echte Gelato-Farbe als Kugel.
  Die Farbe ist Information, keine Deko – man sieht, wie die Kugel aussieht.
- **„Jetzt geöffnet":** der Laden hat Mo–Mi zu und ist ein Saisonbetrieb. Die Frage
  „kann ich jetzt hin?" beantwortet die Seite oben im Hero und in der Tabelle.

## Reveal-Animationen
Elemente mit `data-reveal` werden beim Einblenden in den Viewport sanft eingeblendet.
Das CSS steht inline in `index.html`, die Logik in `js/main.js → initRevealOnScroll()`.
Dynamisch gerenderte Elemente (Speisekarte) nutzen `menu.js → initRevealAfterRender()`.

Die Regel hängt an `.js` am `<html>`-Element (wird per Inline-Skript im `<head>` gesetzt):
**ohne JavaScript wird nichts versteckt**, sonst bliebe die halbe Seite unsichtbar,
falls ein Skript nicht lädt.

`prefers-reduced-motion: reduce` wird global in `base.css` respektiert; Animationen mit
Endzustand (Hero-Zoom, Auftritt, Puls) werden zusätzlich in `hero.css` abgeschaltet.

## Deployment

Einfach den Ordner auf einen HTTP-Server legen (z.B. `python3 -m http.server 8080`).
Wegen `fetch('data/menu.json')` in menu.js funktioniert `file://` nicht – immer über HTTP.
