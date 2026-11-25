import { store } from '../state/store.js';
import { escapeHtml, makeFallbackSvg } from '../utils/format.js';

export function renderAuthView(t) {
  const isId = store.lang === 'id';
  const noticeHtml = store.ui.authNotice
    ? `<div class="alert alert-info" style="margin-bottom:16px;">${escapeHtml(store.ui.authNotice)}</div>`
    : '';

  const backToHomeHtml = store.currentUser
    ? `
      <div style="margin-top:14px; text-align:center;">
        <button type="button" class="btn btn-ghost btn-sm" id="backToHomeFromAuthBtn">
          ${isId ? '← Kembali ke Halaman Utama' : '← Back to Main Page'}
        </button>
      </div>
    `
    : '';

  return `
    <section class="view-panel" aria-labelledby="authHeading">
      <div class="auth-gate-grid">
        <aside class="auth-showcase">
          <div>
            <div class="hero-kicker">${escapeHtml(t('auth_gate_kicker'))}</div>
            <h1 class="auth-showcase-title">${escapeHtml(t('auth_gate_title'))}</h1>
            <p class="auth-showcase-desc">${escapeHtml(t('auth_gate_desc'))}</p>

            <div class="auth-preview-pair">
              <figure class="hero-tile">
                <img
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Pakaian_Adat_Aceh_Wanita.jpg?width=640"
                  alt="Busana Adat Daro Baro Pesisir Aceh"
                  referrerpolicy="no-referrer"
                  data-fallback-label="Daro Baro Aceh"
                  data-fallback-color="#064e3b"
                />
                <figcaption class="hero-tile-caption">Daro Baro &amp; Linto Baro</figcaption>
              </figure>
              <figure class="hero-tile">
                <img
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gunongan_Aceh_Sultanate,_diambil_5_May_2026.jpg?width=640"
                  alt="Taman Sari Gunongan Banda Aceh"
                  referrerpolicy="no-referrer"
                  data-fallback-label="Taman Sari Gunongan"
                  data-fallback-color="#047857"
                />
                <figcaption class="hero-tile-caption">Taman Sari Gunongan</figcaption>
              </figure>
            </div>
          </div>

          <ul class="auth-highlights">
            <li>
              <strong>${isId ? 'Peta Interaktif Google Maps Aceh' : 'Interactive Aceh Google Maps'}</strong>
              <span>${isId ? 'Temukan UMKM persewaan busana & spot foto di 5 wilayah Aceh.' : 'Explore attire MSMEs & photo spots across 5 regions of Aceh.'}</span>
            </li>
            <li>
              <strong>${isId ? 'Studio Mix & Match Virtual' : 'Virtual Mix & Match Studio'}</strong>
              <span>${isId ? 'Padukan sunting, busana adat, dan latar lokasi sebelum memesan.' : 'Combine headpieces, traditional attire, and scenic backdrops.'}</span>
            </li>
            <li>
              <strong>${isId ? 'Standar Halal Tourism & MUA Syar\'i' : 'Halal Tourism & Syar\'i MUA'}</strong>
              <span>${isId ? 'Ruang ganti tertutup, jadwal sesi per ukuran, dan info fasilitas ibadah.' : 'Private fitting rooms, size-slot scheduling, and prayer facility info.'}</span>
            </li>
          </ul>
        </aside>

        <div class="auth-box">
          <div style="margin-bottom:20px;">
            <h2 id="authHeading" class="section-title" style="font-size:1.55rem;">${escapeHtml(t('auth_heading'))}</h2>
            <p class="section-subtitle" style="font-size:0.87rem;">${escapeHtml(t('auth_sub'))}</p>
          </div>

          ${noticeHtml}

          <div class="auth-tabs" role="tablist">
            <button type="button" class="auth-tab active" data-auth-tab="login" role="tab" aria-selected="true">
              ${isId ? 'Masuk (Login)' : 'Sign In'}
            </button>
            <button type="button" class="auth-tab" data-auth-tab="register" role="tab" aria-selected="false">
              ${isId ? 'Daftar Akun Baru' : 'Create Account'}
            </button>
          </div>

          <form id="loginForm" novalidate>
            <div class="form-field">
              <label for="loginEmail">Email</label>
              <input
                class="form-control"
                type="email"
                id="loginEmail"
                autocomplete="email"
                required
                placeholder="wisatawan@adatlensa.id"
              />
            </div>
            <div class="form-field">
              <label for="loginPassword">${isId ? 'Kata Sandi' : 'Password'}</label>
              <div class="password-input-wrap">
                <input
                  class="form-control"
                  type="password"
                  id="loginPassword"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  class="btn btn-ghost btn-sm password-toggle-btn"
                  id="toggleLoginPwdBtn"
                  aria-label="${isId ? 'Tampilkan atau sembunyikan kata sandi' : 'Show or hide password'}"
                >
                  ${isId ? 'Lihat' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">
              ${isId ? 'Masuk ke Halaman Utama' : 'Sign In & Enter Portal'}
            </button>
          </form>

          <form id="registerForm" style="display:none;" novalidate>
            <div class="form-field">
              <label for="regName">${isId ? 'Nama Lengkap / Nama Usaha UMKM' : 'Full Name / MSME Business Name'}</label>
              <input
                class="form-control"
                type="text"
                id="regName"
                autocomplete="name"
                required
                placeholder="Cut Meutia / Sanggar Aceh"
              />
            </div>
            <div class="form-field">
              <label for="regEmail">Email</label>
              <input
                class="form-control"
                type="email"
                id="regEmail"
                autocomplete="email"
                required
                placeholder="nama@email.com"
              />
            </div>
            <div class="form-field">
              <label for="regRole">${isId ? 'Peran Akun' : 'Account Role'}</label>
              <select class="form-control" id="regRole">
                <option value="wisatawan">${isId ? 'Wisatawan (Booking, QRIS DP & Ulasan)' : 'Tourist (Booking, QRIS DP & Reviews)'}</option>
                <option value="admin">${isId ? 'Mitra UMKM / Admin Katalog (Akses CRUD)' : 'MSME Partner / Catalog Admin (CRUD)'}</option>
              </select>
            </div>
            <div class="form-field">
              <label for="regPassword">${isId ? 'Kata Sandi' : 'Password'}</label>
              <input
                class="form-control"
                type="password"
                id="regPassword"
                autocomplete="new-password"
                required
                minlength="4"
                placeholder="${isId ? 'Min. 4 karakter' : 'Min. 4 characters'}"
              />
            </div>
            <button type="submit" class="btn btn-accent" style="width:100%;">
              ${isId ? 'Daftar & Masuk ke Halaman Utama' : 'Register & Enter Portal'}
            </button>
          </form>

          <div id="authFeedback" aria-live="polite"></div>

          <div class="auth-demo-section">
            <div class="auth-demo-title">
              ${isId ? 'Pintasan Akun Simulasi Demo (1-Klik Masuk):' : '1-Click Demo Simulation Shortcuts:'}
            </div>
            <p class="auth-demo-hint">
              ${
                isId
                  ? 'Email demo: wisatawan@adatlensa.id atau admin@adatlensa.id · Sandi: 123'
                  : 'Demo emails: wisatawan@adatlensa.id or admin@adatlensa.id · Password: 123'
              }
            </p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <button type="button" class="btn btn-secondary btn-sm" data-demo-role="wisatawan">
                ${isId ? 'Masuk Wisatawan' : 'Demo Tourist'}
              </button>
              <button type="button" class="btn btn-accent btn-sm" data-demo-role="admin">
                ${isId ? 'Masuk Admin UMKM' : 'Demo MSME Admin'}
              </button>
            </div>
          </div>

          ${backToHomeHtml}
        </div>
      </div>
    </section>
  `;
}

