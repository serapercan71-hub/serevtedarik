// Ürün verisi — şimdilik sahte (frontend) veri.
// Backend eklendiğinde bu liste API'den gelecek şekilde değiştirilebilir.
export const products = [
  {
    id: 1,
    title: 'Solingen Tırtıklı Bıçak Seti',
    price: 350,
    priceTemsilci: 300,
    img: '/img/urun-bicak.jpg',
    badge: 'Yeni',
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
    category: 'Mutfak Gereçleri',
    desc: 'Alman çeliği Solingen kalitesiyle üretilen tırtıklı bıçak seti; ekmek, domates ve hassas dilimleme işleri için ideal. Paslanmaz, keskinliğini uzun süre korur, ergonomik sapı sayesinde rahat kavrama sağlar.',
    features: [
      'Orijinal Solingen paslanmaz çelik',
      'Ergonomik kaymaz sap',
      'Bulaşık makinesinde yıkanabilir',
      '2 yıl üretici garantisi',
    ],
  },
  {
    id: 2,
    title: 'Dekoratif Yapışkanlı Raf',
    price: 180,
    priceTemsilci: 150,
    img: '/img/urun-raf.jpg',
    badge: 'Tükendi',
    inStock: false,
    rating: 4.3,
    reviewCount: 56,
    category: 'Ev & Yaşam',
    desc: 'Delme matkap gerektirmeyen, güçlü yapışkanlı dekoratif raf. Banyo, mutfak ve çalışma alanlarında pratik kullanım sunar. Duvarınıza zarar vermeden monte edebilirsiniz.',
    features: [
      'Delmeden montaj — güçlü yapışkan',
      'Su ve neme dayanıklı',
      '5 kg taşıma kapasitesi',
      'Şık modern tasarım',
    ],
  },
  {
    id: 3,
    title: 'Solingen 8 Parça Mutfak Seti',
    price: 890,
    priceTemsilci: 760,
    img: '/img/urun-mutfak-seti.jpg',
    badge: 'Çok Satan',
    inStock: true,
    rating: 4.9,
    reviewCount: 312,
    category: 'Mutfak Gereçleri',
    desc: 'Siyah-beyaz şık tasarımlı 8 parçalık komple mutfak bıçak seti. Standıyla birlikte gelir, mutfağınızda hem işlevsel hem dekoratif bir görünüm sağlar. Her tür kesme ihtiyacınızı karşılar.',
    features: [
      '8 parça komple set + stand',
      'Orijinal Solingen çeliği',
      'Şık siyah-beyaz tasarım',
      'Hediyelik kutuda',
    ],
  },
  {
    id: 4,
    title: 'Orijinal Solingen Tekli Bıçak',
    price: 150,
    priceTemsilci: 125,
    img: '/img/urun-1.jpg',
    inStock: true,
    rating: 4.6,
    reviewCount: 89,
    category: 'Mutfak Gereçleri',
    desc: 'Günlük mutfak işleriniz için çok amaçlı tekli Solingen bıçağı. Keskin ağzı ve dengeli ağırlığıyla zahmetsiz kesim sağlar. Her mutfağın temel parçası.',
    features: [
      'Çok amaçlı şef bıçağı',
      'Orijinal Solingen çeliği',
      'Dengeli ağırlık dağılımı',
      'Keskinliğini korur',
    ],
  },
  {
    id: 5,
    title: 'Premium Saklama Kabı',
    price: 220,
    priceTemsilci: 185,
    img: '/img/urun-2.jpg',
    inStock: true,
    rating: 4.7,
    reviewCount: 67,
    category: 'Saklama Kapları',
    desc: 'Hava sızdırmaz kapaklı premium saklama kabı. Gıdalarınızı uzun süre taze tutar, dolapta yer kazandıran istiflenebilir tasarıma sahiptir. BPA içermez.',
    features: [
      'Hava sızdırmaz kapak',
      'BPA içermez — gıdaya uygun',
      'İstiflenebilir tasarım',
      'Mikrodalga ve dondurucuya uygun',
    ],
  },
  {
    id: 6,
    title: 'Çelik Suluk & Matara',
    price: 195,
    priceTemsilci: 165,
    img: '/img/urun-3.jpg',
    inStock: true,
    rating: 4.5,
    reviewCount: 143,
    category: 'Suluk & Matara',
    desc: 'Çift cidarlı paslanmaz çelik termos matara. İçeceklerinizi 12 saat sıcak, 24 saat soğuk tutar. Sızdırmaz kapağı ve dayanıklı gövdesiyle her yere yanınızda.',
    features: [
      'Çift cidarlı yalıtım',
      '12 saat sıcak / 24 saat soğuk',
      'Sızdırmaz kapak',
      '750 ml hacim',
    ],
  },
];

export const categories = [
  { icon: '🍽️', name: 'Mutfak Gereçleri' },
  { icon: '📦', name: 'Saklama Kapları' },
  { icon: '🧴', name: 'Suluk & Matara' },
  { icon: '🧵', name: 'Tekstil Ürünleri' },
];

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
