import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useCart, formatPrice } from '../context/CartContext.jsx';
import { fileToWebp } from '../lib/image.js';
import Thumb from '../components/Thumb.jsx';
import AdminLogin from './AdminLogin.jsx';

const ORDER_STATUSES = [
  'Onay bekliyor',
  'Hazırlanıyor',
  'Kargolandı',
  'Tamamlandı',
  'İptal',
];

const waLink = (phone) => {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '90' + d.slice(1);
  else if (!d.startsWith('90') && d.length === 10) d = '90' + d;
  return `https://wa.me/${d}`;
};

export default function Admin() {
  const auth = useAuth();
  const { isAdmin, logout } = auth;
  const { showToast } = useCart();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');

  if (!isAdmin) return <AdminLogin />;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { key: 'dashboard', label: 'Panel' },
    { key: 'urunler', label: 'Ürünler' },
    { key: 'siparisler', label: 'Siparişler' },
    { key: 'uyeler', label: 'Üyeler' },
    { key: 'ayarlar', label: 'Ayarlar' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="checkout-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <img src="/img/logo.png" alt="Logo" className="logo-img" />
          </Link>
          <span className="admin-badge">Yönetici Paneli</span>
          <button className="logout-btn admin-logout" onClick={handleLogout}>
            Çıkış
          </button>
        </div>
      </header>

      <div className="admin-tabs-bar">
        <div className="container admin-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`admin-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === 'uyeler' && auth.users.some((u) => u.status === 'pending') && (
                <span className="tab-dot" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container admin-page">
        {tab === 'dashboard' && <Dashboard auth={auth} setTab={setTab} />}
        {tab === 'urunler' && <ProductsTab showToast={showToast} />}
        {tab === 'siparisler' && <OrdersTab auth={auth} showToast={showToast} />}
        {tab === 'uyeler' && <MembersTab auth={auth} showToast={showToast} />}
        {tab === 'ayarlar' && <SettingsTab showToast={showToast} />}
      </div>
    </motion.div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard({ auth, setTab }) {
  const { users, orders } = auth;
  const { products } = useCatalog();
  const pending = users.filter((u) => u.status === 'pending').length;
  const approved = users.filter((u) => u.status === 'approved').length;
  const cards = [
    { label: 'Bekleyen Başvuru', value: pending, tab: 'uyeler', accent: pending > 0 },
    { label: 'Onaylı Üye', value: approved, tab: 'uyeler' },
    { label: 'Toplam Sipariş', value: orders.length, tab: 'siparisler' },
    { label: 'Toplam Ürün', value: products.length, tab: 'urunler' },
  ];
  return (
    <section className="admin-section">
      <h2 className="admin-h2">Genel Bakış</h2>
      <div className="dash-cards">
        {cards.map((c) => (
          <button
            key={c.label}
            className={`dash-card${c.accent ? ' accent' : ''}`}
            onClick={() => setTab(c.tab)}
          >
            <span className="dash-value">{c.value}</span>
            <span className="dash-label">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="dash-recent">
        <div className="dash-col">
          <h3>Son Siparişler</h3>
          {orders.length === 0 ? (
            <p className="account-empty">Henüz sipariş yok.</p>
          ) : (
            orders.slice(0, 5).map((o) => (
              <div className="dash-row" key={o.code}>
                <strong>{o.code}</strong>
                <span>{formatPrice(o.total)}</span>
              </div>
            ))
          )}
        </div>
        <div className="dash-col">
          <h3>Son Başvurular</h3>
          {users.length === 0 ? (
            <p className="account-empty">Henüz başvuru yok.</p>
          ) : (
            users.slice(-5).reverse().map((u) => (
              <div className="dash-row" key={u.id}>
                <strong>{u.companyName || u.fullName}</strong>
                <span className={`mini-status ${u.status}`}>
                  {statusLabel(u.status)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ÜRÜNLER ---------------- */
const emptyProduct = {
  title: '',
  category: '',
  img: '',
  price: '',
  priceTemsilci: '',
  badge: '',
  inStock: true,
  desc: '',
};

function ProductsTab({ showToast }) {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
  } = useCatalog();
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [form, setForm] = useState(emptyProduct);
  const [newCat, setNewCat] = useState('');
  const [uploading, setUploading] = useState(false);

  const openNew = () => {
    setForm({ ...emptyProduct, category: categories[0] || '' });
    setEditing('new');
  };
  const openEdit = (p) => {
    setForm({
      title: p.title,
      category: p.category,
      img: p.img,
      price: p.price,
      priceTemsilci: p.priceTemsilci,
      badge: p.badge || '',
      inStock: p.inStock !== false,
      desc: p.desc || '',
    });
    setEditing(p);
  };
  const close = () => {
    setEditing(null);
    setNewCat('');
  };

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const webp = await fileToWebp(file);
      setForm((f) => ({ ...f, img: webp }));
    } catch (err) {
      showToast(err.message || 'Görsel yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  const addNewCategory = () => {
    const ok = addCategory(newCat);
    if (ok) {
      setForm((f) => ({ ...f, category: newCat.trim() }));
      showToast(`"${newCat.trim()}" kategorisi eklendi`);
      setNewCat('');
    } else {
      showToast('Kategori zaten var veya boş');
    }
  };

  const save = () => {
    if (!form.title.trim()) return showToast('Ürün adı gerekli');
    if (!form.category) return showToast('Kategori seçin');
    if (editing === 'new') {
      addProduct(form);
      showToast('Ürün eklendi');
    } else {
      updateProduct(editing.id, form);
      showToast('Ürün güncellendi');
    }
    close();
  };

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2 className="admin-h2">Ürünler ({products.length})</h2>
        <button className="mini-btn" onClick={openNew}>
          + Yeni Ürün
        </button>
      </div>

      {/* Kategori yönetimi */}
      <div className="cat-manager">
        <span className="cat-manager-label">Kategoriler:</span>
        {categories.map((c) => (
          <span className="cat-chip" key={c}>
            {c}
            <button
              title="Sil"
              onClick={() => {
                deleteCategory(c);
                showToast(`"${c}" kaldırıldı`);
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Ürün listesi */}
      <div className="admin-product-list">
        {products.map((p) => (
          <div className="admin-product-row" key={p.id}>
            <Thumb src={p.img} alt={p.title} className="apr-thumb" />
            <div className="apr-info">
              <strong>{p.title}</strong>
              <span>{p.category || '—'}</span>
            </div>
            <div className="apr-prices">
              <span>Per: {formatPrice(p.price)}</span>
              <span>Tem: {formatPrice(p.priceTemsilci)}</span>
            </div>
            <span className={`mini-status ${p.inStock ? 'approved' : 'rejected'}`}>
              {p.inStock ? 'Stokta' : 'Tükendi'}
            </span>
            <div className="apr-actions">
              <button className="mini-btn" onClick={() => openEdit(p)}>
                Düzenle
              </button>
              <button
                className="reject-btn small"
                onClick={() => {
                  if (confirm(`"${p.title}" silinsin mi?`)) {
                    deleteProduct(p.id);
                    showToast('Ürün silindi');
                  }
                }}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ürün formu (modal) */}
      {editing && (
        <div className="admin-modal-overlay" onClick={close}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing === 'new' ? 'Yeni Ürün' : 'Ürünü Düzenle'}</h3>

            <div className="admin-form-grid">
              <label className="af-full">
                Ürün Adı
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ürün adı"
                />
              </label>

              {/* Kategori + yeni kategori ekleme */}
              <label className="af-full">
                Kategori
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <div className="af-full new-cat-row">
                <input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="+ Yeni kategori adı"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewCategory())}
                />
                <button type="button" className="mini-btn" onClick={addNewCategory}>
                  Kategori Ekle
                </button>
              </div>

              {/* Görsel yükleme (otomatik WebP) */}
              <div className="af-full image-upload">
                <Thumb src={form.img} alt="" className="upload-preview" />
                <div>
                  <label className="upload-btn">
                    {uploading ? 'Dönüştürülüyor…' : 'Görsel Yükle'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={onImage}
                    />
                  </label>
                  <p className="upload-hint">
                    Her format otomatik <strong>WebP</strong>'ye çevrilir.
                  </p>
                  {form.img && (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setForm({ ...form, img: '' })}
                    >
                      Görseli kaldır
                    </button>
                  )}
                </div>
              </div>

              <label>
                Perakendeci Fiyatı (₺)
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label>
                Temsilci Fiyatı (₺)
                <input
                  type="number"
                  value={form.priceTemsilci}
                  onChange={(e) =>
                    setForm({ ...form, priceTemsilci: e.target.value })
                  }
                />
              </label>

              <label>
                Rozet
                <select
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                >
                  <option value="">Yok</option>
                  <option value="Yeni">Yeni</option>
                  <option value="Çok Satan">Çok Satan</option>
                  <option value="Popüler">Popüler</option>
                </select>
              </label>
              <label className="af-check">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                />
                Stokta
              </label>

              <label className="af-full">
                Açıklama
                <textarea
                  rows={3}
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="Ürün açıklaması"
                />
              </label>
            </div>

            <div className="admin-modal-actions">
              <button className="logout-btn" onClick={close}>
                Vazgeç
              </button>
              <button className="checkout-btn" onClick={save}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------- SİPARİŞLER ---------------- */
function OrdersTab({ auth, showToast }) {
  const { orders, updateOrderStatus, deleteOrder } = auth;
  const [filter, setFilter] = useState('Tümü');
  const [open, setOpen] = useState(null);

  const list = orders.filter((o) => filter === 'Tümü' || o.status === filter);

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2 className="admin-h2">Siparişler ({orders.length})</h2>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>Tümü</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <p className="account-empty">Sipariş yok.</p>
      ) : (
        <div className="order-admin-list">
          {list.map((o) => (
            <div className="order-admin-card" key={o.code}>
              <div className="oac-head" onClick={() => setOpen(open === o.code ? null : o.code)}>
                <div>
                  <strong>{o.code}</strong>
                  <span className="oac-date">
                    {new Date(o.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="oac-right">
                  <strong>{formatPrice(o.total)}</strong>
                  <select
                    value={o.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      updateOrderStatus(o.code, e.target.value);
                      showToast('Sipariş durumu güncellendi');
                    }}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {open === o.code && (
                <div className="oac-detail">
                  <div className="oac-items">
                    {(o.items || []).map((it, i) => (
                      <div key={i} className="oac-item">
                        <span>
                          {it.title} × {it.qty}
                        </span>
                        <span>{formatPrice(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="oac-meta">
                    <p>
                      <strong>Müşteri:</strong> {o.customerName || '—'} ·{' '}
                      {o.phone || '—'}
                    </p>
                    <p>
                      <strong>Adres:</strong> {o.address || '—'}
                    </p>
                    {o.note && (
                      <p>
                        <strong>Not:</strong> {o.note}
                      </p>
                    )}
                  </div>
                  <div className="oac-actions">
                    {o.phone && (
                      <a
                        className="mini-btn wa"
                        href={waLink(o.phone)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp'tan Yaz
                      </a>
                    )}
                    <button
                      className="reject-btn small"
                      onClick={() => {
                        if (confirm('Sipariş silinsin mi?')) {
                          deleteOrder(o.code);
                          showToast('Sipariş silindi');
                        }
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- ÜYELER ---------------- */
function MembersTab({ auth, showToast }) {
  const {
    users,
    approveUser,
    rejectUser,
    setUserTier,
    suspendUser,
    deleteUser,
    setUserNote,
    getUserOrders,
  } = auth;
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);

  const order = { pending: 0, approved: 1, suspended: 2, rejected: 3 };
  const list = [...users]
    .filter((u) => filter === 'all' || u.status === filter)
    .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

  const filters = [
    { k: 'all', l: 'Tümü' },
    { k: 'pending', l: 'Bekleyen' },
    { k: 'approved', l: 'Onaylı' },
    { k: 'rejected', l: 'Reddedilen' },
    { k: 'suspended', l: 'Askıda' },
  ];

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2 className="admin-h2">Üyeler ({users.length})</h2>
        <div className="filter-chips">
          {filters.map((f) => (
            <button
              key={f.k}
              className={`chip${filter === f.k ? ' active' : ''}`}
              onClick={() => setFilter(f.k)}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="account-empty">Bu filtrede üye yok.</p>
      ) : (
        <div className="admin-cards">
          {list.map((u) => {
            const userOrders = getUserOrders(u.id);
            return (
              <div className="pending-card" key={u.id}>
                <div className="app-card-head">
                  <strong>{u.companyName || u.fullName}</strong>
                  <span className={`mini-status ${u.status}`}>
                    {statusLabel(u.status)}
                  </span>
                </div>
                <ul className="account-info">
                  <li>
                    <span>Yetkili</span>
                    <strong>{u.fullName}</strong>
                  </li>
                  <li>
                    <span>Telefon</span>
                    <strong>{u.phone || '—'}</strong>
                  </li>
                  <li>
                    <span>E-posta</span>
                    <strong>{u.email}</strong>
                  </li>
                  <li>
                    <span>Tarih</span>
                    <strong>
                      {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                    </strong>
                  </li>
                  <li>
                    <span>Sipariş</span>
                    <strong>{userOrders.length}</strong>
                  </li>
                </ul>

                <div className="pending-actions">
                  {u.status === 'pending' && (
                    <ApproveControl
                      requested={u.requestedType}
                      onApprove={(tier) => {
                        approveUser(u.id, tier);
                        showToast(`${u.companyName} onaylandı`);
                      }}
                      onReject={() => {
                        rejectUser(u.id);
                        showToast('Reddedildi');
                      }}
                    />
                  )}
                  {u.status === 'approved' && (
                    <>
                      <label>Seviye</label>
                      <select
                        value={u.tier || 'perakende'}
                        onChange={(e) => {
                          setUserTier(u.id, e.target.value);
                          showToast('Seviye güncellendi');
                        }}
                      >
                        <option value="perakende">Perakendeci</option>
                        <option value="temsilci">Temsilci</option>
                      </select>
                      <button
                        className="reject-btn"
                        onClick={() => {
                          suspendUser(u.id);
                          showToast('Askıya alındı');
                        }}
                      >
                        Askıya Al
                      </button>
                    </>
                  )}
                  {(u.status === 'rejected' || u.status === 'suspended') && (
                    <button
                      className="approve-btn"
                      onClick={() => {
                        approveUser(u.id, u.tier || u.requestedType || 'perakende');
                        showToast('Onaylandı');
                      }}
                    >
                      ✓ Onayla
                    </button>
                  )}
                  <button
                    className="link-btn danger"
                    onClick={() => {
                      if (confirm('Üye kalıcı olarak silinsin mi?')) {
                        deleteUser(u.id);
                        showToast('Üye silindi');
                      }
                    }}
                  >
                    Sil
                  </button>
                </div>

                <button
                  className="link-btn"
                  onClick={() => setOpen(open === u.id ? null : u.id)}
                >
                  {open === u.id ? 'Notu gizle' : 'Not ekle / siparişler'}
                </button>
                {open === u.id && (
                  <div className="member-extra">
                    <textarea
                      rows={2}
                      placeholder="Üye hakkında not…"
                      defaultValue={u.note || ''}
                      onBlur={(e) => setUserNote(u.id, e.target.value)}
                    />
                    {userOrders.length > 0 && (
                      <div className="member-orders">
                        {userOrders.map((o) => (
                          <div className="dash-row" key={o.code}>
                            <strong>{o.code}</strong>
                            <span>{formatPrice(o.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ApproveControl({ requested, onApprove, onReject }) {
  const [tier, setTier] = useState(requested || 'perakende');
  return (
    <>
      <label>Seviye ata</label>
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
  );
}

/* ---------------- AYARLAR ---------------- */
function SettingsTab({ showToast }) {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState(settings);

  const save = () => {
    updateSettings(form);
    showToast('Ayarlar kaydedildi');
  };

  return (
    <section className="admin-section">
      <h2 className="admin-h2">Ayarlar</h2>
      <div className="settings-form">
        <label>
          WhatsApp Numarası (90 ile, boşluksuz)
          <input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="905551112233"
          />
        </label>
        <label>
          Mağaza Adı
          <input
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          />
        </label>
        <label>
          İletişim E-postası
          <input
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
          />
        </label>
        <label>
          Üst Şerit Yazısı
          <input
            value={form.topBar}
            onChange={(e) => setForm({ ...form, topBar: e.target.value })}
          />
        </label>
        <label>
          Yönetici Şifresi
          <input
            type="text"
            value={form.adminPassword}
            onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
          />
        </label>
        <button className="checkout-btn" onClick={save}>
          Ayarları Kaydet
        </button>
        <p className="upload-hint">
          ⚠️ Demo modunda bu ayarlar bu tarayıcıda saklanır. Veritabanı
          bağlanınca kalıcı olacak.
        </p>
      </div>
    </section>
  );
}

function statusLabel(s) {
  return s === 'approved'
    ? 'Onaylı'
    : s === 'rejected'
    ? 'Reddedildi'
    : s === 'suspended'
    ? 'Askıda'
    : 'Beklemede';
}
