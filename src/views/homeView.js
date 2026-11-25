import { REGIONS } from '../data/seed.js';
import { createAcehMapController } from '../services/googleMaps.js';
import { store } from '../state/store.js';
import { escapeHtml, formatRp, makeFallbackSvg } from '../utils/format.js';

let activeMapController = null;

function renderRegionDetails(regionName, livePlaces = []) {
  const spots = store.state.spots.filter((s) => s.wilayah === regionName);
  const busanaList = store.state.busana.filter((b) => b.wilayah === regionName);
  const partners = busanaList.map((b) => b.mitraUMKM.replace(' (Simulasi)', '')).join(', ') || 'UMKM Mitra Aceh';

  const spotLinks = spots
    .map((s) => {
      const matched = livePlaces.find((p) => p.spotMeta && p.spotMeta.id === s.id);
      const liveAddress = matched?.place?.formattedAddress || '';
      const liveMapsUri = matched?.place?.googleMapsURI || s.mapsUrl;

      return `
        <div class="spot-mini-item">
          <div style="font-weight:700; color:var(--emerald-900);">${escapeHtml(s.nama)}</div>
          ${
            liveAddress
              ? `<div style="font-size:0.78rem; color:var(--text-muted); margin:2px 0;">${escapeHtml(liveAddress)}</div>`
              : ''
          }
          <div style="font-size:0.8rem; color:var(--text-secondary); margin:2px 0;">
            Ibadah: ${escapeHtml(s.fasilitasIbadah)}
          </div>
          <div style="font-size:0.8rem; color:var(--emerald-700); margin-bottom:4px;">
            Muslim-Friendly: ${escapeHtml(s.fasilitasRamahMuslim)}
          </div>
          <a
            href="${escapeHtml(liveMapsUri)}"
            target="_blank"
            rel="noopener noreferrer"
            style="font-size:0.8rem; color:var(--teal-700); font-weight:700; text-decoration:none;"
          >
            Buka Rute di Google Maps ↗
          </a>
        </div>
      `;
    })
    .join('');

  return `
    <div>
      <div class="meta-line">
        <strong>${escapeHtml(regionName)}</strong>
        <span aria-hidden="true">·</span>
        <span>${busanaList.length} Busana UMKM</span>
        <span aria-hidden="true">·</span>
        <span>${spots.length} Spot Foto</span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:14px;">
        Mitra aktif: <strong>${escapeHtml(partners)}</strong>
      </p>
      ${spotLinks || '<p style="font-size:0.85rem; color:var(--text-muted);">Belum ada spot terdaftar di wilayah ini.</p>'}
    </div>
    <button
      type="button"
      class="btn btn-primary btn-sm"
      data-filter-region="${escapeHtml(regionName)}"
    >
      Lihat Koleksi di ${escapeHtml(regionName)} →
    </button>
  `;
}

function renderCustomSearchDetails(query, entries) {
  const itemsHtml = entries
    .map(
      ({ place }, idx) => `
      <div class="spot-mini-item">
        <div style="font-weight:700; color:var(--emerald-900);">
          ${idx + 1}. ${escapeHtml(place.displayName || 'Lokasi')}
        </div>
        ${
          place.formattedAddress
            ? `<div style="font-size:0.8rem; color:var(--text-secondary); margin:2px 0;">${escapeHtml(place.formattedAddress)}</div>`
            : ''
        }
        ${
          place.googleMapsURI
            ? `<a href="${escapeHtml(place.googleMapsURI)}" target="_blank" rel="noopener noreferrer" style="font-size:0.8rem; color:var(--teal-700); font-weight:700; text-decoration:none;">Buka di Google Maps ↗</a>`
            : ''
        }
      </div>
    `
    )
    .join('');

  return `
    <div>
      <div class="meta-line">
        <strong>Hasil Pencarian Peta</strong>
        <span aria-hidden="true">·</span>
        <span>"${escapeHtml(query)}"</span>
      </div>
      ${itemsHtml || '<p style="font-size:0.85rem; color:var(--text-muted);">Tidak ditemukan lokasi yang cocok di Aceh.</p>'}
    </div>
    <button type="button" class="btn btn-secondary btn-sm" id="resetMapRegionBtn">
      Kembali ke Wilayah ${escapeHtml(store.ui.selectedMapRegion)}
    </button>
  `;
}

