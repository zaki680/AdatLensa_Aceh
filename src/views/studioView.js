import { STUDIO_OPTIONS } from '../data/seed.js';
import { store } from '../state/store.js';
import { escapeHtml, formatRp, makeFallbackSvg } from '../utils/format.js';

export function renderStudioView(t) {
  const idx = store.ui.studioIdx;
  const h = STUDIO_OPTIONS.head[idx.head];
  const a = STUDIO_OPTIONS.attire[idx.attire];
  const c = STUDIO_OPTIONS.acc[idx.acc];
  const b = STUDIO_OPTIONS.bg[idx.bg];
  const total = h.price + a.price + c.price;

  return `
    <section class="view-panel" aria-labelledby="studioHeading">
      <div class="section-head">
        <div>
          <h2 id="studioHeading" class="section-title">${escapeHtml(t('studio_title'))}</h2>
          <p class="section-subtitle">${escapeHtml(t('studio_sub'))}</p>
        </div>
      </div>

      <div class="studio-grid">
        <div class="mannequin-stage">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:10px;">
            <span class="meta-line" style="margin:0;">
              <strong>Latar:</strong> ${escapeHtml(b.name.split('(')[0].trim())}
            </span>
            <button type="button" class="btn btn-secondary btn-sm" id="randomizeStudioBtn">Acak Paduan</button>
          </div>

          <svg width="100%" height="310" viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pratinjau visual paduan busana adat">
            <rect x="10" y="10" width="280" height="320" rx="16" fill="${b.sky}"/>
            <path d="M40 270 Q150 150 260 270 Z" fill="${b.hill}" opacity="0.6"/>
            <rect x="10" y="265" width="280" height="65" rx="8" fill="#064e3b" opacity="0.15"/>

            <circle cx="150" cy="105" r="24" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
            <path d="M124 105 C124 82 176 82 176 105 C178 130 168 142 150 142 C132 142 122 130 124 105 Z" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
            <circle cx="150" cy="107" r="16" fill="#fed7aa"/>

            <g>${h.svg}</g>
            <g>
              <path d="M115 144 L185 144 L196 212 L104 212 Z" fill="${a.color}" stroke="${a.trim}" stroke-width="2"/>
              <path d="M112 212 L188 212 L198 305 L102 305 Z" fill="${a.color}" stroke="${a.trim}" stroke-width="2"/>
              <line x1="150" y1="144" x2="150" y2="305" stroke="${a.trim}" stroke-width="2.5" stroke-dasharray="5 3"/>
              <polygon points="120,295 135,275 150,295 165,275 180,295" fill="none" stroke="${a.trim}" stroke-width="2"/>
            </g>
            <g>${c.svg}</g>
          </svg>

          <div class="studio-ref-grid">
            <div class="studio-ref-tile">
              <img
                src="${escapeHtml(a.photoUrl)}"
                alt="${escapeHtml(a.name)}"
                referrerpolicy="no-referrer"
                data-fallback-label="${escapeHtml(a.name)}"
                data-fallback-color="${a.color}"
              />
              <div>
                <div style="font-size:0.7rem; font-weight:700; color:var(--teal-700);">Referensi Busana</div>
                <div style="font-size:0.78rem; font-weight:700; color:var(--emerald-900);">${escapeHtml(a.name)}</div>
              </div>
            </div>
            <div class="studio-ref-tile">
              <img
                src="${escapeHtml(b.photoUrl)}"
                alt="${escapeHtml(b.name)}"
                referrerpolicy="no-referrer"
                data-fallback-label="${escapeHtml(b.name)}"
                data-fallback-color="#047857"
              />
              <div>
                <div style="font-size:0.7rem; font-weight:700; color:var(--gold-700);">Referensi Lokasi</div>
                <div style="font-size:0.78rem; font-weight:700; color:var(--emerald-900);">${escapeHtml(b.name.split('(')[0].trim())}</div>
              </div>
            </div>
          </div>

          <div style="margin-top:14px; padding-top:12px; border-top:1px dashed var(--border-strong); text-align:center;">
            <div style="font-size:0.84rem; color:var(--text-secondary);">Estimasi Total Sewa Set Paduan (Simulasi)</div>
            <div class="price-figure" style="font-size:1.3rem;">${escapeHtml(formatRp(total))}</div>
          </div>
        </div>

        <div class="card-static">
          <h3 class="card-title" style="margin-bottom:14px;">Pilih Komponen Busana &amp; Latar</h3>

          <div class="layer-row">
            <div>
              <div class="layer-kicker">1. Penutup Kepala / Mahkota</div>
              <div class="layer-name">${escapeHtml(h.name)}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);" class="tabular-nums">${escapeHtml(formatRp(h.price))}</div>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-secondary btn-sm" data-cycle="head" data-dir="-1" aria-label="Penutup kepala sebelumnya">◀</button>
              <button type="button" class="btn btn-secondary btn-sm" data-cycle="head" data-dir="1" aria-label="Penutup kepala berikutnya">▶</button>
            </div>
          </div>

          <div class="layer-row">
            <div>
              <div class="layer-kicker">2. Busana Utama (Pesisir / Gayo)</div>
              <div class="layer-name">${escapeHtml(a.name)}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);" class="tabular-nums">${escapeHtml(formatRp(a.price))}</div>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-secondary btn-sm" data-cycle="attire" data-dir="-1" aria-label="Busana sebelumnya">◀</button>
              <button type="button" class="btn btn-secondary btn-sm" data-cycle="attire" data-dir="1" aria-label="Busana berikutnya">▶</button>
            </div>
          </div>

          <div class="layer-row">
            <div>
              <div class="layer-kicker">3. Aksesori Pendamping</div>
              <div class="layer-name">${escapeHtml(c.name)}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);" class="tabular-nums">${escapeHtml(formatRp(c.price))}</div>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-secondary btn-sm" data-cycle="acc" data-dir="-1" aria-label="Aksesori sebelumnya">◀</button>
              <button type="button" class="btn btn-secondary btn-sm" data-cycle="acc" data-dir="1" aria-label="Aksesori berikutnya">▶</button>
            </div>
          </div>

          <div class="layer-row">
            <div>
              <div class="layer-kicker">4. Pratinjau Latar Spot Ikonik</div>
              <div class="layer-name">${escapeHtml(b.name)}</div>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-secondary btn-sm" data-cycle="bg" data-dir="-1" aria-label="Latar sebelumnya">◀</button>
              <button type="button" class="btn btn-secondary btn-sm" data-cycle="bg" data-dir="1" aria-label="Latar berikutnya">▶</button>
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:18px;">
            <button type="button" class="btn btn-primary" style="flex:1;" id="applyStudioBookingBtn">Gunakan Set Ini di Booking</button>
            <button type="button" class="btn btn-accent" id="saveStudioFavBtn">Simpan ke Favorit</button>
          </div>
          ${
            store.ui.studioNotice
              ? `<div class="alert alert-ok">${escapeHtml(store.ui.studioNotice)}</div>`
              : ''
          }
        </div>
      </div>
    </section>
  `;
}

