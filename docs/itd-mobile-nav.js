/* ============================================================
   InTandem Desk — Admin Mobile navigation

   Replaces the desktop sidebar with a five-slot bottom bar plus a
   "More" sheet. It does NOT touch the router: every destination is
   the same `#/route` hash the web app uses, so both apps share one
   set of view modules and one set of URLs.

   Adding a route later means adding it to SECONDARY below. Nothing
   else needs to change.
   ============================================================ */

(function (App) {
  'use strict';

  /* The five most-used destinations get a permanent slot. Everything
     else lives one tap away in the sheet. */
  const PRIMARY = [
    { route: 'dashboard', label: 'Home',     icon: 'fa-gauge-high' },
    { route: 'projects',  label: 'Projects', icon: 'fa-diagram-project' },
    { route: 'ledger',    label: 'Ledger',   icon: 'fa-receipt', count: 'cLedger' },
    { route: 'staff',     label: 'Team',     icon: 'fa-users' }
  ];

  const SECONDARY = [
    { group: 'Delivery', items: [
      { route: 'schedule', label: 'Schedule', icon: 'fa-list-check' },
      { route: 'budget',   label: 'Budget',   icon: 'fa-sack-dollar' },
      { route: 'payments', label: 'Payments', icon: 'fa-file-invoice-dollar' }
    ]},
    { group: 'Money', items: [
      { route: 'vendors', label: 'Vendors', icon: 'fa-building' }
    ]},
    { group: 'Team & Docs', items: [
      { route: 'reports',  label: 'Reports',  icon: 'fa-file-lines' },
      { route: 'news',     label: 'News',     icon: 'fa-newspaper' },
      { route: 'settings', label: 'Settings', icon: 'fa-gear', ownerOnly: true }
    ]}
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const currentRoute = () => (location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[0]) || 'dashboard';

  /** Routes the current role may actually open. */
  function allowed(item) {
    if (!item.ownerOnly) return true;
    return !App.Roles || App.Roles.can.accessSettings();
  }

  function buildBar() {
    const bar = $('#botnav'); if (!bar) return;
    bar.innerHTML = PRIMARY.map(i => `
      <a class="botnav__i" data-route="${i.route}" href="#/${i.route}">
        <i class="fa-solid ${i.icon}"></i><span>${esc(i.label)}</span>
      </a>`).join('') + `
      <button class="botnav__i" id="btnMore" type="button" aria-haspopup="dialog">
        <i class="fa-solid fa-ellipsis"></i><span>More</span>
      </button>`;
    $('#btnMore').addEventListener('click', openSheet);
  }

  function buildSheet() {
    const host = $('#sheetBody'); if (!host) return;
    host.innerHTML = SECONDARY.map(g => {
      const items = g.items.filter(allowed);
      if (!items.length) return '';
      return `<div class="sheet__t">${esc(g.group)}</div>` + items.map(i => `
        <a class="sheet__link" data-route="${i.route}" href="#/${i.route}">
          <i class="fa-solid ${i.icon}"></i><span>${esc(i.label)}</span>
          <i class="fa-solid fa-chevron-right sheet__go"></i>
        </a>`).join('');
    }).join('');
    $$('#sheetBody .sheet__link').forEach(a => a.addEventListener('click', closeSheet));
  }

  function openSheet() { buildSheet(); markActive(); $('#sheet').classList.add('is-open'); }
  function closeSheet() { $('#sheet').classList.remove('is-open'); }

  function openSearch() { $('#msearch').classList.add('is-open'); setTimeout(() => $('#searchInput')?.focus(), 60); }
  function closeSearch() { $('#msearch').classList.remove('is-open'); }

  /** Highlight the active destination in both the bar and the sheet. */
  function markActive() {
    const r = currentRoute();
    $$('.botnav__i[data-route]').forEach(a => a.classList.toggle('is-active', a.dataset.route === r));
    $$('#sheetBody .sheet__link').forEach(a => a.classList.toggle('is-active', a.dataset.route === r));
    // A secondary route is active → light up "More" instead.
    const inBar = PRIMARY.some(i => i.route === r);
    const more = $('#btnMore'); if (more) more.classList.toggle('is-active', !inBar);
  }

  /** Mirror the sidebar count badges the shared views populate. */
  function syncCounts() {
    PRIMARY.filter(i => i.count).forEach(i => {
      const src = document.getElementById(i.count);
      const slot = $(`.botnav__i[data-route="${i.route}"]`);
      if (!src || !slot) return;
      const v = (src.textContent || '').trim();
      let b = slot.querySelector('.botnav__n');
      if (!v) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement('span'); b.className = 'botnav__n'; slot.appendChild(b); }
      b.textContent = v;
    });
  }

  function init() {
    buildBar();
    buildSheet();
    markActive();
    syncCounts();

    window.addEventListener('hashchange', () => { markActive(); closeSheet(); });

    $('#sheetBg')?.addEventListener('click', closeSheet);
    $('#sheetGrip')?.addEventListener('click', closeSheet);
    $('#btnSearch')?.addEventListener('click', openSearch);
    $('#msearchBg')?.addEventListener('click', closeSearch);
    $('#msearchClose')?.addEventListener('click', closeSearch);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeSheet(); closeSearch(); }
    });

    // Rebuild when the role changes — Settings may appear or disappear.
    document.addEventListener('itd:auth', () => { buildSheet(); markActive(); });
  }

  App.MobileNav = { init, markActive, syncCounts, openSheet, closeSheet };

})(window.App);
