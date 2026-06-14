// ============================================================
//  ÜRÜN & KATEGORİ VERİSİ
//  Yayına hazır: demo veri YOK. Ürünleri ve kategorileri
//  yönetici panelinden (Admin) ekleyeceksin. Veritabanı
//  bağlandığında bu kayıtlar API üzerinden gelecek.
// ============================================================

export const products = [];

export const categories = [];

export function getProductById(id) {
  return products.find((p) => p.id === Number(id));
}

export function getRelatedProducts(product, limit = 3) {
  if (!product) return [];
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, limit);
}
