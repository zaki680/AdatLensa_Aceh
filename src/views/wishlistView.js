import { store } from '../state/store.js';
import { escapeHtml } from '../utils/format.js';

export function renderWishlistView(t) {
  const favs = store.state.favorites;

  return `
    <section class="view-panel" aria-labelledby="wishHeading">
      <div class="section-head">
        <div>
          <h2 id="wishHeading" class="section-title">${escapeHtml(t('wish_title'))}</h2>
          <p class="section-subtitle">${escapeHtml(t('wish_sub'))}</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-nav="catalog">Jelajahi Katalog →</button>
      </div>

      ${
        favs.length === 0
          ? `<div class="alert alert-info">Belum ada item favorit tersimpan. Klik tombol <strong>Favorit</strong> pada Katalog atau Studio Mix &amp; Match.</div>`
          : `
          <div class="grid-3">
            ${favs
              .map(
                (f) => `
              <article class="card">
                <div>
                  <div class="meta-line">
                    <strong>${escapeHtml(f.tipeItem.toUpperCase())}</strong>
                    <span aria-hidden="true">·</span>
                    <span>Disimpan ${escapeHtml(f.tanggalDitambahkan)}</span>
                  </div>
                  <h3 class="card-title">${escapeHtml(f.titleLabel)}</h3>
                </div>
                <div style="display:flex; gap:8px; margin-top:14px;">
                  ${
                    f.tipeItem === 'busana' || f.tipeItem === 'photo'
                      ? `<button type="button" class="btn btn-primary btn-sm" style="flex:1;" data-wish-book-id="${escapeHtml(f.itemId)}" data-wish-book-type="${escapeHtml(f.tipeItem)}">Booking</button>`
                      : ''
                  }
                  <button type="button" class="btn btn-danger btn-sm" data-remove-fav="${escapeHtml(f.itemId)}" data-remove-type="${escapeHtml(f.tipeItem)}">Hapus</button>
                </div>
              </article>
            `
              )
              .join('')}
          </div>
        `
      }
    </section>
  `;
}

export function bindWishlistEvents(container) {
  container.querySelectorAll('[data-remove-fav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.toggleFavorite(btn.getAttribute('data-remove-fav'), btn.getAttribute('data-remove-type'), '');
    });
  });

  container.querySelectorAll('[data-wish-book-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-wish-book-id');
      const type = btn.getAttribute('data-wish-book-type');
      if (type === 'busana') store.ui.bookingDraft.busanaId = id;
      if (type === 'photo') store.ui.bookingDraft.pkgId = id;
      store.setView('booking');
    });
  });
}
