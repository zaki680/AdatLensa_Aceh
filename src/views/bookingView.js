import { openQrisModal } from '../components/modal.js';
import { SIZE_CHART, TIME_SLOTS } from '../data/seed.js';
import { store } from '../state/store.js';
import { escapeHtml, formatRp } from '../utils/format.js';

export function renderBookingView(t) {
  const draft = store.ui.bookingDraft;
  const defaultName =
    draft.namaPemesan || (store.currentUser ? store.currentUser.name : 'Tamu Wisatawan Aceh');
  const busanaList = store.state.busana;
  const spotsList = store.state.spots;
  const pkgsList = store.state.photoPackages;

  const selectedBusanaId = draft.busanaId || (busanaList[0] ? busanaList[0].id : '');
  const selectedSpotId = draft.spotId || (spotsList[0] ? spotsList[0].id : '');
  const selectedPkgId = draft.pkgId || (pkgsList[0] ? pkgsList[0].id : '');
  const selectedDate = draft.dateVal || '2026-11-26';
  const selectedSize = draft.sizeVal || 'M';
  const selectedSlot = draft.slotVal || TIME_SLOTS[0].value;
  const selectedPax = draft.pax || 1;

  const lastCreated = store.ui.lastCreatedBookingId
    ? store.state.bookings.find((b) => b.id === store.ui.lastCreatedBookingId)
    : null;

  const createdBannerHtml = lastCreated
    ? `
      <div class="alert alert-ok">
        Booking tersimpan dengan kode nota <strong class="mono">${escapeHtml(lastCreated.kodeNota)}</strong>.
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
          <button type="button" class="btn btn-accent btn-sm" id="payQrisNowBtn">
            Bayar DP 30% (${escapeHtml(formatRp(lastCreated.dpAmount))})
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="goToMyBookingsBtn">
            Lihat di Pesanan Saya →
          </button>
        </div>
      </div>
    `
    : '';

  return `
    <section class="view-panel" aria-labelledby="bookingHeading">
      <div class="section-head">
        <div>
          <h2 id="bookingHeading" class="section-title">${escapeHtml(t('book_title'))}</h2>
          <p class="section-subtitle">${escapeHtml(t('book_sub'))}</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card-static">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:14px;">
            <h3 class="card-title" style="margin:0;">Formulir Pemesanan &amp; Cek Stok Sesi</h3>
            <button type="button" class="btn btn-secondary btn-sm" id="toggleSizeChartBtn">Panduan Ukuran</button>
          </div>

          <div id="sizeChartDrawer" style="display:none; margin-bottom:16px;" class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ukuran</th>
                  <th>Lingkar Dada</th>
                  <th>Panjang Baju</th>
                  <th>Tinggi Badan</th>
                </tr>
              </thead>
              <tbody>
                ${SIZE_CHART.map(
                  (row) => `
                  <tr>
                    <td><strong>${row.size}</strong></td>
                    <td>${row.chest}</td>
                    <td>${row.length}</td>
                    <td>${row.height}</td>
                  </tr>
                `
                ).join('')}
              </tbody>
            </table>
          </div>

          <div class="form-field">
            <label for="bookName">Nama Pemesan</label>
            <input class="form-control" type="text" id="bookName" value="${escapeHtml(defaultName)}" placeholder="Contoh: Nadia Putri" />
          </div>

          <div class="form-field">
            <label for="bookBusana">Pilih Koleksi Busana Adat</label>
            <select class="form-control" id="bookBusana">
              ${busanaList
                .map(
                  (b) => `
                <option value="${escapeHtml(b.id)}" ${b.id === selectedBusanaId ? 'selected' : ''}>
                  ${escapeHtml(b.nama)} (${escapeHtml(b.wilayah)}) — ${escapeHtml(formatRp(b.hargaSewa))}
                </option>
              `
                )
                .join('')}
            </select>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-field">
              <label for="bookDate">Tanggal Kunjungan</label>
              <input class="form-control" type="date" id="bookDate" value="${escapeHtml(selectedDate)}" />
            </div>
            <div class="form-field">
              <label for="bookSize">Ukuran Busana</label>
              <select class="form-control" id="bookSize">
                ${['S', 'M', 'L', 'XL']
                  .map(
                    (sz) =>
                      `<option value="${sz}" ${selectedSize === sz ? 'selected' : ''}>${sz}</option>`
                  )
                  .join('')}
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1.35fr 0.65fr; gap:12px;">
            <div class="form-field">
              <label for="bookSlot">Slot Waktu Sesi Foto</label>
              <select class="form-control" id="bookSlot">
                ${TIME_SLOTS.map(
                  (s) =>
                    `<option value="${escapeHtml(s.value)}" ${selectedSlot === s.value ? 'selected' : ''}>${escapeHtml(store.lang === 'id' ? s.labelId : s.labelEn)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-field">
              <label for="bookPax">Jumlah Stel</label>
              <input class="form-control" type="number" id="bookPax" min="1" max="10" value="${selectedPax}" />
            </div>
          </div>

          <div id="availabilityFeedback" aria-live="polite"></div>

          <div class="form-field" style="margin-top:14px;">
            <label for="bookSpot">Pilih Spot Foto Ikonik</label>
            <select class="form-control" id="bookSpot">
              ${spotsList
                .map(
                  (s) => `
                <option value="${escapeHtml(s.id)}" ${s.id === selectedSpotId ? 'selected' : ''}>
                  ${escapeHtml(s.nama)} (${escapeHtml(s.wilayah)}) — Tiket Est. ${escapeHtml(formatRp(s.estimasiTiket))}
                </option>
              `
                )
                .join('')}
            </select>
          </div>

          <div class="form-field">
            <label for="bookPhotoPkg">Paket Fotografer &amp; MUA Syar'i (1–2 Jam)</label>
            <select class="form-control" id="bookPhotoPkg">
              ${pkgsList
                .map(
                  (p) => `
                <option value="${escapeHtml(p.id)}" ${p.id === selectedPkgId ? 'selected' : ''}>
                  ${escapeHtml(p.namaPaket)} — ${escapeHtml(formatRp(p.hargaPaket))}
                </option>
              `
                )
                .join('')}
            </select>
          </div>

          <div class="form-field" style="margin-bottom:0;">
            <label for="bookNotes">Catatan Mix &amp; Match / Kebutuhan Hijab Syar'i</label>
            <input
              class="form-control"
              type="text"
              id="bookNotes"
              value="${escapeHtml(draft.notes || '')}"
              placeholder="Contoh: Pakai Sunting Aceh + ruang ganti Muslimah"
            />
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
          <div class="card-static" style="border-color:var(--emerald-700);">
            <h3 class="card-title" style="margin-bottom:12px;">Rincian Estimasi Anggaran &amp; DP (Simulasi)</h3>
            <div id="costBreakdown" style="font-size:0.88rem; color:var(--text-secondary); line-height:1.8;"></div>
            <hr style="margin:14px 0; border:none; border-top:1px solid var(--border-hairline);" />
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700;">Total Estimasi Biaya</span>
              <span class="price-figure" style="font-size:1.22rem;" id="bookingTotalDisplay">Rp 0</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; color:var(--gold-700);">
              <span style="font-weight:700; font-size:0.86rem;">Uang Muka (DP 30% via QRIS)</span>
              <strong class="tabular-nums" id="bookingDpDisplay">Rp 0</strong>
            </div>
            <p style="font-size:0.76rem; color:var(--text-muted); margin-top:6px;">
              Gratis reschedule 1x jika hujan deras di lokasi outdoor.
            </p>

            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:16px;">
              <button type="button" class="btn btn-primary" style="flex:1;" id="submitBookingBtn">
                Simpan Booking &amp; Lanjut QRIS
              </button>
              <a id="waCheckoutLink" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
                Checkout WhatsApp
              </a>
            </div>
            <div id="bookingCreatedAlert">${createdBannerHtml}</div>
          </div>

          <div class="card-static">
            <h3 class="card-title" style="margin-bottom:6px;">Lacak Status Booking</h3>
            <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:12px;">
              Masukkan kode nota (contoh: <strong class="mono">#ADL-1024</strong>) untuk memeriksa status terbaru.
            </p>
            <div style="display:flex; gap:8px;">
              <input
                class="form-control mono"
                type="text"
                id="trackCodeInput"
                value="${escapeHtml(lastCreated ? lastCreated.kodeNota : '')}"
                placeholder="#ADL-1024"
                style="flex:1;"
              />
              <button type="button" class="btn btn-accent" id="trackBtn">Lacak</button>
            </div>
            <div id="trackResultBox"></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function bindBookingEvents(container) {
  const toggleBtn = container.querySelector('#toggleSizeChartBtn');
  const sizeDrawer = container.querySelector('#sizeChartDrawer');
  toggleBtn.addEventListener('click', () => {
    sizeDrawer.style.display = sizeDrawer.style.display === 'none' ? 'block' : 'none';
  });

  const busanaSel = container.querySelector('#bookBusana');
  const spotSel = container.querySelector('#bookSpot');
  const pkgSel = container.querySelector('#bookPhotoPkg');
  const dateInput = container.querySelector('#bookDate');
  const sizeSel = container.querySelector('#bookSize');
  const slotSel = container.querySelector('#bookSlot');
  const paxInput = container.querySelector('#bookPax');
  const nameInput = container.querySelector('#bookName');
  const notesInput = container.querySelector('#bookNotes');

  const computeAndRender = () => {
    const busana = store.state.busana.find((b) => b.id === busanaSel.value) || store.state.busana[0];
    const spot = store.state.spots.find((s) => s.id === spotSel.value) || store.state.spots[0];
    const pkg = store.state.photoPackages.find((p) => p.id === pkgSel.value) || store.state.photoPackages[0];
    const dateVal = dateInput.value;
    const sizeVal = sizeSel.value;
    const slotVal = slotSel.value;
    const pax = Math.max(1, Number(paxInput.value) || 1);

    store.ui.bookingDraft = {
      busanaId: busana.id,
      spotId: spot.id,
      pkgId: pkg.id,
      notes: notesInput.value,
      dateVal,
      sizeVal,
      slotVal,
      pax,
      namaPemesan: nameInput.value,
    };

    const fb = container.querySelector('#availabilityFeedback');
    const remaining = store.getAvailableStockForSlot(busana, sizeVal, dateVal, slotVal);
    const isAvailable = remaining >= pax;

    if (busana.tanggalTerbooking && busana.tanggalTerbooking.includes(dateVal)) {
      fb.innerHTML = `<div class="alert alert-err">Pada tanggal <strong>${escapeHtml(dateVal)}</strong> koleksi ini sedang dalam jadwal perawatan/laundry UMKM. Silakan pilih tanggal lain.</div>`;
    } else if (remaining === 0) {
      const altSizes = Object.keys(busana.stokPerUkuran || {}).filter(
        (sz) => store.getAvailableStockForSlot(busana, sz, dateVal, slotVal) > 0
      );
      fb.innerHTML = `<div class="alert alert-err">Stok ukuran <strong>${escapeHtml(sizeVal)}</strong> penuh pada <strong>${escapeHtml(dateVal)}</strong> (${escapeHtml(slotVal)}). ${
        altSizes.length
          ? `Ukuran tersedia di slot ini: <strong>${escapeHtml(altSizes.join(', '))}</strong>.`
          : 'Silakan pilih slot waktu atau tanggal lain.'
      }</div>`;
    } else if (remaining < pax) {
      fb.innerHTML = `<div class="alert alert-err">Sisa stok ukuran <strong>${escapeHtml(sizeVal)}</strong> hanya <strong>${remaining} stel</strong> (dibutuhkan ${pax}).</div>`;
    } else {
      fb.innerHTML = `<div class="alert alert-ok">Tersedia — Sisa stok ukuran <strong>${escapeHtml(sizeVal)}</strong>: <strong>${remaining} stel</strong> pada ${escapeHtml(dateVal)} (${escapeHtml(slotVal)}).</div>`;
    }

    const sewaTotal = busana.hargaSewa * pax;
    const tiketTotal = spot.estimasiTiket * pax;
    const grandTotal = sewaTotal + tiketTotal + pkg.hargaPaket;
    const dpAmount = Math.round(grandTotal * 0.3);

    container.querySelector('#costBreakdown').innerHTML = `
      <div>· Sewa Busana (${pax}x ${escapeHtml(busana.nama)} · Uk. ${escapeHtml(sizeVal)}): <strong class="tabular-nums">${escapeHtml(formatRp(sewaTotal))}</strong></div>
      <div>· Paket Fotografer (${escapeHtml(pkg.namaPaket)}): <strong class="tabular-nums">${escapeHtml(formatRp(pkg.hargaPaket))}</strong></div>
      <div>· Estimasi Tiket Spot (${pax}x ${escapeHtml(spot.nama)}): <strong class="tabular-nums">${escapeHtml(formatRp(tiketTotal))}</strong></div>
      <div style="font-size:0.8rem; color:var(--teal-700); margin-top:4px;">Ibadah: ${escapeHtml(spot.fasilitasIbadah)}</div>
    `;
    container.querySelector('#bookingTotalDisplay').textContent = formatRp(grandTotal);
    container.querySelector('#bookingDpDisplay').textContent = formatRp(dpAmount);

    const pemesan = nameInput.value || 'Wisatawan';
    const waText = encodeURIComponent(
      `Halo ${busana.mitraUMKM}, saya *${pemesan}* ingin konfirmasi booking via *AdatLensa Aceh*:\n` +
        `• Busana: ${busana.nama} (Ukuran ${sizeVal}, ${pax} stel)\n` +
        `• Tanggal & Sesi: ${dateVal} | ${slotVal}\n` +
        `• Spot Foto: ${spot.nama}\n` +
        `• Paket Foto: ${pkg.namaPaket}\n` +
        `• Catatan: ${notesInput.value || '-'}\n` +
        `• Total: ${formatRp(grandTotal)} (DP 30%: ${formatRp(dpAmount)})\n` +
        `*(Pesan Simulasi Demo)*`
    );
    container.querySelector('#waCheckoutLink').href = `https://wa.me/${busana.kontakWA}?text=${waText}`;

    return {
      isAvailable,
      busanaId: busana.id,
      busanaNama: busana.nama,
      spotId: spot.id,
      pkgId: pkg.id,
      dateVal,
      sizeVal,
      slotVal,
      pax,
      grandTotal,
      dpAmount,
    };
  };

  [busanaSel, spotSel, pkgSel, dateInput, sizeSel, slotSel, paxInput, nameInput, notesInput].forEach(
    (el) => {
      el.addEventListener('change', computeAndRender);
      el.addEventListener('input', computeAndRender);
    }
  );

  computeAndRender();

  const qrisNowBtn = container.querySelector('#payQrisNowBtn');
  if (qrisNowBtn && store.ui.lastCreatedBookingId) {
    qrisNowBtn.addEventListener('click', () => openQrisModal(store.ui.lastCreatedBookingId));
  }
  const goMyBookingsBtn = container.querySelector('#goToMyBookingsBtn');
  if (goMyBookingsBtn) {
    goMyBookingsBtn.addEventListener('click', () => store.setView('mybookings'));
  }

  container.querySelector('#submitBookingBtn').addEventListener('click', () => {
    const info = computeAndRender();
    const alertBox = container.querySelector('#bookingCreatedAlert');
    if (!info.isAvailable) {
      alertBox.innerHTML = `<div class="alert alert-err">Pemesanan belum dapat diproses karena stok ukuran pada tanggal &amp; slot tersebut tidak mencukupi.</div>`;
      return;
    }
    const created = store.createBooking({
      ...info,
      namaPemesan: nameInput.value.trim() || 'Wisatawan',
      notes: notesInput.value.trim(),
    });
    store.ui.lastCreatedBookingId = created.id;
    store.notify();
  });

  container.querySelector('#trackBtn').addEventListener('click', () => {
    const code = container.querySelector('#trackCodeInput').value.trim().toUpperCase();
    const found = store.state.bookings.find((b) => b.kodeNota.toUpperCase() === code);
    const box = container.querySelector('#trackResultBox');
    if (!found) {
      box.innerHTML = `<div class="alert alert-err">Kode nota <strong>${escapeHtml(code)}</strong> tidak ditemukan. Coba gunakan <strong>#ADL-1024</strong>.</div>`;
      return;
    }
    box.innerHTML = `
      <div class="alert alert-info">
        <div><strong>Kode Nota:</strong> <span class="mono">${escapeHtml(found.kodeNota)}</span> · ${escapeHtml(found.namaPemesan)}</div>
        <div><strong>Jadwal:</strong> ${escapeHtml(found.tanggalKunjungan)} · ${escapeHtml(found.slotWaktu)}</div>
        <div><strong>Detail:</strong> Ukuran ${escapeHtml(found.ukuranBusana)} (${found.jumlahPeserta} stel) — <span class="tabular-nums">${escapeHtml(formatRp(found.totalAnggaran))}</span></div>
        <div style="margin-top:6px;">
          <span class="status-tag status-ok">${escapeHtml(found.statusBooking)}</span>
          <span class="status-tag status-info">${escapeHtml(found.paymentStatus)}</span>
        </div>
      </div>
    `;
  });
}
