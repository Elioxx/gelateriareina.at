/**
 * menu.js — Fetches data/menu.json and renders the Speisekarte section dynamically.
 * Tabs + flavor cards + extras. Depends on #menu-tabs, #menu-panels, #menu-extras.
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

function renderTabs(categories) {
  const container = document.getElementById('menu-tabs');
  if (!container) return;

  container.innerHTML = categories
    .map(
      (cat, i) =>
        `<button class="menu-tab${i === 0 ? ' active' : ''}"
           data-tab="${cat.id}"
           aria-controls="panel-${cat.id}"
           aria-selected="${i === 0}"
           role="tab">
          ${cat.name}
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
    panel.classList.toggle('active', panel.id === `panel-${id}`);
  });
}

function renderPanels(categories) {
  const container = document.getElementById('menu-panels');
  if (!container) return;

  container.innerHTML = categories
    .map(
      (cat, i) => `
      <div class="menu-panel${i === 0 ? ' active' : ''}" id="panel-${cat.id}" role="tabpanel">
        <div class="menu-category-header" data-reveal>
          <div class="menu-category-icon">${cat.icon}</div>
          <p class="menu-category-desc">${cat.description}</p>
        </div>
        <div class="flavor-grid" data-reveal>
          ${cat.flavors.map(renderFlavorCard).join('')}
        </div>
      </div>`
    )
    .join('');

  initRevealAfterRender();
}

function renderFlavorCard(flavor) {
  const badge = flavor.vegan
    ? '<span class="flavor-badge">vegan</span>'
    : '';

  return `
    <div class="flavor-card">
      <div class="flavor-name">${flavor.name}</div>
      <div class="flavor-desc">${flavor.description}</div>
      ${badge}
    </div>`;
}

function renderExtras(extras, note) {
  const container = document.getElementById('menu-extras');
  if (!container || !extras?.length) return;

  container.innerHTML = `
    <div class="menu-extras" data-reveal>
      <span class="t-label">Außerdem</span>
      <div class="extras-grid">
        ${extras.map(e => `
          <div class="extra-item">
            <div class="extra-name">${e.name}</div>
            <div class="extra-note">${e.note}</div>
          </div>`).join('')}
      </div>
      ${note ? `<p class="menu-note">${note}</p>` : ''}
    </div>`;

  initRevealAfterRender();
}

/* Re-observe newly inserted [data-reveal] elements */
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
