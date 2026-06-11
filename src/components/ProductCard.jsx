import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Stars from './Stars.jsx';
import Price from './Price.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user, isApproved, getProductPrice } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const isMember = user?.role === 'member';

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
      <Link to={`/urun/${product.id}`} className="product-link">
        <img src={product.img} alt={product.title} className="product-img" />
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
