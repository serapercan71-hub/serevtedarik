import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import WhatsAppFloat from '../components/WhatsAppFloat.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Stars from '../components/Stars.jsx';
import Thumb from '../components/Thumb.jsx';
import {
  IconBadgeCheck,
  IconTag,
  IconChat,
  IconTruck,
  IconImage,
} from '../components/icons.jsx';
import { products, categories } from '../data/products.js';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

// Hero kolajındaki yüzen kutular (fotoğraf yok — placeholder)
const heroCards = [
  { cls: 'hc-1', delay: 0 },
  { cls: 'hc-2', delay: 0.8 },
  { cls: 'hc-3', delay: 1.6 },
];

// Örnek müşteri yorumları — gerçek yorumlar gelince değiştirilecek
const testimonials = [
  {
    name: 'Elif K.',
    place: 'Kadıköy / İstanbul',
    rating: 5,
    text: 'Sipariş verdim, aynı gün WhatsApp üzerinden dönüş yaptılar. Ürünler orijinal ve paketleme çok özenliydi.',
  },
  {
    name: 'Murat A.',
    place: 'Çankaya / Ankara',
    rating: 5,
    text: 'Mağazam için toptan alıyorum. Temsilci fiyatları gerçekten avantajlı, tedarik hızı da çok iyi.',
  },
  {
    name: 'Zeynep T.',
    place: 'Bornova / İzmir',
    rating: 4.5,
    text: 'Solingen setini aldım, kalitesi beklediğimin üstünde çıktı. İletişimleri çok hızlı, tavsiye ederim.',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Header />

      {/* HERO — sol metin, sağ yüzen ürün kolajı */}
      <section className="hero">
        <div className="container hero-inner">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="hero-eyebrow">Toptan & Perakende Tedarik</span>
            <h2>
              Kalitenin <span className="accent">Yeni Adresi</span>
            </h2>
            <p>
              Evinize şıklık katacak, kullanımı kolay ve uzun ömürlü özel
              tasarım koleksiyonlarımızı hemen keşfedin.
            </p>
            <div className="hero-actions">
              <button className="hero-btn" onClick={() => navigate('/urunler')}>
                Alışverişe Başla
              </button>
              <button
                className="hero-btn-ghost"
                onClick={() => navigate('/kayit')}
              >
                Üye Ol, Fiyatları Gör
              </button>
            </div>
          </motion.div>

          <div className="hero-collage" aria-hidden="true">
            {heroCards.map((c) => (
              <motion.div
                key={c.cls}
                className={`hero-card img-ph ${c.cls}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: [0, -10, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: c.delay * 0.3 },
                  y: {
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: c.delay,
                  },
                }}
              >
                <IconImage />
              </motion.div>
            ))}
            <div className="hero-blob" />
          </div>
        </div>
      </section>

      {/* GÜVEN ŞERİDİ — ikonlu */}
      <motion.section className="container trust-strip" {...fadeUp}>
        <div className="trust-item">
          <IconBadgeCheck />
          <div>
            <strong>%100 Orijinal Ürün</strong>
            <span>Tüm ürünler garantili</span>
          </div>
        </div>
        <div className="trust-item">
          <IconTag />
          <div>
            <strong>Üyeye Özel Fiyat</strong>
            <span>Perakendeci & temsilci fiyatları</span>
          </div>
        </div>
        <div className="trust-item">
          <IconChat />
          <div>
            <strong>WhatsApp ile Sipariş</strong>
            <span>Hızlı ve kolay talep</span>
          </div>
        </div>
        <div className="trust-item">
          <IconTruck />
          <div>
            <strong>Hızlı Tedarik</strong>
            <span>Özenli paketleme & gönderim</span>
          </div>
        </div>
      </motion.section>

      <div className="container">
        {/* KATEGORİLER — görselli */}
        <motion.h2 className="section-title" {...fadeUp}>
          Ayrıcalıklı Kategoriler
        </motion.h2>
        <div className="categories">
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              className="category-card cat-visual"
              {...fadeUp}
              whileHover={{ y: -8 }}
              onClick={() =>
                navigate(`/urunler?kategori=${encodeURIComponent(cat.name)}`)
              }
            >
              <div className="cat-img-wrap">
                <Thumb src={cat.img} alt={cat.name} className="cat-img" />
              </div>
              <h3>{cat.name}</h3>
              <span className="cat-link">Keşfet →</span>
            </motion.div>
          ))}
        </div>

        {/* ÜRÜNLER */}
        <motion.h2 id="products" className="section-title" {...fadeUp}>
          Haftanın Seçkileri
        </motion.h2>
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <button className="hero-btn" onClick={() => navigate('/urunler')}>
            Tüm Ürünleri Gör
          </button>
        </div>

        {/* MÜŞTERİ YORUMLARI */}
        <motion.h2 className="section-title" {...fadeUp}>
          Müşterilerimiz Ne Diyor?
        </motion.h2>
        <div className="testimonials">
          {testimonials.map((t) => (
            <motion.div className="testimonial-card" key={t.name} {...fadeUp}>
              <Stars value={t.rating} />
              <p className="testimonial-text">“{t.text}”</p>
              <div className="testimonial-author">
                <span className="t-avatar">{t.name.charAt(0)}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.place}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* HAKKIMIZDA */}
      <motion.section className="container simple-about" {...fadeUp}>
        <h1>Orijinal Ürünler, Güvenli Alışveriş</h1>
        <p>
          Serap Ercan olarak; ev ve mutfak gereçlerinde kaliteyi arayanlar için
          en seçkin markaları bir araya getiriyoruz. İhtiyacınız olan ürünlere en
          hızlı, en güvenli ve en uygun fiyatlarla ulaşmanızı sağlamaktayız.
        </p>
      </motion.section>

      <Footer />
      <WhatsAppFloat />
    </motion.div>
  );
}
