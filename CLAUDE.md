# Gelateria Reina – Website

Statische One-Page-Website für die Gelateria Reina in Gleisdorf, Österreich.
Kein Build-Schritt, kein Framework – läuft direkt von einem einfachen HTTP-Server.
Live unter https://gelateriareina.at

**Die Seite ist mobile first gebaut.** Das Handy ist der Hauptfall, nicht der
Nebenfall: eine Eisdiele wird unterwegs gesucht. Jede Section wird bei 390px
entworfen, Desktop ist die Erweiterung. Details in `css/CLAUDE.md`.

## Dateistruktur

```
/
├── index.html          # Einzige HTML-Datei, alle Sections, keine Templates
├── css/
│   ├── base.css        # ZUERST laden: CSS-Variablen, Reset, Typografie, Buttons, Utils
│   ├── ornaments.css   # Das gezeichnete Gold: .ink-System und Zeichenbewegung
│   ├── layout.css      # Header, Navigation, Footer
│   ├── hero.css        # Hero-Section (weiße Bühne, Foto im Bogen)
│   ├── menu.css        # Speisekarte („Vitrine": Wisch-Tabs + Sortenliste)
│   ├── about.css       # Über-uns, Zitat-Band und Galerie
│   ├── video.css       # Video-Section mit Click-to-Play-Fassade
│   ├── contact.css     # Kontakt & Öffnungszeiten
│   └── mobile.css      # ZULETZT laden: Aktionsbalken (nur Handy)
├── js/
│   ├── main.js         # Nav, Scroll, Reveal, Öffnungsstatus, Galerie-Punkte, Aktionsbalken
│   ├── menu.js         # Lädt data/menu.json und rendert die Speisekarte
│   └── video.js        # Tauscht die Video-Fassade beim Klick gegen den Player
├── data/
│   ├── menu.json       # Eissorten inkl. Kugelfarbe (Quelle für menu.js)
│   └── info.json       # Adresse, Öffnungszeiten, Kontakt (Referenz; HTML ist statisch)
└── assets/
    └── images/         # Fotos (WebP, je in voller Größe und als -900 fürs Handy)
```

**Wichtige Regel:** `css/base.css` definiert alle CSS Custom Properties (`--c-*`,
`--f-*`, `--space-*`, `--tap`). Alle anderen CSS-Dateien setzen base.css voraus.
`ornaments.css` kommt direkt danach (das System nutzen alle Sections),
`mobile.css` bleibt das letzte Stylesheet. Ladereihenfolge nicht ändern.

**Schriften** werden in `index.html` per `<link>` geladen, nicht per `@import` in
der CSS – ein `@import` in der ersten Datei kostet eine zusätzliche Rundreise vor
dem ersten Rendern.

## Sections in index.html (Reihenfolge)

| Section-ID   | CSS-Datei      | JS-Datei    | Datenquelle     |
|--------------|----------------|-------------|-----------------|
| `#home`      | hero.css       | main.js     | —               |
| `#sorten`    | menu.css       | menu.js     | data/menu.json  |
| (Zitat-Band) | about.css      | —           | —               |
| `#ueber-uns` | about.css      | —           | —               |
| `#video`     | video.css      | video.js    | —               |
| `#galerie`   | about.css      | main.js     | —               |
| `#kontakt`   | contact.css    | main.js     | data/info.json  |

Dazwischen sitzen `.wave-divider` – gezeichnete Goldwellen, die die Sections
trennen. Farbige Sektionsflächen gibt es nicht mehr, die Seite ist durchgehend
weiß.

## Inhalte anpassen

### Eissorten ändern
Nur `data/menu.json` bearbeiten – das JS rendert die Karten neu.
Jede Sorte hat ein Feld `color`: **die Farbe der Eiskugel auf der Website.**
Möglichst nah an der echten Sorte wählen; sehr helle Farben sind in Ordnung,
die Kugel bekommt im CSS einen feinen Rand und ein Glanzlicht.
Ungültige Werte werden von `menu.js` verworfen (Rückfall auf die Standardfarbe).
Kategorien können frei hinzugefügt/entfernt werden (Array `categories`) – die
Tab-Leiste ist am Handy wischbar und verträgt auch fünf oder sechs.

