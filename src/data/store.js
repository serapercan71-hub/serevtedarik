// ============================================================
//  MAĞAZA AYARLARI — Buradaki bilgileri kendi bilgilerinle değiştir.
// ============================================================

// Satıcının WhatsApp numarası (başında ülke kodu, boşluk/sembol YOK).
// Örn: Türkiye için 90 ile başlar -> '905551112233'
export const SELLER_WHATSAPP = '905550000000'; // <-- DEĞİŞTİR

export const STORE_NAME = 'Serev Tedarik';

// ============================================================
//  ADMIN GİRİŞ BİLGİLERİ (şimdilik sabit — sonra değiştirilebilir)
// ============================================================
export const ADMIN = {
  email: 'serapercan71@gmail.com',
  password: 'admin123',
};

// Fiyat seviyeleri (üye tipleri)
export const TIERS = {
  perakende: { key: 'perakende', label: 'Perakendeci' },
  temsilci: { key: 'temsilci', label: 'Temsilci' },
};

// Sipariş kodu üretici: SE-YYMMDD-XXXX (tarih + rastgele)
export function generateOrderCode() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${String(d.getFullYear()).slice(2)}${pad(
    d.getMonth() + 1
  )}${pad(d.getDate())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SE-${datePart}-${rand}`;
}
