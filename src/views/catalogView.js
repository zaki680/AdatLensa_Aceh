import { openPhotoLightbox } from '../components/modal.js';
import { REGIONS } from '../data/seed.js';
import { store } from '../state/store.js';
import { escapeHtml, formatRp, makeFallbackSvg } from '../utils/format.js';

function getUnifiedItems() {
  const unified = [];

  store.state.busana.forEach((b) => {
    const availableSizes = Object.entries(b.stokPerUkuran || {})
      .filter(([, qty]) => qty > 0)
      .map(([sz, qty]) => `${sz} (${qty})`);
    const sizeKeys = Object.entries(b.stokPerUkuran || {})
      .filter(([, qty]) => qty > 0)
      .map(([sz]) => sz);
    const avgR = Number(store.getAvgRating(b));
    const revCount = (b.reviews || []).length;
    const latestRev = revCount > 0 ? `"${b.reviews[0].comment}" — ${b.reviews[0].user}` : '';

    unified.push({
      uid: b.id,
      type: 'busana',
      title: b.nama,
      region: b.wilayah,
      category: b.kategori,
      price: b.hargaSewa,
      sizes: sizeKeys,
      desc: b.deskripsi,
      rating: avgR,
      revCount,
      latestRev,
      extra1: `Filosofi: ${b.filosofiMotif}`,
      extra2: `Mitra: ${b.mitraUMKM} · Stok: ${availableSizes.join(', ') || 'Habis'}`,
      halalLabel: 'Ruang Ganti Muslimah Tersedia',
      halalOk: true,
      color: b.warnaUtama,
      imageUrl: b.imageUrl,
    });
  });

  store.state.photoPackages.forEach((p) => {
    unified.push({
      uid: p.id,
      type: 'photo',
      title: p.namaPaket,
      region: p.wilayah,
      category: 'Paket Fotografer & MUA',
      price: p.hargaPaket,
      sizes: ['S', 'M', 'L', 'XL'],
      desc: p.deskripsi,
      rating: 4.9,
      revCount: 12,
      latestRev: '',
      extra1: `Portofolio: ${p.portfolioStyle || 'Tone Editorial'}`,
      extra2: p.statusHalalProdukMUA,
      halalLabel: p.statusHalalProdukMUA.includes('BPJPH')
        ? 'Halal BPJPH (Kosmetik MUA)'
        : 'Layanan Ramah Muslim',
      halalOk: p.statusHalalProdukMUA.includes('BPJPH'),
      color: '#0d9488',
      imageUrl: p.imageUrl || '',
    });
  });

  store.state.spots.forEach((s) => {
    unified.push({
      uid: s.id,
      type: 'spot',
      title: s.nama,
      region: s.wilayah,
      category: 'Spot Foto Ikonik',
      price: s.estimasiTiket,
      sizes: ['S', 'M', 'L', 'XL'],
      desc: s.deskripsi,
      rating: 4.9,
      revCount: 18,
      latestRev: '',
      extra1: `Ibadah: ${s.fasilitasIbadah}`,
      extra2: `Ramah Muslim: ${s.fasilitasRamahMuslim}`,
      halalLabel: 'Fasilitas Ramah Muslim',
      halalOk: true,
      mapsUrl: s.mapsUrl,
      color: '#047857',
      imageUrl: s.imageUrl || '',
    });
  });

  return unified;
}

