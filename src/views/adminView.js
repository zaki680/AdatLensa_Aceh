import { REGIONS } from '../data/seed.js';
import { store } from '../state/store.js';
import { compressImageFile, escapeHtml, formatRp, makeFallbackSvg } from '../utils/format.js';

export function renderAdminView(t) {
  const activeTab = store.ui.adminTab;
  const editingId = store.ui.adminEditingBusanaId;
  const editItem = editingId ? store.state.busana.find((b) => b.id === editingId) : null;
  const st = editItem?.stokPerUkuran || { S: 2, M: 3, L: 2, XL: 1 };

  return `
    <section class="view-panel" aria-labelledby="adminHeading">
      <div class="section-head">
        <div>
          <h2 id="adminHeading" class="section-title">${escapeHtml(t('admin_title'))}</h2>
          <p class="section-subtitle">${escapeHtml(t('admin_sub'))}</p>
        </div>
        <button type="button" class="btn btn-danger btn-sm" id="resetDemoBtn">Reset Data Demo</button>
      </div>

      <div class="segmented-pills" role="tablist">
        <button type="button" class="seg-btn ${activeTab === 'busana' ? 'active' : ''}" data-admin-tab="busana">
          Kelola Busana &amp; Stok Ukuran
        </button>
        <button type="button" class="seg-btn ${activeTab === 'spot' ? 'active' : ''}" data-admin-tab="spot">
          Kelola Spot Foto
        </button>
        <button type="button" class="seg-btn ${activeTab === 'bookings' ? 'active' : ''}" data-admin-tab="bookings">
          Status Pemesanan &amp; DP
        </button>
      </div>

      ${
        activeTab === 'busana'
          ? `
          <div class="card-static" style="margin-bottom:24px;">
            <h3 class="card-title" style="margin-bottom:14px;">
              ${editItem ? `Edit Busana: ${escapeHtml(editItem.nama)}` : 'Tambah Koleksi Busana Adat'}
            </h3>
            <form id="adminBusanaForm">
              <input type="hidden" id="admBusanaImgData" value="${escapeHtml(editItem?.imageUrl || '')}" />
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px;">
                <div class="form-field">
                  <label for="admBusanaNama">Nama Busana</label>
                  <input class="form-control" type="text" id="admBusanaNama" required value="${escapeHtml(editItem?.nama || '')}" placeholder="Contoh: Baju Linto Baro Marun" />
                </div>
                <div class="form-field">
                  <label for="admBusanaKat">Kategori</label>
                  <select class="form-control" id="admBusanaKat">
                    <option value="Busana Adat Aceh" ${editItem?.kategori === 'Busana Adat Aceh' ? 'selected' : ''}>Busana Adat Aceh</option>
                    <option value="Busana Kerawang Gayo" ${editItem?.kategori === 'Busana Kerawang Gayo' ? 'selected' : ''}>Busana Kerawang Gayo</option>
                    <option value="Aksesori Kepala" ${editItem?.kategori === 'Aksesori Kepala' ? 'selected' : ''}>Aksesori Kepala</option>
                  </select>
                </div>
                <div class="form-field">
                  <label for="admBusanaWil">Wilayah</label>
                  <select class="form-control" id="admBusanaWil">
                    ${REGIONS.map(
                      (r) =>
                        `<option value="${escapeHtml(r)}" ${editItem?.wilayah === r ? 'selected' : ''}>${escapeHtml(r)}</option>`
                    ).join('')}
                  </select>
                </div>
                <div class="form-field">
                  <label for="admBusanaHarga">Harga Sewa (Rp)</label>
                  <input class="form-control" type="number" id="admBusanaHarga" min="0" value="${editItem?.hargaSewa || 150000}" />
                </div>
                <div class="form-field">
                  <label for="admBusanaMitra">Mitra UMKM</label>
                  <input class="form-control" type="text" id="admBusanaMitra" value="${escapeHtml(editItem?.mitraUMKM || '')}" placeholder="Sanggar Cut Nyak" />
                </div>
                <div class="form-field">
                  <label for="admBusanaFile">Unggah Foto Busana (Opsional)</label>
                  <input class="form-control" type="file" id="admBusanaFile" accept="image/*" />
                  <div id="admImgPreview" style="margin-top:6px;">
                    ${
                      editItem?.imageUrl
                        ? `<img src="${escapeHtml(editItem.imageUrl)}" alt="Preview" style="width:88px; height:58px; object-fit:cover; border-radius:6px; border:1px solid var(--border-hairline);" />`
                        : ''
                    }
                  </div>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; background:var(--bg-subtle); padding:12px; border-radius:8px; margin-bottom:14px;">
                <div class="form-field" style="margin:0;"><label for="admStokS">Stok S</label><input class="form-control" type="number" id="admStokS" min="0" value="${st.S}" /></div>
                <div class="form-field" style="margin:0;"><label for="admStokM">Stok M</label><input class="form-control" type="number" id="admStokM" min="0" value="${st.M}" /></div>
                <div class="form-field" style="margin:0;"><label for="admStokL">Stok L</label><input class="form-control" type="number" id="admStokL" min="0" value="${st.L}" /></div>
                <div class="form-field" style="margin:0;"><label for="admStokXL">Stok XL</label><input class="form-control" type="number" id="admStokXL" min="0" value="${st.XL}" /></div>
              </div>

              <div class="form-field">
                <label for="admBusanaBooked">Tanggal Perawatan / Laundry (YYYY-MM-DD, pisahkan koma)</label>
                <input class="form-control" type="text" id="admBusanaBooked" value="${escapeHtml((editItem?.tanggalTerbooking || []).join(', '))}" placeholder="2026-11-30" />
              </div>

              <div style="display:flex; gap:10px;">
                <button type="submit" class="btn btn-primary btn-sm">Simpan Busana</button>
                ${editItem ? `<button type="button" class="btn btn-secondary btn-sm" id="cancelEditBusanaBtn">Batal Edit</button>` : ''}
              </div>
            </form>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Foto &amp; Nama Busana</th>
                  <th>Wilayah</th>
                  <th>Stok Per Ukuran</th>
                  <th>Harga Sewa</th>
                  <th>Rating</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${store.state.busana
                  .map((b) => {
                    const s = b.stokPerUkuran || { S: 0, M: 0, L: 0, XL: 0 };
                    const fallback = makeFallbackSvg(b.nama, b.warnaUtama);
                    return `
                      <tr>
                        <td>
                          <div style="display:flex; align-items:center; gap:10px;">
                            <img
                              src="${escapeHtml(b.imageUrl || fallback)}"
                              alt="${escapeHtml(b.nama)}"
                              referrerpolicy="no-referrer"
                              data-fallback-label="${escapeHtml(b.nama)}"
                              data-fallback-color="${escapeHtml(b.warnaUtama)}"
                              style="width:52px; height:38px; object-fit:cover; border-radius:6px; flex-shrink:0;"
                            />
                            <div>
                              <strong>${escapeHtml(b.nama)}</strong>
                              <div style="font-size:0.76rem; color:var(--text-muted);">${escapeHtml(b.mitraUMKM)}</div>
                            </div>
                          </div>
                        </td>
                        <td>${escapeHtml(b.wilayah)}</td>
                        <td class="mono">S:${s.S} · M:${s.M} · L:${s.L} · XL:${s.XL}</td>
                        <td class="tabular-nums">${escapeHtml(formatRp(b.hargaSewa))}</td>
                        <td class="tabular-nums">★ ${store.getAvgRating(b)} (${(b.reviews || []).length})</td>
                        <td>
                          <div style="display:flex; gap:6px;">
                            <button type="button" class="btn btn-secondary btn-sm" data-edit-busana="${escapeHtml(b.id)}">Edit</button>
                            <button type="button" class="btn btn-danger btn-sm" data-del-busana="${escapeHtml(b.id)}">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        `
          : ''
      }

      ${
        activeTab === 'spot'
          ? `
          <div class="card-static" style="margin-bottom:24px;">
            <h3 class="card-title" style="margin-bottom:14px;">Tambah Spot Foto Ikonik</h3>
            <form id="adminSpotForm">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px;">
                <div class="form-field">
                  <label for="admSpotNama">Nama Spot Foto</label>
                  <input class="form-control" type="text" id="admSpotNama" required placeholder="Contoh: Bukit Pantan Terong" />
                </div>
                <div class="form-field">
                  <label for="admSpotWil">Wilayah</label>
                  <select class="form-control" id="admSpotWil">
                    ${REGIONS.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-field">
                  <label for="admSpotTiket">Estimasi Tiket (Rp)</label>
                  <input class="form-control" type="number" id="admSpotTiket" min="0" value="10000" />
                </div>
                <div class="form-field">
                  <label for="admSpotIbadah">Fasilitas Ibadah</label>
                  <input class="form-control" type="text" id="admSpotIbadah" placeholder="Mushalla & tempat wudu 50m" />
                </div>
                <div class="form-field">
                  <label for="admSpotMuslim">Layanan Ramah Muslim</label>
                  <input class="form-control" type="text" id="admSpotMuslim" placeholder="Ruang ganti tertutup tersedia" />
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Tambah Spot Foto</button>
            </form>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama Spot</th>
                  <th>Wilayah</th>
                  <th>Estimasi Tiket</th>
                  <th>Fasilitas Ibadah</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${store.state.spots
                  .map(
                    (s) => `
                  <tr>
                    <td><strong>${escapeHtml(s.nama)}</strong></td>
                    <td>${escapeHtml(s.wilayah)}</td>
                    <td class="tabular-nums">${escapeHtml(formatRp(s.estimasiTiket))}</td>
                    <td>${escapeHtml(s.fasilitasIbadah)}</td>
                    <td>
                      <button type="button" class="btn btn-danger btn-sm" data-del-spot="${escapeHtml(s.id)}">Hapus</button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
          : ''
      }

      ${
        activeTab === 'bookings'
          ? `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kode Nota</th>
                  <th>Pemesan</th>
                  <th>Tanggal &amp; Slot</th>
                  <th>Ukuran</th>
                  <th>Status DP</th>
                  <th>Status Booking</th>
                </tr>
              </thead>
              <tbody>
                ${store.state.bookings
                  .map((bk, idx) => {
                    const isPaid = bk.paymentStatus && bk.paymentStatus.includes('Lunas');
                    return `
                      <tr>
                        <td class="mono"><strong>${escapeHtml(bk.kodeNota)}</strong></td>
                        <td>${escapeHtml(bk.namaPemesan)}</td>
                        <td>
                          <div>${escapeHtml(bk.tanggalKunjungan)}</div>
                          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(bk.slotWaktu)}</div>
                        </td>
                        <td>${escapeHtml(bk.ukuranBusana)} (${bk.jumlahPeserta} stel)</td>
                        <td>
                          <span class="status-tag ${isPaid ? 'status-ok' : 'status-warn'}">${escapeHtml(bk.paymentStatus || 'Belum DP')}</span>
                        </td>
                        <td>
                          <select class="form-control" data-booking-status-idx="${idx}" aria-label="Status booking ${escapeHtml(bk.kodeNota)}">
                            ${[
                              'Menunggu Pembayaran DP',
                              'Busana Siap & Terjadwal',
                              'Sesi Foto Berlangsung',
                              'Dijadwalkan Ulang (Cuaca)',
                              'Selesai',
                              'Dibatalkan',
                            ]
                              .map(
                                (stName) =>
                                  `<option value="${escapeHtml(stName)}" ${bk.statusBooking === stName ? 'selected' : ''}>${escapeHtml(stName)}</option>`
                              )
                              .join('')}
                          </select>
                        </td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        `
          : ''
      }
    </section>
  `;
}

export function bindAdminEvents(container) {
  container.querySelectorAll('img[data-fallback-label]').forEach((img) => {
    img.addEventListener('error', () => {
      img.src = makeFallbackSvg(
        img.getAttribute('data-fallback-label'),
        img.getAttribute('data-fallback-color')
      );
    });
  });

  container.querySelector('#resetDemoBtn').addEventListener('click', () => {
    store.resetDemoData();
  });

  container.querySelectorAll('[data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.ui.adminTab = btn.getAttribute('data-admin-tab');
      store.notify();
    });
  });

  const busanaForm = container.querySelector('#adminBusanaForm');
  if (busanaForm) {
    const fileInput = container.querySelector('#admBusanaFile');
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressed = await compressImageFile(file);
        container.querySelector('#admBusanaImgData').value = compressed;
        container.querySelector('#admImgPreview').innerHTML = `<img src="${compressed}" alt="Preview" style="width:88px; height:58px; object-fit:cover; border-radius:6px; border:1px solid var(--border-hairline);" />`;
      } catch {
        // Ignore invalid file read
      }
    });

    busanaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = store.ui.adminEditingBusanaId;
      const existing = id ? store.state.busana.find((b) => b.id === id) : null;
      const bookedRaw = container.querySelector('#admBusanaBooked').value.trim();
      const bookedArr = bookedRaw ? bookedRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const kat = container.querySelector('#admBusanaKat').value;

      store.saveBusana({
        id: id || 'BUS-' + Date.now(),
        nama: container.querySelector('#admBusanaNama').value.trim(),
        asalBudaya: kat.includes('Gayo') ? 'Dataran Tinggi Gayo' : 'Aceh Pesisir',
        kategori: kat,
        wilayah: container.querySelector('#admBusanaWil').value,
        deskripsi:
          existing?.deskripsi ||
          'Koleksi busana adat UMKM lokal dengan perawatan higienis dan siap pakai untuk sesi foto wisata.',
        filosofiMotif:
          existing?.filosofiMotif || 'Motif tradisional Aceh & Gayo yang mencerminkan keluhuran budaya.',
        warnaUtama: existing?.warnaUtama || '#064e3b',
        imageUrl:
          container.querySelector('#admBusanaImgData').value ||
          existing?.imageUrl ||
          'https://commons.wikimedia.org/wiki/Special:FilePath/Pakaian_Adat_Aceh_Wanita.jpg?width=640',
        stokPerUkuran: {
          S: Number(container.querySelector('#admStokS').value) || 0,
          M: Number(container.querySelector('#admStokM').value) || 0,
          L: Number(container.querySelector('#admStokL').value) || 0,
          XL: Number(container.querySelector('#admStokXL').value) || 0,
        },
        hargaSewa: Number(container.querySelector('#admBusanaHarga').value) || 150000,
        tanggalTerbooking: bookedArr,
        mitraUMKM: container.querySelector('#admBusanaMitra').value.trim() || 'Mitra UMKM Aceh (Simulasi)',
        kontakWA: existing?.kontakWA || '6281200009999',
        reviews: existing?.reviews || [],
      });
    });

    const cancelEditBtn = container.querySelector('#cancelEditBusanaBtn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        store.ui.adminEditingBusanaId = '';
        store.notify();
      });
    }
  }

  container.querySelectorAll('[data-edit-busana]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.ui.adminEditingBusanaId = btn.getAttribute('data-edit-busana');
      store.notify();
    });
  });

  container.querySelectorAll('[data-del-busana]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.deleteBusana(btn.getAttribute('data-del-busana'));
    });
  });

  const spotForm = container.querySelector('#adminSpotForm');
  if (spotForm) {
    spotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = container.querySelector('#admSpotNama').value.trim();
      const wil = container.querySelector('#admSpotWil').value;
      store.addSpot({
        id: 'SPOT-' + Date.now(),
        nama,
        wilayah: wil,
        kategoriSpot: 'Wisata Budaya & Alam',
        deskripsi: 'Destinasi wisata ikonik rekomendasi UMKM lokal untuk pemotretan berbusana adat.',
        alamat: `${nama}, ${wil}, Aceh`,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nama} ${wil} Aceh`)}`,
        imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Gunongan_Aceh_Sultanate,_diambil_5_May_2026.jpg?width=640',
        estimasiTiket: Number(container.querySelector('#admSpotTiket').value) || 0,
        fasilitasIbadah: container.querySelector('#admSpotIbadah').value.trim() || 'Mushalla terdekat tersedia',
        fasilitasRamahMuslim:
          container.querySelector('#admSpotMuslim').value.trim() || 'Ruang ganti Muslimah tersedia',
        waktuFotoTerbaik: '08.00 – 10.00 WIB & 16.30 – 18.00 WIB',
      });
    });
  }

  container.querySelectorAll('[data-del-spot]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.deleteSpot(btn.getAttribute('data-del-spot'));
    });
  });

  container.querySelectorAll('[data-booking-status-idx]').forEach((sel) => {
    sel.addEventListener('change', () => {
      store.updateBookingStatus(Number(sel.getAttribute('data-booking-status-idx')), sel.value);
    });
  });
}
