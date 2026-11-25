import { openQrisModal, openRescheduleModal, openReviewModal } from '../components/modal.js';
import { store } from '../state/store.js';
import { escapeHtml, formatRp } from '../utils/format.js';

export function renderMyBookingsView(t) {
  const user = store.currentUser;

  if (!user) {
    return `
      <section class="view-panel" aria-labelledby="mybHeading">
        <div class="section-head">
          <div>
            <h2 id="mybHeading" class="section-title">${escapeHtml(t('myb_title'))}</h2>
            <p class="section-subtitle">${escapeHtml(t('myb_sub'))}</p>
          </div>
        </div>
        <div class="card-static" style="text-align:center; padding:36px 24px;">
          <h3 class="card-title" style="margin-bottom:8px;">Masuk untuk Melihat Riwayat Pesanan</h3>
          <p style="font-size:0.9rem; color:var(--text-secondary); max-width:52ch; margin:0 auto 18px;">
            Masuk menggunakan akun Wisatawan untuk membayar DP QRIS simulasi, mengajukan reschedule cuaca hujan, dan memberi ulasan.
          </p>
          <button type="button" class="btn btn-primary" data-nav="login">Masuk / Daftar Sekarang</button>
        </div>
      </section>
    `;
  }

  const myList = store.state.bookings.filter(
    (bk) =>
      bk.userEmail === user.email ||
      (user.role === 'wisatawan' && bk.userEmail === 'guest@adatlensa.id') ||
      user.role === 'admin'
  );

  return `
    <section class="view-panel" aria-labelledby="mybHeading">
      <div class="section-head">
        <div>
          <h2 id="mybHeading" class="section-title">${escapeHtml(t('myb_title'))}</h2>
          <p class="section-subtitle">${escapeHtml(t('myb_sub'))}</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-nav="booking">+ Buat Pesanan Baru</button>
      </div>

      ${
        myList.length === 0
          ? `<div class="alert alert-info">Belum ada pesanan atas nama <strong>${escapeHtml(user.name)}</strong>.</div>`
          : `
          <div class="grid-2">
            ${myList
              .map((bk) => {
                const busana = store.state.busana.find((b) => b.id === bk.idBusana);
                const spot = store.state.spots.find((s) => s.id === bk.idSpotFoto);
                const isDpPaid = bk.paymentStatus && bk.paymentStatus.includes('Lunas');
                const dp = bk.dpAmount || Math.round(bk.totalAnggaran * 0.3);

                return `
                  <article class="card">
                    <div>
                      <div class="meta-line" style="justify-content:space-between;">
                        <strong class="mono">${escapeHtml(bk.kodeNota)}</strong>
                        <span class="status-tag ${isDpPaid ? 'status-ok' : 'status-warn'}">${escapeHtml(bk.paymentStatus)}</span>
                      </div>
                      <h3 class="card-title">${escapeHtml(busana ? busana.nama : 'Koleksi Busana Adat')}</h3>
                      <div class="card-details">
                        <div><strong>Jadwal:</strong> ${escapeHtml(bk.tanggalKunjungan)} · ${escapeHtml(bk.slotWaktu)}</div>
                        <div><strong>Spot Foto:</strong> ${escapeHtml(spot ? spot.nama : '-')}</div>
                        <div><strong>Ukuran &amp; Jumlah:</strong> Uk. ${escapeHtml(bk.ukuranBusana)} (${bk.jumlahPeserta} stel)</div>
                        <div><strong>Catatan:</strong> ${escapeHtml(bk.pilihanMixMatch)}</div>
                        <div>
                          <strong>Total:</strong> <span class="tabular-nums">${escapeHtml(formatRp(bk.totalAnggaran))}</span>
                          (DP 30%: <strong class="tabular-nums">${escapeHtml(formatRp(dp))}</strong>)
                        </div>
                        <div style="margin-top:4px;">
                          <span class="status-tag status-info">${escapeHtml(bk.statusBooking)}</span>
                        </div>
                      </div>
                    </div>

                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                      ${
                        !isDpPaid
                          ? `<button type="button" class="btn btn-accent btn-sm" data-pay-qris="${escapeHtml(bk.id)}">Bayar DP QRIS</button>`
                          : ''
                      }
                      <button type="button" class="btn btn-secondary btn-sm" data-reschedule="${escapeHtml(bk.id)}">Reschedule Cuaca</button>
                      ${
                        !bk.reviewed
                          ? `<button type="button" class="btn btn-primary btn-sm" data-review="${escapeHtml(bk.id)}">Beri Ulasan</button>`
                          : `<span class="status-tag status-ok">Sudah Diulas</span>`
                      }
                    </div>
                  </article>
                `;
              })
              .join('')}
          </div>
        `
      }
    </section>
  `;
}

export function bindMyBookingsEvents(container) {
  container.querySelectorAll('[data-pay-qris]').forEach((btn) => {
    btn.addEventListener('click', () => openQrisModal(btn.getAttribute('data-pay-qris')));
  });
  container.querySelectorAll('[data-reschedule]').forEach((btn) => {
    btn.addEventListener('click', () => openRescheduleModal(btn.getAttribute('data-reschedule')));
  });
  container.querySelectorAll('[data-review]').forEach((btn) => {
    btn.addEventListener('click', () => openReviewModal(btn.getAttribute('data-review')));
  });
}
