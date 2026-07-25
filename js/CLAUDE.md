# js/ – JavaScript-Übersicht

Vanilla JS, kein Framework, kein Build-Schritt.

| Datei    | Verantwortlichkeit                                                          |
|----------|------------------------------------------------------------------------------|
| main.js  | Header-Scroll, Mobile-Nav, aktiver Nav-Link, Reveal-Animation, Öffnungsstatus, Galerie-Punkte, Aktionsbalken |
| menu.js  | Lädt `data/menu.json`, rendert Tabs + Sortenkarten + Extras                   |
| video.js | Click-to-Play: tauscht die Video-Fassade gegen den echten Player              |

## main.js – Funktionen
- `initHeader()` – `.scrolled`-Klasse auf Header bei Scroll > 40px
- `initMobileNav()` – Toggle/Close Overlay-Nav, Escape-Key, Body-Lock, Fokus auf Schließen
- `initNavHighlight()` – `IntersectionObserver` markiert aktiven Nav-Link
- `initRevealOnScroll()` – `[data-reveal]` → `.revealed` beim Einblenden.
  **Treibt auch die gezeichneten Ornamente an** (siehe `css/CLAUDE.md`) – wer
  hier etwas ändert, ändert auch, wann sich die Goldstriche zeichnen.
- `initOpeningStatus()` – „Jetzt geöffnet"-Anzeige + heutige Zeile in der Tabelle
- `initMap()` – setzt `src` der OSM-Karte aus `data-src`, sobald sie in den Blick kommt
- `initGalleryDots()` – Punkte unter dem Galerie-Karussell (nur Anzeige, nicht
  bedienbar: als Tap-Ziele wären sie zu klein, gewischt wird am Bild). Ab 640px
  blendet das CSS sie aus.
- `initActionBar()` – blendet den Aktionsbalken „Anrufen / Route" ein, sobald der
  Hero durch ist. Nur am Handy sichtbar (`css/mobile.css`).

## video.js – Click-to-Play
Vor dem Klick lädt die Seite **nichts** vom Videoanbieter: kein Fremd-Cookie,
kein Player-Skript, kein Autoplay (das iOS ohnehin blockiert). Erst der Klick
ersetzt die Fassade.

Quelle wechseln – nur im HTML an `#video-facade`, in `video.js` nichts anfassen:

| Attribut                                    | Ergebnis                          |
|---------------------------------------------|-----------------------------------|
| `data-video-yt="<VIDEO-ID>"`                | `<iframe>` auf youtube-nocookie   |
| `data-video-mp4="assets/video/datei.mp4"`   | `<video>`, selbst gehostet        |

Ist beides gesetzt, gewinnt das MP4. Der Fokus wird nach dem Tausch auf den
Player nachgezogen – sonst landet er am Seitenanfang, weil die Fassade weg ist.

Hinterlegt ist `53C8ecrirbI`, das eigene Video der Gelateria. Es startet mit
Ton: der Klick ist die Absicht, es sehen zu wollen.

### Öffnungsstatus
- `OPENING_HOURS` – Array über die Wochentage (Index 0 = Sonntag), `null` = geschlossen,
  sonst `[Öffnung, Schließung]` in vollen Stunden. **Bei Änderung der Öffnungszeiten
  hier mit anpassen** – zusätzlich zu `index.html` und `data/info.json`.
- `viennaTime()` – aktuelle Zeit in `Europe/Vienna` über `Intl.formatToParts`.
  Bewusst nicht die Gerätezeit: ein Handy im Ausland zeigte sonst Falsches an.
  Gibt `null` zurück, wenn `Intl` fehlt – dann bleibt der Text aus dem HTML stehen.
- `describeStatus()` – liefert `{ open, text }`, sucht bei geschlossenem Laden den
  nächsten offenen Tag („morgen" / „am Donnerstag").
- `isOutOfSeason()` – optionale Saisonpause aus `data-season-from` / `data-season-to`
  am `#hero-status`, Format `MM-TT`, darf über den Jahreswechsel gehen.

Der Rückfalltext in `#hero-status` (im HTML) muss immer stimmen – er ist das, was
ohne JavaScript zu sehen ist.

### Karte
Die OSM-Einbettung (`export/embed.html`) legt ihre Zeichenfläche einmal beim
Erzeugen des Dokuments fest und skaliert danach nicht mehr mit – weder beim
Neuladen des Iframes noch bei einer Größenänderung. Deshalb zwei Vorkehrungen:
`initMap()` setzt `src` erst beim Sichtbarwerden, und `css/contact.css` gibt der
Karte eine **feste Höhe** von 300px statt einer prozentualen Fläche. In einer
größeren Fläche bleibt die Karte sonst als kleines Rechteck oben links stehen.

Die **Breite** ist inzwischen fließend (`width: 100%; max-width: 400px`): fix
400px ragten bei 360px Viewport über den Bildschirmrand hinaus. Weil `src` erst
gesetzt wird, wenn die Breite feststeht, misst die Karte trotzdem richtig.
Wer die Kartengröße ändert, muss im Browser nachsehen, ob sie noch füllt.

## menu.js – Ablauf
1. `fetch('data/menu.json')` beim DOMContentLoaded
2. `renderTabs()` → `#menu-tabs` befüllen, Click-Handler anhängen
3. `renderPanels()` → `#menu-panels` befüllen (alle Kategorien, erste aktiv)
4. `renderExtras()` → `#menu-extras` befüllen
5. `activateTab(id)` – schaltet aktiven Tab + Panel um

Fehler werden in `#menu-panels` als Fallback-Text angezeigt.

- `esc()` maskiert alle Werte aus der JSON – die landen per `innerHTML` im DOM.
- `scoopColor()` lässt nur echte Hex-Farben durch; alles andere fällt auf die
  Standardfarbe aus `css/menu.css` zurück.
- `renderFlavorCard()` setzt `--i` (Staffelung) und `--scoop` (Kugelfarbe) inline.

## Neue JS-Funktionalität
Neue Datei erstellen und in `index.html` vor `</body>` einbinden.
Keine globalen Variablen einführen – alles in DOMContentLoaded-Closures halten.

## Grundsatz: ohne JavaScript darf nichts fehlen
Alles, was JS versteckt oder einblendet, hängt an der Klasse `.js`, die ein
Inline-Skript im `<head>` setzt. Fällt JS aus, greift keine dieser Regeln und
die Seite ist vollständig lesbar: Reveal-Animationen, die Zeichenbewegung der
Ornamente, der Aktionsbalken. Nur die Speisekarte bleibt leer – sie kommt per
`fetch`. Der Rückfalltext in `#hero-status` muss deshalb immer die tatsächlich
veröffentlichten Zeiten nennen.
