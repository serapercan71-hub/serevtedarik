import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import WhatsAppFloat from '../components/WhatsAppFloat.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { IconHeart } from '../components/icons.jsx';
import { products } from '../data/products.js';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Favorites() {
  const { ids } = useFavorites();
  const favProducts = products.filter((p) => ids.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Header />

      <div className="container">
        <div className="catalog-head">
          <h1 className="catalog-title">Favorilerim</h1>
          <p className="catalog-count">{favProducts.length} ürün</p>
        </div>

        {favProducts.length > 0 ? (
          <div className="products-grid catalog-grid">
            {favProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">
              <IconHeart width={48} height={48} />
            </div>
            <h3>Henüz favorin yok</h3>
            <p>
              Beğendiğin ürünlerin kalp simgesine basarak buraya ekleyebilirsin.
            </p>
            <Link to="/urunler" className="hero-btn">
              Ürünleri Keşfet
            </Link>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppFloat />
    </motion.div>
  );
}
