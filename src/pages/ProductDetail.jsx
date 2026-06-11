import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import WhatsAppFloat from '../components/WhatsAppFloat.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Stars from '../components/Stars.jsx';
import Price from '../components/Price.jsx';
import { getProductById, getRelatedProducts } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import NotFound from './NotFound.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);
  const { addItem } = useCart();
  const { user, isApproved, getProductPrice } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  if (!product) return <NotFound />;

  const related = getRelatedProducts(product);
  const isMember = user?.role === 'member';

  const handleAdd = () => {
    if (!isApproved) return navigate(isMember ? '/hesabim' : '/giris');
    const priced = { ...product, price: getProductPrice(product) };
    for (let i = 0; i < qty; i++) addItem(priced);
  };

  const handleBuyNow = () => {
    if (!isApproved) return navigate(isMember ? '/hesabim' : '/giris');
    const priced = { ...product, price: getProductPrice(product) };
    for (let i = 0; i < qty; i++) addItem(priced);
    navigate('/odeme');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header />

      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span>›</span>
          <span>{product.category}</span>
          <span>›</span>
          <span className="current">{product.title}</span>
        </nav>

        <div className="detail-wrapper">
          {/* Görsel */}
          <motion.div
            className="detail-gallery"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {product.badge && (
              <span
                className={`product-badge${
                  product.badgeType === 'discount' ? ' discount' : ''
                }${!product.inStock ? ' sold' : ''}`}
              >
                {product.badge}
              </span>
            )}
            <img src={product.img} alt={product.title} className="detail-img" />
          </motion.div>

          {/* Bilgi */}
          <motion.div
            className="detail-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <span className="detail-category">{product.category}</span>
            <h1 className="detail-title">{product.title}</h1>

            <div className="detail-rating">
              <Stars value={product.rating} />
              <span>
                {product.rating} ({product.reviewCount} değerlendirme)
              </span>
            </div>

            <div className="detail-price-row">
              <Price product={product} variant="detail" />
            </div>

            <p className="detail-desc">{product.desc}</p>

            {product.features && (
              <ul className="detail-features">
                {product.features.map((f) => (
                  <li key={f}>
                    <span className="feat-check">✓</span> {f}
                  </li>
                ))}
              </ul>
            )}

            {!isApproved ? (
              <div className="detail-login-cta">
                {isMember ? (
                  <p>
                    Üyeliğiniz onay bekliyor. Onaylandıktan sonra fiyatları görüp
                    sipariş oluşturabilirsiniz.
                  </p>
                ) : (
                  <>
                    <p>Fiyatları görmek ve sipariş vermek için üye girişi yapın.</p>
                    <div className="detail-cta-actions">
                      <button
                        className="hero-btn"
                        onClick={() => navigate('/giris')}
                      >
                        Giriş Yap
                      </button>
                      <Link to="/kayit" className="detail-register-link">
                        Üyelik başvurusu yap
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : product.inStock ? (
              <>
                <div className="detail-actions">
                  <div className="qty-selector">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                      −
                    </button>
                    <span>{qty}</span>
                    <button onClick={() => setQty((q) => q + 1)}>+</button>
                  </div>
                  <button className="add-to-cart detail-add" onClick={handleAdd}>
                    Sepete Ekle
                  </button>
                </div>
                <button className="hero-btn detail-buy" onClick={handleBuyNow}>
                  Hemen Satın Al
                </button>
              </>
            ) : (
              <div className="detail-soldout">
                Bu ürün şu an tükendi. Stok bildirimi için bizimle iletişime
                geçin.
              </div>
            )}

            <div className="detail-trust">
              <span>🚚 Aynı gün kargo</span>
              <span>🛡️ Güvenli ödeme</span>
              <span>💎 %100 orijinal</span>
            </div>
          </motion.div>
        </div>

        {/* Benzer ürünler */}
        {related.length > 0 && (
          <>
            <h2 className="section-title" style={{ marginTop: 40 }}>
              Benzer Ürünler
            </h2>
            <div className="products-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
      <WhatsAppFloat />
    </motion.div>
  );
}
