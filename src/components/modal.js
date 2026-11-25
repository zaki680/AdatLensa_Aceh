import { TIME_SLOTS } from '../data/seed.js';
import { store } from '../state/store.js';
import { escapeHtml, formatRp, makeFallbackSvg } from '../utils/format.js';

let modalBackdrop = null;
let modalDialog = null;

export function ensureModalMount() {
  if (modalBackdrop) return;
  modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.id = 'appModalBackdrop';
  modalBackdrop.setAttribute('role', 'dialog');
  modalBackdrop.setAttribute('aria-modal', 'true');

  modalDialog = document.createElement('div');
  modalDialog.className = 'modal-dialog';
  modalBackdrop.appendChild(modalDialog);
  document.body.appendChild(modalBackdrop);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

export function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('open');
  modalDialog.innerHTML = '';
}

function openModalWith(html, onReady) {
  ensureModalMount();
  modalDialog.innerHTML = html;
  modalBackdrop.classList.add('open');
  if (onReady) onReady(modalDialog);
}

export function openPhotoLightbox(imgUrl, title, subtitle, fallbackColor) {
  const safeFallback = makeFallbackSvg(title, fallbackColor);
  openModalWith(
    `
      <div style="text-align:center;">
        <img
          id="lightboxImg"
          src="${escapeHtml(imgUrl)}"
          alt="${escapeHtml(title)}"
          referrerpolicy="no-referrer"
          style="width:100%; max-height:360px; object-fit:cover; border-radius:8px; border:1px solid var(--border-hairline); margin-bottom:14px;"
        />
        <h3 style="font-family:var(--font-display); color:var(--emerald-900); margin-bottom:4px;">${escapeHtml(title)}</h3>
        <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:16px;">${escapeHtml(subtitle)}</p>
        <button type="button" class="btn btn-primary btn-sm" id="closeLightboxBtn">Tutup Pratinjau</button>
      </div>
    `,
    (el) => {
      const img = el.querySelector('#lightboxImg');
      img.addEventListener('error', () => {
        img.src = safeFallback;
      });
      el.querySelector('#closeLightboxBtn').addEventListener('click', closeModal);
    }
  );
}

export function openQrisModal(bookingId) {
  const bk = store.state.bookings.find((b) => b.id === bookingId);
  if (!bk) return;
  const dp = bk.dpAmount || Math.round(bk.totalAnggaran * 0.3);

  openModalWith(
    `
      <h3 style="font-family:var(--font-display); color:var(--emerald-900); margin-bottom:6px;">
        Pembayaran DP 30% via QRIS (Simulasi)
      </h3>
      <p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:14px;">
        Kode Nota: <strong class="mono">${escapeHtml(bk.kodeNota)}</strong> · Nominal DP:
        <strong class="tabular-nums">${escapeHtml(formatRp(dp))}</strong>
      </p>
      <div style="text-align:center; background:var(--bg-subtle); padding:18px; border-radius:10px; border:1px dashed var(--border-strong); margin-bottom:16px;">
        <svg width="150" height="150" viewBox="0 0 120 120" style="margin:0 auto;" aria-label="Kode QRIS Simulasi">
          <rect width="120" height="120" fill="#ffffff" stroke="#064e3b" stroke-width="2"/>
          <rect x="12" y="12" width="28" height="28" fill="none" stroke="#064e3b" stroke-width="4"/>
          <rect x="19" y="19" width="14" height="14" fill="#064e3b"/>
          <rect x="80" y="12" width="28" height="28" fill="none" stroke="#064e3b" stroke-width="4"/>
          <rect x="87" y="19" width="14" height="14" fill="#064e3b"/>
          <rect x="12" y="80" width="28" height="28" fill="none" stroke="#064e3b" stroke-width="4"/>
          <rect x="19" y="87" width="14" height="14" fill="#064e3b"/>
          <rect x="50" y="20" width="10" height="10" fill="#047857"/>
          <rect x="52" y="48" width="16" height="16" fill="#d97706"/>
          <rect x="48" y="75" width="12" height="12" fill="#064e3b"/>
          <rect x="75" y="55" width="14" height="14" fill="#064e3b"/>
          <rect x="82" y="82" width="18" height="18" fill="#047857"/>
        </svg>
        <div style="font-size:0.78rem; font-weight:700; color:var(--emerald-900); margin-top:8px;">
          QRIS ADATLENSA UMKM ACEH (SIMULASI)
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <button type="button" class="btn btn-primary" style="flex:1;" id="confirmQrisBtn">Konfirmasi DP Lunas</button>
        <button type="button" class="btn btn-secondary" id="cancelQrisBtn">Tutup</button>
      </div>
    `,
    (el) => {
      el.querySelector('#confirmQrisBtn').addEventListener('click', () => {
        store.confirmQrisPayment(bk.id);
        closeModal();
      });
      el.querySelector('#cancelQrisBtn').addEventListener('click', closeModal);
    }
  );
}

