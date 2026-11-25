/**
 * Escapes HTML special characters to prevent XSS when interpolating user input.
 */
export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats an integer amount into Indonesian Rupiah currency string.
 */
export function formatRp(amount) {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}

/**
 * Generates a culturally-styled offline SVG data URI fallback when remote images fail to load.
 */
export function makeFallbackSvg(label, bgColor = '#064e3b') {
  const safeLabel = escapeHtml(label).slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="${bgColor}"/>
    <path d="M0 450 Q300 180 600 450 Z" fill="#f59e0b" opacity="0.22"/>
    <circle cx="300" cy="145" r="36" fill="none" stroke="#fef3c7" stroke-width="2" opacity="0.5"/>
    <text x="300" y="235" fill="#ffffff" font-family="Georgia, serif" font-size="24" font-weight="bold" text-anchor="middle">${safeLabel}</text>
    <text x="300" y="270" fill="#fef3c7" font-family="sans-serif" font-size="14" text-anchor="middle">AdatLensa Aceh Heritage Collection</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Compresses an uploaded image File into a JPEG data URI for localStorage persistence.
 */
export function compressImageFile(file, maxWidth = 540, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