function renderRecommendationsGrid() {
  const { type, region, budget } = store.ui.recFilters;
  const filtered = store.state.bundlings.filter((b) => {
    const matchType = type === 'Semua' || b.tipeWisatawan === type;
    const matchReg = region === 'Semua' || b.wilayah === region;
    const matchBud = b.estimasiBiaya <= Number(budget);
    return matchType && matchReg && matchBud;
  });

  if (filtered.length === 0) {
    return `<div class="alert alert-info" style="grid-column:1/-1;">Tidak ada paket bundling yang cocok dengan kombinasi filter anggaran tersebut.</div>`;
  }

  return filtered
    .map(
      (b) => `
      <article class="card">
        <div>
          <div class="meta-line">
            <strong>${escapeHtml(b.wilayah)}</strong>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(b.tipeWisatawan)}</span>
            <span aria-hidden="true">·</span>
            <span>${b.durasiJam} Jam</span>
          </div>
          <h3 class="card-title">${escapeHtml(b.nama)}</h3>
          <p class="card-desc">${escapeHtml(b.deskripsi)}</p>
          <ul style="font-size:0.82rem; padding-left:18px; color:var(--text-secondary); margin-bottom:16px;">
            ${b.daftarItem.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div>
          <div class="card-footer-row">
            <div>
              <span class="price-figure">${escapeHtml(formatRp(b.estimasiBiaya))}</span>
              <span class="price-unit">/ paket</span>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            style="width:100%;"
            data-book-bundling="${escapeHtml(b.id)}"
          >
            Pesan Paket Ini
          </button>
        </div>
      </article>
    `
    )
    .join('');
}