function renderCatalogCards() {
  const { search, region, category, size, sort } = store.ui.catalogFilters;
  const q = search.trim().toLowerCase();

  let filtered = getUnifiedItems().filter((item) => {
    const matchQ =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.region.toLowerCase().includes(q);
    const matchReg = region === 'Semua' || item.region === region;
    const matchCat = category === 'Semua' || item.category === category;
    const matchSize = size === 'Semua' || (item.sizes && item.sizes.includes(size));
    return matchQ && matchReg && matchCat && matchSize;
  });

  if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'rating_desc') filtered.sort((a, b) => b.rating - a.rating);

  if (filtered.length === 0) {
    return `<div class="alert alert-info" style="grid-column:1/-1;">Tidak ditemukan item yang sesuai dengan filter pencarian Anda.</div>`;
  }

  return filtered
    .map((item) => {
      const isFav = store.state.favorites.some((f) => f.itemId === item.uid);
      const fallbackUri = makeFallbackSvg(item.title, item.color);
      const activeImg = item.imageUrl || fallbackUri;

      return `
        <article class="card">
          <div>
            <div class="catalog-media">
              <img
                src="${escapeHtml(activeImg)}"
                alt="${escapeHtml(item.title)}"
                referrerpolicy="no-referrer"
                data-fallback-label="${escapeHtml(item.title)}"
                data-fallback-color="${escapeHtml(item.color)}"
              />
              <button
                type="button"
                class="zoom-btn"
                data-lightbox-img="${escapeHtml(activeImg)}"
                data-lightbox-title="${escapeHtml(item.title)}"
                data-lightbox-sub="${escapeHtml(item.category)} · ${escapeHtml(item.region)}"
                data-lightbox-color="${escapeHtml(item.color)}"
              >
                Perbesar
              </button>
            </div>

            <div class="meta-line">
              <strong>${escapeHtml(item.region)}</strong>
              <span aria-hidden="true">·</span>
              <span>${escapeHtml(item.category)}</span>
              <span aria-hidden="true">·</span>
              <span class="tabular-nums">★ ${item.rating} (${item.revCount})</span>
            </div>

            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <p class="card-desc">${escapeHtml(item.desc)}</p>

            <div class="card-details">
              <div>${escapeHtml(item.extra1)}</div>
              <div>${escapeHtml(item.extra2)}</div>
              <div>
                <span class="status-tag ${item.halalOk ? 'status-ok' : 'status-warn'}">
                  ${escapeHtml(item.halalLabel)}
                </span>
              </div>
              ${item.latestRev ? `<div class="card-quote">${escapeHtml(item.latestRev)}</div>` : ''}
            </div>
          </div>

          <div>
            <div class="card-footer-row">
              <div>
                <span class="price-figure">${item.price === 0 ? 'Gratis' : escapeHtml(formatRp(item.price))}</span>
                <span class="price-unit">${item.type === 'spot' ? '/ tiket est.' : '/ sesi'}</span>
              </div>
              <button
                type="button"
                class="btn btn-sm ${isFav ? 'btn-accent' : 'btn-secondary'}"
                data-fav-id="${escapeHtml(item.uid)}"
                data-fav-type="${escapeHtml(item.type)}"
                data-fav-title="${escapeHtml(item.title)}"
              >
                ${isFav ? 'Tersimpan' : 'Favorit'}
              </button>
            </div>

            ${
              item.type === 'spot'
                ? `<a href="${escapeHtml(item.mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="width:100%;">Buka di Google Maps ↗</a>`
                : `<button type="button" class="btn btn-primary btn-sm" style="width:100%;" data-quick-book-id="${escapeHtml(item.uid)}" data-quick-book-type="${escapeHtml(item.type)}">Pilih untuk Booking Sesi</button>`
            }
          </div>
        </article>
      `;
    })
    .join('');
}

export function renderCatalogView(t) {
  const { search, region, category, size, sort } = store.ui.catalogFilters;

  return `
    <section class="view-panel" aria-labelledby="catalogHeading">
      <div class="section-head">
        <div>
          <h2 id="catalogHeading" class="section-title">${escapeHtml(t('cat_title'))}</h2>
          <p class="section-subtitle">${escapeHtml(t('cat_sub'))}</p>
        </div>
      </div>

      <div class="filter-bar">
        <div class="form-field">
          <label for="filterSearch">Cari Koleksi / Spot</label>
          <input
            class="form-control"
            type="text"
            id="filterSearch"
            value="${escapeHtml(search)}"
            placeholder="Daro Baro, Gayo, Gunongan..."
          />
        </div>
        <div class="form-field">
          <label for="filterRegion">Wilayah</label>
          <select class="form-control" id="filterRegion">
            <option value="Semua" ${region === 'Semua' ? 'selected' : ''}>Semua Wilayah</option>
            ${REGIONS.map(
              (r) => `<option value="${escapeHtml(r)}" ${region === r ? 'selected' : ''}>${escapeHtml(r)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-field">
          <label for="filterCategory">Kategori</label>
          <select class="form-control" id="filterCategory">
            <option value="Semua" ${category === 'Semua' ? 'selected' : ''}>Semua Kategori</option>
            <option value="Busana Adat Aceh" ${category === 'Busana Adat Aceh' ? 'selected' : ''}>Busana Adat Aceh</option>
            <option value="Busana Kerawang Gayo" ${category === 'Busana Kerawang Gayo' ? 'selected' : ''}>Busana Kerawang Gayo</option>
            <option value="Aksesori Kepala" ${category === 'Aksesori Kepala' ? 'selected' : ''}>Aksesori Kepala</option>
            <option value="Paket Fotografer & MUA" ${category === 'Paket Fotografer & MUA' ? 'selected' : ''}>Paket Fotografer &amp; MUA Syar'i</option>
            <option value="Spot Foto Ikonik" ${category === 'Spot Foto Ikonik' ? 'selected' : ''}>Spot Foto Ikonik</option>
          </select>
        </div>
        <div class="form-field">
          <label for="filterSize">Ukuran Busana</label>
          <select class="form-control" id="filterSize">
            <option value="Semua" ${size === 'Semua' ? 'selected' : ''}>Semua Ukuran</option>
            <option value="S" ${size === 'S' ? 'selected' : ''}>Ukuran S</option>
            <option value="M" ${size === 'M' ? 'selected' : ''}>Ukuran M</option>
            <option value="L" ${size === 'L' ? 'selected' : ''}>Ukuran L</option>
            <option value="XL" ${size === 'XL' ? 'selected' : ''}>Ukuran XL</option>
          </select>
        </div>
        <div class="form-field">
          <label for="filterSort">Urutkan</label>
          <select class="form-control" id="filterSort">
            <option value="default" ${sort === 'default' ? 'selected' : ''}>Paling Relevan</option>
            <option value="rating_desc" ${sort === 'rating_desc' ? 'selected' : ''}>Rating Tertinggi</option>
            <option value="price_asc" ${sort === 'price_asc' ? 'selected' : ''}>Harga Terendah</option>
            <option value="price_desc" ${sort === 'price_desc' ? 'selected' : ''}>Harga Tertinggi</option>
          </select>
        </div>
      </div>

      <div class="grid-3" id="catalogCardsGrid">
        ${renderCatalogCards()}
      </div>
    </section>
  `;
}

export function bindCatalogEvents(container) {
  const grid = container.querySelector('#catalogCardsGrid');

  const wireGridHandlers = () => {
    grid.querySelectorAll('img[data-fallback-label]').forEach((img) => {
      img.addEventListener('error', () => {
        img.src = makeFallbackSvg(
          img.getAttribute('data-fallback-label'),
          img.getAttribute('data-fallback-color')
        );
      });
    });

    grid.querySelectorAll('[data-lightbox-img]').forEach((btn) => {
      btn.addEventListener('click', () => {
        openPhotoLightbox(
          btn.getAttribute('data-lightbox-img'),
          btn.getAttribute('data-lightbox-title'),
          btn.getAttribute('data-lightbox-sub'),
          btn.getAttribute('data-lightbox-color')
        );
      });
    });

    grid.querySelectorAll('[data-fav-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.toggleFavorite(
          btn.getAttribute('data-fav-id'),
          btn.getAttribute('data-fav-type'),
          btn.getAttribute('data-fav-title')
        );
      });
    });

    grid.querySelectorAll('[data-quick-book-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const uid = btn.getAttribute('data-quick-book-id');
        const type = btn.getAttribute('data-quick-book-type');
        if (type === 'busana') store.ui.bookingDraft.busanaId = uid;
        if (type === 'photo') store.ui.bookingDraft.pkgId = uid;
        store.setView('booking');
      });
    });
  };

  const refreshGrid = () => {
    store.ui.catalogFilters = {
      search: container.querySelector('#filterSearch').value,
      region: container.querySelector('#filterRegion').value,
      category: container.querySelector('#filterCategory').value,
      size: container.querySelector('#filterSize').value,
      sort: container.querySelector('#filterSort').value,
    };
    grid.innerHTML = renderCatalogCards();
    wireGridHandlers();
  };

  container.querySelector('#filterSearch').addEventListener('input', refreshGrid);
  ['#filterRegion', '#filterCategory', '#filterSize', '#filterSort'].forEach((sel) => {
    container.querySelector(sel).addEventListener('change', refreshGrid);
  });

  wireGridHandlers();
}
