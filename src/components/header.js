import { store } from '../state/store.js';
import { escapeHtml } from '../utils/format.js';

export function renderHeader(t) {
  const active = store.ui.activeView;
  const favCount = store.state.favorites.length;
  const user = store.currentUser;

  const navItems = [
    { id: 'home', label: t('nav_home') },
    { id: 'catalog', label: t('nav_catalog') },
    { id: 'studio', label: t('nav_studio') },
    { id: 'booking', label: t('nav_booking') },
    { id: 'mybookings', label: t('nav_mybookings') },
    { id: 'wishlist', label: `${t('nav_wishlist')} (${favCount})` },
    { id: 'admin', label: t('nav_admin') },
  ];

  const bannerHtml = store.bannerDismissed
    ? ''
    : `
      <div class="demo-strip" role="note">
        <span>${escapeHtml(t('demoBanner'))}</span>
        <button type="button" class="demo-strip-close" data-action="dismiss-banner">${escapeHtml(t('dismiss'))}</button>
      </div>
    `;

  if (!user) {
    return `
      ${bannerHtml}
      <div class="motif-strip" aria-hidden="true"></div>
      <header class="site-header">
        <div class="nav-shell">
          <a href="#login" class="brand-link" data-nav="login">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="#064e3b"/>
              <path d="M10 32V16C10 10.5 14.5 7 20 7C25.5 7 30 10.5 30 16V32" stroke="#f59e0b" stroke-width="2.5"/>
              <path d="M14 32V18C14 14 16.5 11.5 20 11.5C23.5 11.5 26 14 26 18V32" stroke="#14b8a6" stroke-width="2"/>
              <circle cx="20" cy="21" r="2.5" fill="#f59e0b"/>
            </svg>
            <span class="brand-wordmark">AdatLensa Aceh</span>
          </a>

          <div class="header-actions">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              data-action="toggle-lang"
              aria-label="Ubah Bahasa"
            >
              ${store.lang === 'id' ? 'ID / EN' : 'EN / ID'}
            </button>
          </div>
        </div>
      </header>
    `;
  }

  const authControl = `
    <button type="button" class="btn btn-secondary btn-sm" data-action="logout" title="${escapeHtml(user.name)}">
      ${escapeHtml(user.name.split(' ')[0])} · ${escapeHtml(t('btn_logout'))}
    </button>
  `;

  return `
    ${bannerHtml}
    <div class="motif-strip" aria-hidden="true"></div>
    <header class="site-header">
      <div class="nav-shell">
        <a href="#home" class="brand-link" data-nav="home">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="#064e3b"/>
            <path d="M10 32V16C10 10.5 14.5 7 20 7C25.5 7 30 10.5 30 16V32" stroke="#f59e0b" stroke-width="2.5"/>
            <path d="M14 32V18C14 14 16.5 11.5 20 11.5C23.5 11.5 26 14 26 18V32" stroke="#14b8a6" stroke-width="2"/>
            <circle cx="20" cy="21" r="2.5" fill="#f59e0b"/>
          </svg>
          <span class="brand-wordmark">AdatLensa Aceh</span>
        </a>

        <nav class="primary-nav" aria-label="Navigasi utama">
          ${navItems
            .map(
              (item) => `
                <button
                  type="button"
                  class="nav-link ${active === item.id ? 'active' : ''}"
                  data-nav="${item.id}"
                  ${active === item.id ? 'aria-current="page"' : ''}
                >
                  ${escapeHtml(item.label)}
                </button>
              `
            )
            .join('')}
        </nav>

        <div class="header-actions">
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            data-action="toggle-lang"
            aria-label="Ubah Bahasa"
          >
            ${store.lang === 'id' ? 'ID / EN' : 'EN / ID'}
          </button>
          ${authControl}
          <button
            type="button"
            class="mobile-menu-btn"
            data-action="toggle-mobile-nav"
            aria-expanded="false"
            aria-controls="mobileDrawer"
          >
            Menu
          </button>
        </div>
      </div>

      <nav id="mobileDrawer" class="mobile-drawer" aria-label="Menu seluler">
        ${navItems
          .map(
            (item) => `
              <button
                type="button"
                class="nav-link ${active === item.id ? 'active' : ''}"
                data-nav="${item.id}"
              >
                ${escapeHtml(item.label)}
              </button>
            `
          )
          .join('')}
      </nav>
    </header>
  `;
}

export function bindHeaderEvents(root) {
  const menuBtn = root.querySelector('[data-action="toggle-mobile-nav"]');
  const drawer = root.querySelector('#mobileDrawer');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }
}
