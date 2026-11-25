import { bindHeaderEvents, renderHeader } from './components/header.js';
import { ensureModalMount } from './components/modal.js';
import { createTranslator } from './data/i18n.js';
import { store } from './state/store.js';
import { escapeHtml } from './utils/format.js';
import { bindAdminEvents, renderAdminView } from './views/adminView.js';
import { bindAuthEvents, renderAuthView } from './views/authView.js';
import { bindBookingEvents, renderBookingView } from './views/bookingView.js';
import { bindCatalogEvents, renderCatalogView } from './views/catalogView.js';
import { bindHomeEvents, renderHomeView } from './views/homeView.js';
import { bindMyBookingsEvents, renderMyBookingsView } from './views/myBookingsView.js';
import { bindStudioEvents, renderStudioView } from './views/studioView.js';
import { bindWishlistEvents, renderWishlistView } from './views/wishlistView.js';

// Tier 1 Google Maps Platform quota & auth failure listener
window.gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

const origConsoleError = console.error;
console.error = (...args) => {
  origConsoleError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

let gmpQuotaExceeded = false;

const quotaSlot = document.createElement('div');
quotaSlot.id = 'gmpQuotaBannerSlot';
document.body.prepend(quotaSlot);

function renderQuotaBanner() {
  if (!gmpQuotaExceeded) {
    quotaSlot.innerHTML = '';
    return;
  }
  quotaSlot.innerHTML = `
    <div class="gmp-quota-banner" role="alert">
      <span>
        Google Maps Platform quota reached. If you are the app owner, visit
        <a
          href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
          target="_blank"
          rel="noopener noreferrer"
        >maps developer site</a>
        for instructions to update your account.
      </span>
    </div>
  `;
}

window.addEventListener('gmp-quota-exceeded', () => {
  if (!gmpQuotaExceeded) {
    gmpQuotaExceeded = true;
    renderQuotaBanner();
  }
});

const t = createTranslator(() => store.lang);
const appRoot = document.getElementById('app');

const VALID_VIEWS = new Set([
  'home',
  'catalog',
  'studio',
  'booking',
  'mybookings',
  'wishlist',
  'admin',
  'login',
]);

function renderActiveView() {
  switch (store.ui.activeView) {
    case 'catalog':
      return { html: renderCatalogView(t), bind: bindCatalogEvents };
    case 'studio':
      return { html: renderStudioView(t), bind: bindStudioEvents };
    case 'booking':
      return { html: renderBookingView(t), bind: bindBookingEvents };
    case 'mybookings':
      return { html: renderMyBookingsView(t), bind: bindMyBookingsEvents };
    case 'wishlist':
      return { html: renderWishlistView(t), bind: bindWishlistEvents };
    case 'admin':
      return { html: renderAdminView(t), bind: bindAdminEvents };
    case 'login':
      return { html: renderAuthView(t), bind: bindAuthEvents };
    case 'home':
    default:
      return { html: renderHomeView(t), bind: bindHomeEvents };
  }
}

function renderApp() {
  const { html, bind } = renderActiveView();

  appRoot.innerHTML = `
    ${renderHeader(t)}
    <main class="main-container" id="mainView">
      ${html}
    </main>
    <footer class="site-footer">
      <div class="footer-inner">
        <span>${escapeHtml(t('footer_copy'))}</span>
        <span>${escapeHtml(t('footer_note'))}</span>
      </div>
    </footer>
  `;

  bindHeaderEvents(appRoot);

  appRoot.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      store.setView(el.getAttribute('data-nav'));
    });
  });

  const langBtn = appRoot.querySelector('[data-action="toggle-lang"]');
  if (langBtn) langBtn.addEventListener('click', () => store.toggleLang());

  const logoutBtn = appRoot.querySelector('[data-action="logout"]');
  if (logoutBtn) logoutBtn.addEventListener('click', () => store.logout());

  const dismissBtn = appRoot.querySelector('[data-action="dismiss-banner"]');
  if (dismissBtn) dismissBtn.addEventListener('click', () => store.dismissBanner());

  const mainEl = appRoot.querySelector('#mainView');
  if (mainEl && bind) bind(mainEl);
}

function syncRouteFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (!store.currentUser) {
    store.setView(hash && VALID_VIEWS.has(hash) ? hash : 'login');
    return;
  }
  if (hash && VALID_VIEWS.has(hash)) {
    store.setView(hash);
  } else {
    renderApp();
  }
}

ensureModalMount();
renderQuotaBanner();
document.documentElement.lang = store.lang;
store.subscribe(renderApp);
window.addEventListener('hashchange', syncRouteFromHash);
syncRouteFromHash();
