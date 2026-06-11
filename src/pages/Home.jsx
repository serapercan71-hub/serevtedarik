import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import WhatsAppFloat from '../components/WhatsAppFloat.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { products, categories } from '../data/products.js';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header />

      {/* HERO */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2>
            Kalitenin <span className="accent">Yeni Adresi</span>
          </h2>
          <p>
            Evinize şıklık katacak, kullanımı kolay ve uzun ömürlü özel tasarım
            koleksiyonlarımızı hemen keşfedin.
          </p>
          <a href="#products" className="hero-btn">
            Alışverişe Başla
          </a>
        </motion.div>
      </section>

      <div className="container">
        {/* KATEGORİLER */}
        <motion.h2 className="section-title" {...fadeUp}>
          Ayrıcalıklı Kategoriler
        </motion.h2>
        <div className="categories">
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              className="category-card"
              {...fadeUp}
              whileHover={{ y: -8 }}
              onClick={() =>
                navigate(`/urunler?kategori=${encodeURIComponent(cat.name)}`)
              }
            >
              <div className="cat-icon">{cat.icon}</div>
              <h3>{cat.name}</h3>
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
      </div>

      {/* HAKKIMIZDA */}
      <motion.section className="container simple-about" {...fadeUp}>
        <h1>Orijinal Ürünler, Güvenli Alışveriş</h1>
        <p>
          Serap Ercan olarak; ev ve mutfak gereçlerinde kaliteyi arayanlar için
          en seçkin markaları bir araya getiriyoruz. İhtiyacınız olan ürünlere en
          hızlı, en güvenli ve en uygun fiyatlarla ulaşmanızı sağlamaktayız.
        </p>
        <div className="trust-badges">
          <div className="trust-badge-card">
            <span className="trust-icon">💎</span>
            <h3>%100 Orijinal Ürün</h3>
            <p>Tüm ürünlerimiz garantilidir.</p>
          </div>
          <div className="trust-badge-card">
            <span className="trust-icon">🏷️</span>
            <h3>Üyeye Özel Fiyat</h3>
            <p>Perakendeci ve temsilciye özel fiyatlar.</p>
          </div>
          <div className="trust-badge-card">
            <span className="trust-icon">💬</span>
            <h3>Kolay Sipariş</h3>
            <p>WhatsApp ile hızlı sipariş.</p>
          </div>
        </div>
      </motion.section>

      <Footer />
      <WhatsAppFloat />
    </motion.div>
  );
}