export function bindStudioEvents(container) {
  container.querySelectorAll('img[data-fallback-label]').forEach((img) => {
    img.addEventListener('error', () => {
      img.src = makeFallbackSvg(
        img.getAttribute('data-fallback-label'),
        img.getAttribute('data-fallback-color')
      );
    });
  });

  container.querySelectorAll('[data-cycle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const layer = btn.getAttribute('data-cycle');
      const dir = Number(btn.getAttribute('data-dir'));
      const len = STUDIO_OPTIONS[layer].length;
      store.ui.studioIdx[layer] = (store.ui.studioIdx[layer] + dir + len) % len;
      store.ui.studioNotice = '';
      store.notify();
    });
  });

  container.querySelector('#randomizeStudioBtn').addEventListener('click', () => {
    store.ui.studioIdx = {
      head: Math.floor(Math.random() * STUDIO_OPTIONS.head.length),
      attire: Math.floor(Math.random() * STUDIO_OPTIONS.attire.length),
      acc: Math.floor(Math.random() * STUDIO_OPTIONS.acc.length),
      bg: Math.floor(Math.random() * STUDIO_OPTIONS.bg.length),
    };
    store.ui.studioNotice = '';
    store.notify();
  });

  container.querySelector('#applyStudioBookingBtn').addEventListener('click', () => {
    const idx = store.ui.studioIdx;
    const h = STUDIO_OPTIONS.head[idx.head];
    const a = STUDIO_OPTIONS.attire[idx.attire];
    const c = STUDIO_OPTIONS.acc[idx.acc];
    store.ui.bookingDraft.busanaId = a.id;
    store.ui.bookingDraft.notes = `Mix & Match: ${a.name} + ${h.name} + ${c.name}`;
    store.ui.lastCreatedBookingId = '';
    store.setView('booking');
  });

  container.querySelector('#saveStudioFavBtn').addEventListener('click', () => {
    const idx = store.ui.studioIdx;
    const h = STUDIO_OPTIONS.head[idx.head];
    const a = STUDIO_OPTIONS.attire[idx.attire];
    const uid = `MIX-${idx.head}${idx.attire}${idx.acc}`;
    const alreadyFav = store.state.favorites.some((f) => f.itemId === uid);
    store.ui.studioNotice = alreadyFav
      ? 'Kombinasi Mix & Match dihapus dari Daftar Favorit.'
      : 'Kombinasi Mix & Match berhasil disimpan ke Daftar Favorit.';
    store.toggleFavorite(uid, 'mixmatch', `Paduan: ${a.name} + ${h.name}`);
  });
}
