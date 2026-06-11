import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart, formatPrice } from '../context/CartContext.jsx';
import { products } from '../data/products.js';
import { TIERS } from '../data/store.js';
import AdminLogin from './AdminLogin.jsx';

export default function Admin() {
  const {
    isAdmin,
    users,
    orders,
    logout,
    approveUser,
    rejectUser,
    setUserTier,
    resolvePrices,
    setProductPrice,
  } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  // Yönetici değilse müşteri girişine değil, ayrı yönetici giriş ekranına düşer.
  if (!isAdmin) return <AdminLogin />;

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  // Bekleyenler en üstte, sonra tarihe göre yeni→eski
  const order = { pending: 0, approved: 1, rejected: 2 };
  const applications = [...users].sort(
    (a, b) =>
      (order[a.status] ?? 9) - (order[b.status] ?? 9) ||
      new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="checkout-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <img src="/img/logo.png" alt="Serap Ercan Logo" className="logo-img" />
          </Link>
          <span className="admin-badge">Yönetici Paneli</span>
          <button className="logout-btn admin-logout" onClick={handleLogout}>
            Çıkış
          </button>
        </div>
      </header>

      <div className="container admin-page">
        {/* ÜYELİK BAŞVURULARI */}
        <section className="admin-section">
          <h2 className="admin-h2">
            Üyelik Başvuruları{' '}
            <span className="count-pill">{pendingCount} beklemede</span>
          </h2>
          {applications.length === 0 ? (
            <p className="account-empty">Henüz başvuru yok.</p>
          ) : (
            <div className="admin-cards">
              {applications.map((u) => (
                <ApplicationCard
                  key={u.id}
                  u={u}
                  onApprove={(tier) => {
                    approveUser(u.id, tier);
                    showToast(`${u.companyName} onaylandı`);
                  }}
                  onReject={() => {
                    rejectUser(u.id);
                    showToast(`${u.companyName} reddedildi`);
                  }}
                  onTierChange={(tier) => {
                    setUserTier(u.id, tier);
                    showToast('Üyelik tipi güncellendi');
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* ÜRÜN FİYATLARI */}
        <section className="admin-section">
          <h2 className="admin-h2">Ürün Fiyatları</h2>
          <p className="admin-hint">
            Her ürün için perakendeci ve temsilci fiyatlarını ayrı ayrı gir, kaydet.
          </p>
          <div className="price-editor">
            {products.map((p) => (
              <PriceRow
                key={p.id}
                product={p}
                current={resolvePrices(p)}
                onSave={(per, tem) => {
                  const pv = Number(per);
                  const tv = Number(tem);
                  if (
                    per === '' ||
                    tem === '' ||
                    Number.isNaN(pv) ||
                    Number.isNaN(tv) ||
                    pv < 0 ||
                    tv < 0
                  ) {
                    showToast('Geçerli bir fiyat girin');
                    return;
                  }
                  setProductPrice(p.id, pv, tv);
                  showToast(`${p.title} fiyatları kaydedildi`);
                }}
              />
            ))}
          </div>
        </section>

        {/* SİPARİŞLER */}
        <section className="admin-section">
          <h2 className="admin-h2">Siparişler ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="account-empty">Henüz sipariş yok.</p>
          ) : (
            <div className="admin-table">
              <div className="admin-tr admin-th orders-row">
                <span>Kod</span>
                <span>Tarih</span>
                <span>Tutar</span>
                <span>Durum</span>
              </div>
              {orders.map((o) => (
                <div className="admin-tr orders-row" key={o.code}>
                  <span data-label="Kod">
                    <strong>{o.code}</strong>
                  </span>
                  <span data-label="Tarih">
                    {new Date(o.createdAt).toLocaleString('tr-TR')}
                  </span>
                  <span data-label="Tutar">{formatPrice(o.total)}</span>
                  <span data-label="Durum">
                    <span className="mini-status pending">{o.status}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

function ApplicationCard({ u, onApprove, onReject, onTierChange }) {
  const [tier, setTier] = useState(u.tier || u.requestedType || 'perakende');

  const statusLabel =
    u.status === 'approved'
      ? 'Onaylandı'
      : u.status === 'rejected'
      ? 'Reddedildi'
      : 'Beklemede';

  const appDate = new Date(u.createdAt).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="pending-card">
      <div className="app-card-head">
        <strong>{u.companyName}</strong>
        <span className={`mini-status ${u.status}`}>{statusLabel}</span>
      </div>

      <ul className="account-info app-info">
        <li>
          <span>Ad Soyad</span>
          <strong>{u.fullName}</strong>
        </li>
        <li>
          <span>Telefon</span>
          <strong>{u.phone}</strong>
        </li>
        <li>
          <span>E-posta</span>
          <strong>{u.email}</strong>
        </li>
        <li>
          <span>Başvuru Tarihi</span>
          <strong>{appDate}</strong>
        </li>
        <li>
          <span>Üyelik Tipi</span>
          <strong>
            {u.status === 'approved'
              ? TIERS[u.tier]?.label || u.tier
              : `Talep: ${TIERS[u.requestedType]?.label || u.requestedType}`}
          </strong>
        </li>
      </ul>

      <div className="pending-actions">
        {u.status === 'pending' && (
          <>
            <label>Üyelik tipi</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="perakende">Perakendeci</option>
              <option value="temsilci">Temsilci</option>
            </select>
            <button className="approve-btn" onClick={() => onApprove(tier)}>
              ✓ Onayla
            </button>
            <button className="reject-btn" onClick={onReject}>
              ✕ Reddet
            </button>
          </>
        )}

        {u.status === 'approved' && (
          <>
            <label>Üyelik tipi</label>
            <select
              value={u.tier || 'perakende'}
              onChange={(e) => onTierChange(e.target.value)}
            >
              <option value="perakende">Perakendeci</option>
              <option value="temsilci">Temsilci</option>
            </select>
            <button className="reject-btn" onClick={onReject}>
              Reddet
            </button>
          </>
        )}

        {u.status === 'rejected' && (
          <button className="approve-btn" onClick={() => onApprove(tier)}>
            ✓ Onayla
          </button>
        )}
      </div>
    </div>
  );
}

function PriceRow({ product, current, onSave }) {
  const [per, setPer] = useState(current.perakende);
  const [tem, setTem] = useState(current.temsilci);
  return (
    <div className="price-row">
      <img src={product.img} alt={product.title} />
      <span className="price-row-title">{product.title}</span>
      <div className="price-input">
        <label>Perakendeci ₺</label>
        <input
          type="number"
          value={per}
          onChange={(e) => setPer(e.target.value)}
        />
      </div>
      <div className="price-input">
        <label>Temsilci ₺</label>
        <input
          type="number"
          value={tem}
          onChange={(e) => setTem(e.target.value)}
        />
      </div>
      <button className="mini-btn" onClick={() => onSave(per, tem)}>
        Kaydet
      </button>
    </div>
  );
}