### Öffnungszeiten ändern
**Drei** Stellen, alle drei nötig:
1. `index.html` – Section `#kontakt` und Footer
2. `data/info.json`
3. `js/main.js` → Konstante `OPENING_HOURS` (steuert die „Jetzt geöffnet"-Anzeige)

Die Zeilen der Öffnungszeiten-Tabelle tragen `data-days` (0 = Sonntag).
Darüber hebt `main.js` die heutige Zeile hervor – sie bekommt den gezeichneten
Kringel um „heute".

### Saisonpause anzeigen
Am Element `#hero-status` in `index.html` die Attribute
`data-season-from="03-01"` und `data-season-to="10-31"` setzen (Format `MM-TT`).
Außerhalb des Zeitraums meldet die Seite „Winterpause" statt Öffnungszeiten.
Ohne diese Attribute wird ganzjährig nach `OPENING_HOURS` gerechnet.
Der Zeitraum darf über den Jahreswechsel gehen (z.B. `11-01` bis `02-28`).

### Video austauschen
Die Video-Section lädt **vor dem Klick nichts** vom Anbieter. Quelle wechseln
nur am `<button id="video-facade">` in `index.html`:

| Attribut                                  | Ergebnis                        |
|-------------------------------------------|---------------------------------|
| `data-video-yt="<VIDEO-ID>"`              | YouTube (youtube-nocookie)      |
| `data-video-mp4="assets/video/datei.mp4"` | eigenes MP4, selbst gehostet    |

Nur eines von beiden setzen; ist beides da, gewinnt das MP4.

Hinterlegt ist `53C8ecrirbI` – das professionell produzierte Video der
Gelateria selbst. Es bekommt deshalb eine eigene Section und ist nicht mehr
stummgeschaltetes Beiwerk im Hintergrund: wer darauf tippt, will es sehen und
hören.

### Fotos austauschen
Alle Fotos liegen als WebP unter `assets/images/`, **je zweimal**: in voller
Größe und als `-900`-Variante fürs Handy. Ausgeliefert wird über `srcset`.

| Datei                         | Ort im Layout                    | Format   |
|-------------------------------|----------------------------------|----------|
| `hero-eisdiele-front.webp`    | Hero – `.hero-img` (im Bogen)    | 3:2 quer |
| `ueber-uns-eisverkauf.webp`   | `.about-img-main`                | 4:5 hoch |
| `ueber-uns-portionieren.webp` | `.about-img-accent` (ab 900px)   | 4:5 hoch |
| `galerie-innenraum.webp`      | Galerie `--wide` + Video-Standbild | 3:2 quer |
| `galerie-gaeste.webp`         | Galerie `--tall` (hoher Anker)   | 2:3 hoch |
| `galerie-uebergabe.webp`      | Galerie `--small`                | 3:2 quer |
| `galerie-schlange.webp`       | Galerie `--small`                | 3:2 quer |

### Vitrinen-Fotos (Eissorten)
Die 15 Sortenfotos liegen unter `assets/images/vitrine/` – quadratisch 1:1,
je als `NAME.webp` (1600px) und `NAME-900.webp` (900px). Die PNG-Rohdateien
(1024×1024, generiert via OpenRouter `google/gemini-2.5-flash-image`) liegen
in `assets/images/vitrine-src/` und bleiben als Quelle erhalten.

Neue Sorte oder Austausch eines Bildes:
```sh
python3 tools/generate_vitrine.py SORTENNAME   # einzeln, sonst alle 15
```
Danach beide WebP-Größen erzeugen und im HTML eine `.vitrine-card` ergänzen.

Neues Foto aus einem JPG erzeugen – **beide** Größen:
```sh
ffmpeg -i FOTO.jpg -vf "scale=1600:-2" -frames:v 1 \
  -c:v libwebp -quality 85 -compression_level 6 -preset photo assets/images/NAME.webp
ffmpeg -i FOTO.jpg -vf "scale=900:-2" -frames:v 1 \
  -c:v libwebp -quality 82 -compression_level 6 -preset photo assets/images/NAME-900.webp
```
Beim Ersetzen `width`/`height`/`srcset` im HTML mitziehen (verhindert
Layout-Shift). Beim Hero muss zusätzlich das `imagesrcset` im `<link rel=preload>`
passen – sonst lädt der Browser zwei Dateien.

Der Bildausschnitt lässt sich pro Bild über `object-position` feinjustieren –
beim Hero in `css/hero.css`, in der Galerie per `style="object-position: …"`.

**Galerie:** am Handy ein Wisch-Karussell, ab 640px zwei Spalten, ab 900px das
12-Spalten-Mosaik. Die vier Kacheln sind im Mosaik fest platziert – kommt eine
dazu oder fällt eine weg, müssen die Regeln in `about.css` angepasst werden,
sonst bleibt eine Lücke.

### Texte / Über uns
Direkt in `index.html` in der Section `#ueber-uns`. Das Zitat-Band darüber ist
die **eine** handgeschriebene Stelle der Seite – sie wirkt nur, solange sie die
Ausnahme bleibt.

## Design-System

Die Identität kommt vom Ladenschild: weiße Tafel, schwarze Schreibschrift,
goldene Eistüte. Die Seite ist deshalb **reinweiß**, und das Gold ist die
einzige Farbe. Alle Tokens in `css/base.css`:

| Variable           | Wert     | Verwendung                        |
|--------------------|----------|-----------------------------------|
| `--c-bg`           | #FFFFFF  | Seitenhintergrund, durchgehend    |
| `--c-paper`        | #FAF7F2  | minimal warm, nur hinter Fotos    |
| `--c-text`         | #1A1512  | Fließtext, warmes Schwarz         |
| `--c-text-muted`   | #7A6F66  | Zweite Textebene                  |
| `--c-accent`       | #B8935A  | Gold vom Schild: Flächen und Deko |
| `--c-accent-deep`  | #8A6A3A  | Gold für **kleinen Text** – siehe unten |
| `--c-accent-light` | #F0E6D4  | Badges, Hover-Flächen             |
| `--c-border`       | #EBE3D8  | Rahmen, Trennlinien               |
| `--c-ink`          | #17110D  | Video-Bühne                       |
| `--c-pistachio`    | #8FA872  | Zweite Markenfarbe (vegan-Badge)  |
| `--f-display`      | Fraunces | Überschriften, Sortennamen        |
| `--f-sans`         | Karla    | Fließtext, Labels, Buttons        |
| `--f-hand`         | Caveat   | handgeschriebene Gold-Zeilen      |
| `--tap`            | 44px     | Mindesthöhe für alles Antippbare  |

**Zwei Goldtöne, und das ist Absicht:** `--c-accent` erreicht auf Weiß nur 3:1
und ist damit für kleinen Text zu hell. Alles unter Fließtextgröße
(`.t-label`, Footer-Überschriften, `.btn--accent`) nimmt `--c-accent-deep` (5:1).
Für Flächen, Linien und Ornamente bleibt `--c-accent`.

`--f-serif` bleibt als Aliasname auf `--f-display` bestehen.
Die Skala ab `--text-2xl` ist fluid (`clamp`) – Untergrenzen bewusst niedrig,
damit „Hausgemacht." bei 360px in eine Zeile passt.

### Gestalterische Leitidee
- **Reinweiß und gezeichnetes Gold.** Die verspielten Elemente sind
  handgezeichnet wirkende Federstriche – als Inline-SVG, nicht als Bild.
  Deshalb sind sie gestochen scharf, wenige KB groß und **zeichnen sich beim
  Scrollen selbst**. Das ganze System steht in `css/ornaments.css`.
- **Der Bogen.** Das Hero-Foto sitzt in einer oben gerundeten Form. Eine
  bewusste Formentscheidung, die italienische Architektur zitiert, statt Fotos
  in Browser-Rechtecke zu sperren.
- **Speisekarte = Vitrine:** jede Sorte trägt ihre echte Gelato-Farbe als Kugel.
  Die Farbe ist Information, keine Deko – man sieht, wie die Kugel aussieht.
  Das ist der eigene Einfall dieser Seite.
- **„Jetzt geöffnet":** der Laden hat Mo–Mi zu und ist ein Saisonbetrieb. Die
  Frage „kann ich jetzt hin?" beantwortet die Seite ganz oben im Hero, in der
  Tabelle und am Handy im Aktionsbalken.

### Wovon sich die Seite bewusst abgrenzt
Vorbild für die Bildsprache war eisoase.at (reinweiß + handgezeichnetes Gold).
Übernommen wurde das **Prinzip**, nicht die Ausführung – die Seite soll nicht
wie eine Kopie aussehen:

| eisoase.at                     | Reina                                     |
|--------------------------------|-------------------------------------------|
| alles zentriert                | asymmetrisch, versetzte Kompositionen     |
| Grotesk in Versalien           | Fraunces-Serife mit kursiven Goldwörtern   |
| Aquarellflecken, Marker-Look   | feine Federstrich-Linie mit Schraffur      |
| helles Gelbgold                | Messinggold vom Schild                     |
| Text als PNG gebacken          | echtes SVG und echter Text, animiert       |

## Reveal-Animationen
Elemente mit `data-reveal` werden beim Einblenden in den Viewport sanft
eingeblendet. Das CSS steht inline in `index.html`, die Logik in
`js/main.js → initRevealOnScroll()`. Dynamisch gerenderte Elemente
(Speisekarte) nutzen `menu.js → initRevealAfterRender()`.
**Dasselbe System treibt die Zeichenbewegung der Ornamente an.**

Die Regel hängt an `.js` am `<html>`-Element (wird per Inline-Skript im `<head>`
gesetzt): **ohne JavaScript wird nichts versteckt**, sonst bliebe die halbe
Seite unsichtbar, falls ein Skript nicht lädt.

`prefers-reduced-motion: reduce` wird global in `base.css` respektiert;
Animationen mit Endzustand (Hero-Zoom, Auftritt, Puls) zusätzlich in `hero.css`,
die Zeichenbewegung zusätzlich in `ornaments.css`. Wer dort etwas ergänzt, muss
es in den jeweiligen Block mit eintragen.

## Deployment

Einfach den Ordner auf einen HTTP-Server legen (z.B. `python3 -m http.server 8080`).
Wegen `fetch('data/menu.json')` in menu.js funktioniert `file://` nicht – immer über HTTP.

Nach Änderungen im Browser prüfen, und zwar **zuerst am Handy**: 360, 390 und
430px Breite, dazu Querformat. Die Messlatte im Hero ist, dass Status,
Überschrift und beide Buttons bei 390×844 ohne Scrollen zu sehen sind.