export function openRescheduleModal(bookingId) {
  const bk = store.state.bookings.find((b) => b.id === bookingId);
  if (!bk) return;

  openModalWith(
    `
      <h3 style="font-family:var(--font-display); color:var(--emerald-900); margin-bottom:6px;">
        Mitigasi Cuaca — Reschedule Sesi Foto
      </h3>
      <p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:14px;">
        Gratis 1x pindah jadwal jika terjadi hujan lebat di spot outdoor.
      </p>
      <div class="form-field">
        <label for="reschedDateInput">Pilih Tanggal Baru</label>
        <input class="form-control" type="date" id="reschedDateInput" value="${escapeHtml(bk.tanggalKunjungan)}" />
      </div>
      <div class="form-field">
        <label for="reschedSlotSelect">Pilih Slot Sesi Baru</label>
        <select class="form-control" id="reschedSlotSelect">
          ${TIME_SLOTS.map(
            (slot) =>
              `<option value="${escapeHtml(slot.value)}" ${bk.slotWaktu === slot.value ? 'selected' : ''}>${escapeHtml(slot.labelId)}</option>`
          ).join('')}
        </select>
      </div>
      <div id="reschedFeedback"></div>
      <div style="display:flex; gap:10px; margin-top:14px;">
        <button type="button" class="btn btn-primary" style="flex:1;" id="saveReschedBtn">Simpan Jadwal Baru</button>
        <button type="button" class="btn btn-secondary" id="cancelReschedBtn">Batal</button>
      </div>
    `,
    (el) => {
      el.querySelector('#saveReschedBtn').addEventListener('click', () => {
        const newDate = el.querySelector('#reschedDateInput').value;
        const newSlot = el.querySelector('#reschedSlotSelect').value;
        const res = store.rescheduleBooking(bk.id, newDate, newSlot);
        if (!res.ok) {
          el.querySelector('#reschedFeedback').innerHTML = `<div class="alert alert-err">${escapeHtml(res.message)}</div>`;
          return;
        }
        closeModal();
      });
      el.querySelector('#cancelReschedBtn').addEventListener('click', closeModal);
    }
  );
}

export function openReviewModal(bookingId) {
  const bk = store.state.bookings.find((b) => b.id === bookingId);
  if (!bk) return;

  openModalWith(
    `
      <h3 style="font-family:var(--font-display); color:var(--emerald-900); margin-bottom:6px;">
        Beri Rating &amp; Ulasan Sesi Wisata
      </h3>
      <p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:14px;">
        Bagikan pengalaman Anda mengenai kebersihan busana adat dan layanan fotografer.
      </p>
      <div class="form-field">
        <label for="reviewStarsSelect">Penilaian Bintang</label>
        <select class="form-control" id="reviewStarsSelect">
          <option value="5">5.0 — Sangat Memuaskan</option>
          <option value="4.8">4.8 — Memuaskan</option>
          <option value="4">4.0 — Baik</option>
        </select>
      </div>
      <div class="form-field">
        <label for="reviewCommentArea">Ulasan Anda</label>
        <textarea class="form-control" id="reviewCommentArea" rows="3" placeholder="Contoh: Busana harum, MUA Syar'i ramah, dan hasil foto sangat estetik!"></textarea>
      </div>
      <div style="display:flex; gap:10px; margin-top:12px;">
        <button type="button" class="btn btn-accent" style="flex:1;" id="submitReviewBtn">Kirim Ulasan</button>
        <button type="button" class="btn btn-secondary" id="cancelReviewBtn">Batal</button>
      </div>
    `,
    (el) => {
      el.querySelector('#submitReviewBtn').addEventListener('click', () => {
        const stars = el.querySelector('#reviewStarsSelect').value;
        const comment = el.querySelector('#reviewCommentArea').value;
        store.submitReview(bk.id, stars, comment);
        closeModal();
      });
      el.querySelector('#cancelReviewBtn').addEventListener('click', closeModal);
    }
  );
}
