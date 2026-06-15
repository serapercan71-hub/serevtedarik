import { Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../context/CartContext.jsx';
import { TIERS } from '../data/store.js';

const statusInfo = {
  pending: {
    cls: 'pending',
    title: 'Üyeliğin onay bekliyor',
    text: 'Üyelik başvurunuz alınmıştır. Onaylandıktan sonra fiyatları görebilir ve sipariş oluşturabilirsiniz.',
  },
  approved: {
    cls: 'approved',
    title: 'Üyeliğin onaylandı 🎉',
    text: 'Artık fiyatları görebilir ve sipariş verebilirsin.',
  },
  rejected: {
    cls: 'rejected',
    title: 'Üyeliğin reddedildi',
    text: 'Başvurun onaylanmadı. Detay için bizimle iletişime geçebilirsin.',
  },
};

export default function Account() {
  const { user, isAdmin, logout, getUserOrders, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null; // oturum yükleniyor — yönlendirmeden önce bekle
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (!user) return <Navigate to="/giris" replace />;

  const info = statusInfo[user.status] || statusInfo.pending;
  const orders = getUserOrders(user.id);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container account-page">
        <div className="account-head">
          <h1>Merhaba, {user.fullName}</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Çıkış Yap
          </button>
        </div>

        <div className={`status-banner ${info.cls}`}>
          <strong>{info.title}</strong>
          <p>{info.text}</p>
          {user.status === 'approved' && (
            <span className="tier-pill">
              Fiyat seviyen: {TIERS[user.tier]?.label || user.tier}
            </span>
          )}
        </div>

        <div className="account-grid">
          <div className="account-card">
            <h3>Firma Bilgileri</h3>
            <ul className="account-info">
              <li>
                <span>Firma</span>
                <strong>{user.companyName || '—'}</strong>
              </li>
              <li>
                <span>Vergi No</span>
                <strong>{user.taxNo || '—'}</strong>
              </li>
              <li>
                <span>Yetkili</span>
                <strong>{user.fullName}</strong>
              </li>
              <li>
                <span>E-posta</span>
                <strong>{user.email}</strong>
              </li>
              <li>
                <span>Telefon</span>
                <strong>{user.phone}</strong>
              </li>
            </ul>
          </div>

          <div className="account-card">
            <h3>Siparişlerim ({orders.length})</h3>
            {orders.length === 0 ? (
              <p className="account-empty">
                Henüz siparişin yok.{' '}
                {user.status === 'approved' && (
                  <Link to="/urunler">Alışverişe başla</Link>
                )}
              </p>
            ) : (
              <div className="order-list">
                {orders.map((o) => (
                  <div className="order-row" key={o.code}>
                    <div>
                      <strong>{o.code}</strong>
                      <span className="order-date">
                        {new Date(o.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="order-meta">
                      <span className="order-status">{o.status}</span>
                      <strong>{formatPrice(o.total)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
