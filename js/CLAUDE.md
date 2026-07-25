# js/ – JavaScript-Übersicht

Vanilla JS, kein Framework, kein Build-Schritt.

| Datei    | Verantwortlichkeit                                              |
|----------|-----------------------------------------------------------------|
| main.js  | Header-Scroll-Effekt, Mobile-Nav, aktiver Nav-Link, Reveal-Animation |
| menu.js  | Lädt `data/menu.json`, rendert Tabs + Flavor-Karten + Extras   |

## main.js – Funktionen
- `initHeader()` – `.scrolled`-Klasse auf Header bei Scroll > 40px
- `initMobileNav()` – Toggle/Close Overlay-Nav, Escape-Key, Body-Lock
- `initNavHighlight()` – `IntersectionObserver` markiert aktiven Nav-Link
- `initRevealOnScroll()` – `[data-reveal]` → `.revealed` bei Viewport-Einblenden

## menu.js – Ablauf
1. `fetch('data/menu.json')` beim DOMContentLoaded
2. `renderTabs()` → `#menu-tabs` befüllen, Click-Handler anhängen
3. `renderPanels()` → `#menu-panels` befüllen (alle Kategorien, erste aktiv)
4. `renderExtras()` → `#menu-extras` befüllen
5. `activateTab(id)` – schaltet aktiven Tab + Panel um

Fehler werden in `#menu-panels` als Fallback-Text angezeigt.

## Neue JS-Funktionalität
Neue Datei erstellen und in `index.html` vor `</body>` einbinden.  
Keine globalen Variablen einführen – alles in DOMContentLoaded-Closures halten.
