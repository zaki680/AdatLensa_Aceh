import { DEFAULT_DATA, DEFAULT_USERS } from '../data/seed.js';

const STORAGE_KEYS = {
  DATA: 'adatlensa_aceh_v3',
  USERS: 'adatlensa_users_v1',
  SESSION: 'adatlensa_session_v1',
  LANG: 'adatlensa_lang',
  BANNER: 'adatlensa_banner_dismissed',
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const initialSession = safeParse(localStorage.getItem(STORAGE_KEYS.SESSION), null);

export const store = {
  state: safeParse(localStorage.getItem(STORAGE_KEYS.DATA), clone(DEFAULT_DATA)),
  users: safeParse(localStorage.getItem(STORAGE_KEYS.USERS), clone(DEFAULT_USERS)),
  currentUser: initialSession,
  lang: localStorage.getItem(STORAGE_KEYS.LANG) || 'id',
  bannerDismissed: localStorage.getItem(STORAGE_KEYS.BANNER) === '1',

  ui: {
    activeView: initialSession ? 'home' : 'login',
    intendedView: 'home',
    selectedMapRegion: 'Banda Aceh',
    studioIdx: { head: 0, attire: 0, acc: 0, bg: 0 },
    studioNotice: '',
    authNotice: '',
    lastCreatedBookingId: '',
    bookingDraft: {
      busanaId: '',
      spotId: '',
      pkgId: '',
      notes: '',
      dateVal: '2026-11-26',
      sizeVal: 'M',
      slotVal: '08:00 - 09:30 WIB (Pagi Cerah)',
      pax: 1,
      namaPemesan: '',
    },
    catalogFilters: {
      search: '',
      region: 'Semua',
      category: 'Semua',
      size: 'Semua',
      sort: 'default',
    },
    recFilters: {
      type: 'Semua',
      region: 'Semua',
      budget: 99999999,
    },
    adminTab: 'busana',
    adminEditingBusanaId: '',
  },

  listeners: new Set(),

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },

  notify() {
    this.listeners.forEach((fn) => fn());
  },

  persist() {
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(this.state));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    localStorage.setItem(STORAGE_KEYS.LANG, this.lang);
  },

  dismissBanner() {
    this.bannerDismissed = true;
    localStorage.setItem(STORAGE_KEYS.BANNER, '1');
    this.notify();
  },

  toggleLang() {
    this.lang = this.lang === 'id' ? 'en' : 'id';
    this.persist();
    document.documentElement.lang = this.lang;
    this.notify();
  },

  setView(viewName) {
    if (!this.currentUser) {
      if (viewName && viewName !== 'login') {
        this.ui.intendedView = viewName;
      }
      if (viewName === 'admin') {
        this.ui.authNotice =
          this.lang === 'id'
            ? 'Silakan masuk sebagai Admin / Mitra UMKM untuk mengakses Dashboard Admin.'
            : 'Please sign in as Admin / MSME Partner to access the Admin Dashboard.';
      } else {
        this.ui.authNotice = '';
      }
      this.ui.activeView = 'login';
    } else if (viewName === 'admin' && this.currentUser.role !== 'admin') {
      this.ui.intendedView = 'admin';
      this.ui.authNotice =
        this.lang === 'id'
          ? 'Akses Dashboard Admin UMKM memerlukan akun dengan peran Admin / Mitra UMKM. Gunakan pintasan Demo Admin UMKM di bawah.'
          : 'MSME Admin Dashboard requires an Admin / MSME Partner account. Use the Demo Admin shortcut below.';
      this.ui.activeView = 'login';
    } else if (viewName === 'login' && !this.ui.authNotice) {
      this.ui.activeView = 'home';
    } else {
      this.ui.authNotice = '';
      this.ui.activeView = viewName;
    }

    if (window.location.hash !== `#${this.ui.activeView}`) {
      window.history.replaceState(null, '', `#${this.ui.activeView}`);
    }
    this.notify();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  resolvePostLoginView(role) {
    const target = this.ui.intendedView || 'home';
    this.ui.intendedView = 'home';
    if (target === 'login') return 'home';
    if (target === 'admin' && role !== 'admin') return 'home';
    return target;
  },

  login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const found = this.users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    if (!found) return { ok: false };
    this.currentUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    };
    this.ui.authNotice = '';
    this.persist();
    this.setView(this.resolvePostLoginView(found.role));
    return { ok: true, user: this.currentUser };
  },

  register({ name, email, role, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const safeRole = role === 'admin' ? 'admin' : 'wisatawan';
    if (this.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, reason: 'duplicate' };
    }
    const newUser = {
      id: 'USR-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password,
      role: safeRole,
    };
    this.users.push(newUser);
    this.currentUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    this.ui.authNotice = '';
    this.persist();
    this.setView(this.resolvePostLoginView(safeRole));
    return { ok: true, user: this.currentUser };
  },

  quickDemoLogin(role) {
    const demo = this.users.find((u) => u.role === role) || DEFAULT_USERS[0];
    this.currentUser = {
      id: demo.id,
      name: demo.name,
      email: demo.email,
      role: demo.role,
    };
    this.ui.authNotice = '';
    this.persist();
    this.setView(this.resolvePostLoginView(demo.role));
  },

  logout() {
    this.currentUser = null;
    this.ui.intendedView = 'home';
    this.ui.authNotice = '';
    this.persist();
    this.setView('login');
  },

  getAvgRating(busanaObj) {
    if (!busanaObj?.reviews || busanaObj.reviews.length === 0) return '4.9';
    const sum = busanaObj.reviews.reduce((a, b) => a + Number(b.rating), 0);
    return (sum / busanaObj.reviews.length).toFixed(1);
  },

  getAvailableStockForSlot(busana, sizeVal, dateVal, slotVal, excludeBookingId = null) {
    if (!busana || !busana.stokPerUkuran) return 0;
    if (busana.tanggalTerbooking && busana.tanggalTerbooking.includes(dateVal)) {
      return 0;
    }
    const baseStock = Number(busana.stokPerUkuran[sizeVal] || 0);
    const usedStock = this.state.bookings
      .filter(
        (bk) =>
          bk.id !== excludeBookingId &&
          bk.idBusana === busana.id &&
          bk.ukuranBusana === sizeVal &&
          bk.tanggalKunjungan === dateVal &&
          bk.slotWaktu === slotVal &&
          bk.statusBooking !== 'Dibatalkan'
      )
      .reduce((sum, bk) => sum + Number(bk.jumlahPeserta || 1), 0);
    return Math.max(0, baseStock - usedStock);
  },

  toggleFavorite(itemId, tipeItem, titleLabel) {
    const idx = this.state.favorites.findIndex((f) => f.itemId === itemId);
    if (idx >= 0) {
      this.state.favorites.splice(idx, 1);
      this.persist();
      this.notify();
      return false;
    }
    this.state.favorites.push({
      id: 'FAV-' + Date.now(),
      itemId,
      tipeItem,
      titleLabel: titleLabel || itemId,
      tanggalDitambahkan: new Date().toLocaleDateString('id-ID'),
    });
    this.persist();
    this.notify();
    return true;
  },

  createBooking(payload) {
    const code = '#ADL-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: 'BK-' + Date.now(),
      kodeNota: code,
      userEmail: this.currentUser ? this.currentUser.email : 'guest@adatlensa.id',
      namaPemesan: payload.namaPemesan,
      tanggalKunjungan: payload.dateVal,
      slotWaktu: payload.slotVal,
      ukuranBusana: payload.sizeVal,
      pilihanMixMatch: payload.notes || payload.busanaNama,
      idBusana: payload.busanaId,
      idSpotFoto: payload.spotId,
      idPaketFotografer: payload.pkgId,
      jumlahPeserta: payload.pax,
      totalAnggaran: payload.grandTotal,
      dpAmount: payload.dpAmount,
      paymentStatus: 'Menunggu DP 30% (QRIS)',
      statusBooking: 'Menunggu Pembayaran DP',
      reviewed: false,
    };
    this.state.bookings.unshift(newBooking);
    this.persist();
    this.notify();
    return newBooking;
  },

  confirmQrisPayment(bookingId) {
    const bk = this.state.bookings.find((b) => b.id === bookingId);
    if (bk) {
      bk.paymentStatus = 'DP Lunas (QRIS Simulasi)';
      bk.statusBooking = 'Busana Siap & Terjadwal';
      this.persist();
      this.notify();
    }
  },

  rescheduleBooking(bookingId, newDate, newSlot) {
    const bk = this.state.bookings.find((b) => b.id === bookingId);
    if (!bk) return { ok: false, message: 'Pesanan tidak ditemukan.' };
    const busana = this.state.busana.find((b) => b.id === bk.idBusana);
    const avail = this.getAvailableStockForSlot(busana, bk.ukuranBusana, newDate, newSlot, bk.id);
    if (avail < bk.jumlahPeserta) {
      return {
        ok: false,
        message: `Stok ukuran ${bk.ukuranBusana} penuh pada tanggal & slot baru tersebut. Silakan pilih waktu lain.`,
      };
    }
    bk.tanggalKunjungan = newDate;
    bk.slotWaktu = newSlot;
    bk.statusBooking = 'Dijadwalkan Ulang (Cuaca)';
    this.persist();
    this.notify();
    return { ok: true };
  },

  submitReview(bookingId, rating, comment) {
    const bk = this.state.bookings.find((b) => b.id === bookingId);
    if (!bk) return;
    const busana = this.state.busana.find((b) => b.id === bk.idBusana);
    if (busana) {
      if (!busana.reviews) busana.reviews = [];
      busana.reviews.unshift({
        user: bk.namaPemesan.split('(')[0].trim(),
        rating: Number(rating),
        comment: comment.trim() || 'Pelayanan ramah Muslim dan busana sangat terawat!',
        date: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      });
    }
    bk.reviewed = true;
    this.persist();
    this.notify();
  },

  saveBusana(payload) {
    const idx = this.state.busana.findIndex((b) => b.id === payload.id);
    if (idx >= 0) {
      this.state.busana[idx] = payload;
    } else {
      this.state.busana.unshift(payload);
    }
    this.ui.adminEditingBusanaId = '';
    this.persist();
    this.notify();
  },

  deleteBusana(id) {
    this.state.busana = this.state.busana.filter((b) => b.id !== id);
    this.persist();
    this.notify();
  },

  addSpot(spot) {
    this.state.spots.unshift(spot);
    this.persist();
    this.notify();
  },

  deleteSpot(id) {
    this.state.spots = this.state.spots.filter((s) => s.id !== id);
    this.persist();
    this.notify();
  },

  updateBookingStatus(index, status) {
    if (this.state.bookings[index]) {
      this.state.bookings[index].statusBooking = status;
      this.persist();
    }
  },

  resetDemoData() {
    this.state = clone(DEFAULT_DATA);
    this.users = clone(DEFAULT_USERS);
    this.ui.adminEditingBusanaId = '';
    this.persist();
    this.notify();
  },
};
