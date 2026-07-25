/**
 * menu.js — Lädt data/menu.json und rendert die Speisekarte.
 * Tabs + Sortenkarten + Extras. Erwartet #menu-tabs, #menu-panels, #menu-extras.
 *
 * Jede Sorte trägt ihre Farbe als CSS-Variable --scoop; das Aussehen
 * der Kugel steckt komplett in css/menu.css → .flavor-scoop.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadMenu();
});

async function loadMenu() {
  try {
    const res = await fetch('data/menu.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderTabs(data.categories);
    renderPanels(data.categories);
    renderExtras(data.extras, data.note);
  } catch (err) {
    console.error('Speisekarte konnte nicht geladen werden:', err);
    document.getElementById('menu-panels')?.insertAdjacentHTML(
      'beforeend',
      '<p class="menu-note">Speisekarte wird gerade aktualisiert – bitte bald wieder vorbeischauen.</p>'
    );
  }
}

/* --- Hilfsfunktionen ---------------------------------------------- */

/* Inhalte aus der JSON landen per innerHTML im DOM — Sonderzeichen
   maskieren, damit ein & oder < im Sortennamen das Markup nicht bricht. */
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* Nur echte Hex-Farben durchlassen — alles andere fällt auf die
   Standardfarbe aus css/menu.css zurück. */
function scoopColor(color) {
  return /^#[0-9a-f]{3,8}$/i.test(String(color || '')) ? color : null;
}

/* --- Rendering ----------------------------------------------------- */

function renderTabs(categories) {
  const container = document.getElementById('menu-tabs');
  if (!container) return;

  container.innerHTML = categories
    .map(
      (cat, i) =>
        `<button class="menu-tab${i === 0 ? ' active' : ''}"
           data-tab="${esc(cat.id)}"
           aria-controls="panel-${esc(cat.id)}"
           aria-selected="${i === 0}"
           role="tab">
          ${esc(cat.name)}
        </button>`
    )
    .join('');

  container.addEventListener('click', e => {
    const btn = e.target.closest('.menu-tab');
    if (!btn) return;
    activateTab(btn.dataset.tab);
  });
}

function activateTab(id) {
  document.querySelectorAll('.menu-tab').forEach(btn => {
    const active = btn.dataset.tab === id;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });

  document.querySelectorAll('.menu-panel').forEach(panel => {
    const active = panel.id === `panel-${id}`;
    panel.classList.toggle('active', active);

    // Ein verstecktes Panel löst keinen IntersectionObserver aus. Beim
    // Umschalten deshalb sofort einblenden, statt auf den Beobachter zu
    // warten — sonst blitzt das Raster beim Tab-Wechsel kurz leer auf.
    if (active) {
      panel.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
    }
  });
}

function renderPanels(categories) {
  const container = document.getElementById('menu-panels');
  if (!container) return;

  container.innerHTML = categories
    .map((cat, i) => {
      const count = cat.flavors?.length || 0;
      return `
      <div class="menu-panel${i === 0 ? ' active' : ''}" id="panel-${esc(cat.id)}" role="tabpanel">
        <div class="menu-category-header" data-reveal>
          <p class="menu-category-desc">${esc(cat.description)}</p>
          <span class="menu-category-count">${count} Sorten</span>
        </div>
        <div class="flavor-grid" data-reveal>
          ${(cat.flavors || []).map(renderFlavorCard).join('')}
        </div>
      </div>`;
    })
    .join('');

  initRevealAfterRender();
}

function renderFlavorCard(flavor, index) {
  const badge = flavor.vegan ? '<span class="flavor-badge">vegan</span>' : '';
  const color = scoopColor(flavor.color);

  // --i steuert die gestaffelte Einblendung (css/menu.css)
  const style = `--i:${index}` + (color ? `;--scoop:${color}` : '');

  return `
    <article class="flavor-card" style="${style}">
      <span class="flavor-scoop" aria-hidden="true"></span>
      <div class="flavor-body">
        <h3 class="flavor-name">${esc(flavor.name)}</h3>
        <p class="flavor-desc">${esc(flavor.description)}</p>
        ${badge}
      </div>
    </article>`;
}

function renderExtras(extras, note) {
  const container = document.getElementById('menu-extras');
  if (!container || !extras?.length) return;

  container.innerHTML = `
    <div class="menu-extras" data-reveal>
      <span class="t-label">Außerdem bei uns</span>
      <div class="extras-grid">
        ${extras.map(e => `
          <div class="extra-item">
            <div class="extra-name">${esc(e.name)}</div>
            <div class="extra-note">${esc(e.note)}</div>
          </div>`).join('')}
      </div>
      ${note ? `<p class="menu-note">${esc(note)}</p>` : ''}
    </div>`;

  initRevealAfterRender();
}

/* Neu eingefügte [data-reveal]-Elemente nachträglich beobachten */
function initRevealAfterRender() {
  document.querySelectorAll('[data-reveal]:not(.observed)').forEach(el => {
    el.classList.add('observed');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(el);
  });
}