export function renderHomeView(t) {
  const selectedRegion = store.ui.selectedMapRegion;
  const { type, region, budget } = store.ui.recFilters;

  const heroTiles = [
    {
      title: 'Daro Baro Pesisir Aceh',
      img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pakaian_Adat_Aceh_Wanita.jpg?width=640',
      color: '#064e3b',
    },
    {
      title: 'Busana Kerawang Gayo',
      img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Baju_Kerawang_Gayo.jpg?width=640',
      color: '#991b1b',
    },
    {
      title: 'Taman Sari Gunongan',
      img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gunongan_Aceh_Sultanate,_diambil_5_May_2026.jpg?width=640',
      color: '#047857',
    },
    {
      title: 'Danau Laut Tawar Gayo',
      img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Danau_Laut_Tawar_Takengon.jpg?width=640',
      color: '#0d9488',
    },
  ];

  return `
    <div class="view-panel">
      <section class="hero-panel" aria-labelledby="heroHeadline">
        <div class="hero-copy">
          <div class="hero-kicker">${escapeHtml(t('hero_kicker'))}</div>
          <h1 id="heroHeadline" class="hero-headline">${escapeHtml(t('hero_title'))}</h1>
          <p class="hero-desc">${escapeHtml(t('hero_desc'))}</p>
          <div class="hero-cta-row">
            <button type="button" class="btn btn-accent" data-nav="studio">${escapeHtml(t('btn_try_studio'))}</button>
            <button type="button" class="btn btn-hero-outline" data-nav="catalog">${escapeHtml(t('btn_explore_catalog'))}</button>
          </div>
        </div>

        <div class="hero-mosaic">
          ${heroTiles
            .map(
              (tile) => `
              <figure class="hero-tile">
                <img
                  src="${escapeHtml(tile.img)}"
                  alt="${escapeHtml(tile.title)}"
                  referrerpolicy="no-referrer"
                  data-fallback-label="${escapeHtml(tile.title)}"
                  data-fallback-color="${tile.color}"
                />
                <figcaption class="hero-tile-caption">${escapeHtml(tile.title)}</figcaption>
              </figure>
            `
            )
            .join('')}
        </div>
      </section>

      <section class="section-block" aria-labelledby="philoHeading">
        <div class="section-head">
          <div>
            <h2 id="philoHeading" class="section-title">${escapeHtml(t('philo_title'))}</h2>
            <p class="section-subtitle">${escapeHtml(t('philo_sub'))}</p>
          </div>
        </div>
        <div class="philosophy-grid">
          <article class="philosophy-card">
            <div class="philosophy-index">01 · Adat Pesisir Aceh</div>
            <h3>Linto Baro &amp; Daro Baro</h3>
            <p>
              Dasar hitam bermakna keteguhan dan keagungan, dipadukan sulaman benang emas <em>kasab</em> motif Pucuk Rebung serta <em>Kupiah Meukeutop</em> yang melambangkan kepemimpinan berlandaskan syariat.
            </p>
          </article>
          <article class="philosophy-card">
            <div class="philosophy-index">02 · Adat Dataran Tinggi</div>
            <h3>Kerawang Gayo</h3>
            <p>
              Perpaduan warna hitam, merah, kuning, putih, dan hijau dengan motif <em>Emun Berangkat</em> serta <em>Puter Tali</em> yang melambangkan persatuan, keberanian, dan kesucian niat.
            </p>
          </article>
          <article class="philosophy-card">
            <div class="philosophy-index">03 · Komitmen Halal Tourism</div>
            <h3>Ruang Ganti Tertutup &amp; MUA Syar'i</h3>
            <p>
              Seluruh mitra persewaan memisahkan ruang ganti Muslimah, menyediakan penataan hijab syar'i tanpa mencukur alis, dan memetakan jarak ke mushalla serta tempat wudu terdekat.
            </p>
          </article>
        </div>
      </section>

      <section class="section-block" aria-labelledby="mapHeading">
        <div class="section-head">
          <div>
            <h2 id="mapHeading" class="section-title">${escapeHtml(t('map_title'))}</h2>
            <p class="section-subtitle">${escapeHtml(t('map_sub'))}</p>
          </div>
        </div>

        <div class="map-panel">
          <div>
            <div class="segmented-pills" role="group" aria-label="Pilih Wilayah Aceh">
              ${REGIONS.map(
                (reg) => `
                  <button
                    type="button"
                    class="seg-btn ${selectedRegion === reg ? 'active' : ''}"
                    data-map-region="${escapeHtml(reg)}"
                  >
                    ${escapeHtml(reg)}
                  </button>
                `
              ).join('')}
            </div>

            <form class="map-toolbar" id="mapSearchForm">
              <label for="mapSearchInput" class="sr-only">Cari spot atau lokasi di Aceh</label>
              <input
                class="form-control"
                type="text"
                id="mapSearchInput"
                placeholder="${store.lang === 'id' ? 'Cari lokasi wisata / masjid / gerai di Aceh...' : 'Search tourist spot / landmark in Aceh...'}"
              />
              <button type="submit" class="btn btn-primary btn-sm">Cari Peta</button>
            </form>

            <div class="map-canvas-wrap">
              <div id="acehRealMap" class="real-map-canvas" aria-label="Peta interaktif Google Maps wilayah Aceh"></div>
              <div id="mapOverlayState" class="map-overlay-state">
                Memuat peta interaktif Google Maps...
              </div>
            </div>
          </div>

          <div class="map-detail" id="mapDetailPanel">
            ${renderRegionDetails(selectedRegion)}
          </div>
        </div>
      </section>

      <section class="section-block" aria-labelledby="recHeading">
        <div class="section-head">
          <div>
            <h2 id="recHeading" class="section-title">${escapeHtml(t('rec_title'))}</h2>
            <p class="section-subtitle">${escapeHtml(t('rec_sub'))}</p>
          </div>
        </div>

        <div class="filter-bar">
          <div class="form-field">
            <label for="recType">Tipe Wisatawan</label>
            <select class="form-control" id="recType">
              <option value="Semua" ${type === 'Semua' ? 'selected' : ''}>Semua Tipe</option>
              <option value="Solo" ${type === 'Solo' ? 'selected' : ''}>Solo Traveler</option>
              <option value="Pasangan" ${type === 'Pasangan' ? 'selected' : ''}>Pasangan (Couple)</option>
              <option value="Keluarga" ${type === 'Keluarga' ? 'selected' : ''}>Keluarga (3–5 Orang)</option>
            </select>
          </div>
          <div class="form-field">
            <label for="recRegion">Wilayah Tujuan</label>
            <select class="form-control" id="recRegion">
              <option value="Semua" ${region === 'Semua' ? 'selected' : ''}>Semua Wilayah</option>
              ${REGIONS.map(
                (r) => `<option value="${escapeHtml(r)}" ${region === r ? 'selected' : ''}>${escapeHtml(r)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-field">
            <label for="recBudget">Anggaran Maksimal</label>
            <select class="form-control" id="recBudget">
              <option value="99999999" ${Number(budget) === 99999999 ? 'selected' : ''}>Semua Anggaran</option>
              <option value="350000" ${Number(budget) === 350000 ? 'selected' : ''}>Maksimal Rp 350.000</option>
              <option value="650000" ${Number(budget) === 650000 ? 'selected' : ''}>Maksimal Rp 650.000</option>
              <option value="1200000" ${Number(budget) === 1200000 ? 'selected' : ''}>Maksimal Rp 1.200.000</option>
            </select>
          </div>
        </div>

        <div class="grid-3" id="recommendationGrid">
          ${renderRecommendationsGrid()}
        </div>
      </section>
    </div>
  `;
}

export function bindHomeEvents(container) {
  container.querySelectorAll('img[data-fallback-label]').forEach((img) => {
    img.addEventListener('error', () => {
      img.src = makeFallbackSvg(
        img.getAttribute('data-fallback-label'),
        img.getAttribute('data-fallback-color')
      );
    });
  });

  if (activeMapController) {
    activeMapController.destroy();
    activeMapController = null;
  }

  const mapEl = container.querySelector('#acehRealMap');
  const overlayEl = container.querySelector('#mapOverlayState');
  const detailPanel = container.querySelector('#mapDetailPanel');

  function bindRegionDetailButtons(scope) {
    scope.querySelectorAll('[data-filter-region]').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.ui.catalogFilters.region = btn.getAttribute('data-filter-region');
        store.setView('catalog');
      });
    });
    const resetBtn = scope.querySelector('#resetMapRegionBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => handleRegionSelect(store.ui.selectedMapRegion));
    }
  }

  async function focusRegionOnMap(regName) {
    if (!activeMapController) return;
    const spots = store.state.spots.filter((s) => s.wilayah === regName);
    try {
      const livePlaces = await activeMapController.focusRegion(regName, spots);
      if (detailPanel && document.body.contains(detailPanel)) {
        detailPanel.innerHTML = renderRegionDetails(regName, livePlaces);
        bindRegionDetailButtons(detailPanel);
      }
      if (overlayEl) overlayEl.hidden = true;
    } catch {
      if (overlayEl) {
        overlayEl.textContent = 'Gagal memuat lokasi pada Google Maps. Periksa koneksi jaringan atau kuota API.';
        overlayEl.hidden = false;
      }
    }
  }

  const handleRegionSelect = (regName) => {
    store.ui.selectedMapRegion = regName;
    if (detailPanel) {
      detailPanel.innerHTML = renderRegionDetails(regName);
      bindRegionDetailButtons(detailPanel);
    }
    container.querySelectorAll('.seg-btn[data-map-region]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-map-region') === regName);
    });
    void focusRegionOnMap(regName);
  };

  bindRegionDetailButtons(container);

  container.querySelectorAll('[data-map-region]').forEach((el) => {
    el.addEventListener('click', () => handleRegionSelect(el.getAttribute('data-map-region')));
  });

  const searchForm = container.querySelector('#mapSearchForm');
  const searchInput = container.querySelector('#mapSearchInput');
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q || !activeMapController) return;
    try {
      const entries = await activeMapController.searchCustomPlace(q);
      if (detailPanel) {
        detailPanel.innerHTML = renderCustomSearchDetails(q, entries);
        bindRegionDetailButtons(detailPanel);
      }
    } catch {
      if (detailPanel) {
        detailPanel.innerHTML = `<div class="alert alert-err">Tidak dapat memuat pencarian peta saat ini. Periksa koneksi atau kuota API.</div>`;
      }
    }
  });

  if (mapEl) {
    createAcehMapController(mapEl, store.lang)
      .then((controller) => {
        if (!document.body.contains(mapEl)) {
          controller.destroy();
          return;
        }
        activeMapController = controller;
        return focusRegionOnMap(store.ui.selectedMapRegion);
      })
      .catch((err) => {
        if (!overlayEl || !document.body.contains(overlayEl)) return;
        overlayEl.textContent =
          err?.message === 'MISSING_MAPS_API_KEY'
            ? 'Kunci Google Maps API belum tersedia di environment.'
            : 'Tidak dapat memuat Google Maps saat ini. Periksa koneksi jaringan Anda.';
        overlayEl.hidden = false;
      });
  }

  const recType = container.querySelector('#recType');
  const recRegion = container.querySelector('#recRegion');
  const recBudget = container.querySelector('#recBudget');
  const recGrid = container.querySelector('#recommendationGrid');

  const updateRecs = () => {
    store.ui.recFilters = {
      type: recType.value,
      region: recRegion.value,
      budget: Number(recBudget.value),
    };
    recGrid.innerHTML = renderRecommendationsGrid();
    bindBundlingButtons(recGrid);
  };

  function bindBundlingButtons(scope) {
    scope.querySelectorAll('[data-book-bundling]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bnd = store.state.bundlings.find((x) => x.id === btn.getAttribute('data-book-bundling'));
        if (bnd) {
          store.ui.bookingDraft.busanaId = bnd.defaultBusanaId || '';
          store.ui.bookingDraft.spotId = bnd.defaultSpotId || '';
          store.ui.bookingDraft.pkgId = bnd.defaultPkgId || '';
          store.ui.bookingDraft.notes = `Paket Rekomendasi: ${bnd.nama}`;
        }
        store.setView('booking');
      });
    });
  }

  [recType, recRegion, recBudget].forEach((sel) => sel.addEventListener('change', updateRecs));
  bindBundlingButtons(recGrid);
}
