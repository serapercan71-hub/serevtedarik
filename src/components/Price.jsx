import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../context/CartContext.jsx';

// Fiyatı yalnızca ONAYLI ÜYEye gösterir.
// - Giriş yoksa: "Giriş yapın" bağlantısı
// - Üye ama onaysız: "Onay bekleniyor"
// variant: 'card' | 'detail'
export default function Price({ product, variant = 'card' }) {
  const { user, isApproved, getProductPrice } = useAuth();

  if (isApproved) {
    const value = getProductPrice(product);
    return (
      <span className={variant === 'detail' ? 'detail-price' : 'product-price'}>
        {formatPrice(value)}
      </span>
    );
  }

  if (user && user.role === 'member') {
    return <span className="price-locked pending">🔒 Onay bekleniyor</span>;
  }

  return (
    <Link to="/giris" className="price-locked">
      🔒 Fiyatı görmek için giriş yapın
    </Link>
  );
}