export function bindAuthEvents(container) {
  const isId = store.lang === 'id';

  container.querySelectorAll('img[data-fallback-label]').forEach((img) => {
    img.addEventListener('error', () => {
      img.src = makeFallbackSvg(
        img.getAttribute('data-fallback-label'),
        img.getAttribute('data-fallback-color')
      );
    });
  });

  const tabs = container.querySelectorAll('[data-auth-tab]');
  const loginForm = container.querySelector('#loginForm');
  const regForm = container.querySelector('#registerForm');
  const feedback = container.querySelector('#authFeedback');
  const loginPwdInput = container.querySelector('#loginPassword');
  const togglePwdBtn = container.querySelector('#toggleLoginPwdBtn');

  if (togglePwdBtn && loginPwdInput) {
    togglePwdBtn.addEventListener('click', () => {
      const showing = loginPwdInput.type === 'text';
      loginPwdInput.type = showing ? 'password' : 'text';
      togglePwdBtn.textContent = showing
        ? isId
          ? 'Lihat'
          : 'Show'
        : isId
          ? 'Tutup'
          : 'Hide';
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.getAttribute('data-auth-tab');
      tabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', String(isActive));
      });
      loginForm.style.display = mode === 'login' ? 'block' : 'none';
      regForm.style.display = mode === 'register' ? 'block' : 'none';
      feedback.innerHTML = '';
    });
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = container.querySelector('#loginEmail').value.trim();
    const password = loginPwdInput.value;
    if (!email || !email.includes('@') || !password) {
      feedback.innerHTML = `<div class="alert alert-err">${
        isId
          ? 'Masukkan email yang valid dan kata sandi Anda.'
          : 'Please enter a valid email and password.'
      }</div>`;
      return;
    }
    const res = store.login(email, password);
    if (!res.ok) {
      feedback.innerHTML = `<div class="alert alert-err">${
        isId
          ? 'Email atau kata sandi salah. Silakan periksa kembali atau gunakan pintasan Demo di bawah.'
          : 'Invalid email or password. Please check your credentials or use the Demo shortcuts below.'
      }</div>`;
    }
  });

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#regName').value.trim();
    const email = container.querySelector('#regEmail').value.trim();
    const role = container.querySelector('#regRole').value;
    const password = container.querySelector('#regPassword').value;

    if (name.length < 2 || !email.includes('@') || password.length < 4) {
      feedback.innerHTML = `<div class="alert alert-err">${
        isId
          ? 'Lengkapi nama, email yang valid, dan kata sandi minimal 4 karakter.'
          : 'Please provide your name, a valid email, and a password of at least 4 characters.'
      }</div>`;
      return;
    }

    const res = store.register({ name, email, role, password });
    if (!res.ok) {
      feedback.innerHTML = `<div class="alert alert-err">${
        isId
          ? 'Email sudah terdaftar. Silakan gunakan tab Masuk.'
          : 'Email is already registered. Please use the Sign In tab.'
      }</div>`;
    }
  });

  container.querySelectorAll('[data-demo-role]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.quickDemoLogin(btn.getAttribute('data-demo-role'));
    });
  });

  const backBtn = container.querySelector('#backToHomeFromAuthBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      store.ui.authNotice = '';
      store.setView('home');
    });
  }
}
