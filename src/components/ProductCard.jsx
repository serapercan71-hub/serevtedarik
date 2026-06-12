import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Stars from './Stars.jsx';
import Price from './Price.jsx';
import { IconHeart } from './icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user, isApproved, getProductPrice } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const isMember = user?.role === 'member';
  const fav = isFavorite(product.id);

  const handleAdd = () => {
    // Onaysız: girişli üye onay bekliyor (hesabıma), misafir girişe gider
    if (!isApproved) {
      navigate(isMember ? '/hesabim' : '/giris');
      return;
    }
    // Üyenin seviyesine göre fiyatı çözüp sepete o fiyatla ekle
    addItem({ ...product, price: getProductPrice(product) });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const badgeClass =
    product.badge === 'Tükendi'
      ? 'product-badge sold'
      : product.badgeType === 'discount'
      ? 'product-badge discount'
      : 'product-badge';

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
    >
      {product.badge && <span className={badgeClass}>{product.badge}</span>}
      <button
        className={`fav-btn${fav ? ' active' : ''}`}
        title={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        onClick={() => toggleFavorite(product.id)}
      >
        <IconHeart filled={fav} width={18} height={18} />
      </button>
      <Link to={`/urun/${product.id}`} className="product-link">
        <div className="product-img-wrap">
          <img
            src={product.img}
            alt={product.title}
            className="product-img"
            loading="lazy"
          />
          <span className="quick-view">İncele</span>
        </div>
        <h3 className="product-title">{product.title}</h3>
      </Link>
      {product.rating && (
        <div className="product-rating">
          <Stars value={product.rating} />
          <span>({product.reviewCount})</span>
        </div>
      )}
      <div className="product-price-row">
        <Price product={product} variant="card" />
      </div>
      <button
        className={`add-to-cart${added ? ' added' : ''}`}
        onClick={handleAdd}
        disabled={!product.inStock || (isMember && !isApproved)}
      >
        {!product.inStock
          ? 'Tükendi'
          : isApproved
          ? added
            ? 'Eklendi ✓'
            : 'Sepete Ekle'
          : isMember
          ? 'Onay Bekleniyor'
          : 'Giriş Yap'}
      </button>
    </motion.div>
  );
}
