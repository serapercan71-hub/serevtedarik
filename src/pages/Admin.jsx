import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useCart, formatPrice } from '../context/CartContext.jsx';
import { TIERS } from '../data/store.js';
import Thumb from '../components/Thumb.jsx';
import { IconShield } from '../components/icons.jsx';
import { fileToWebp } from '../lib/image.js';
import AdminLogin from './AdminLogin.jsx';

const TABS = [
  { key: 'panel', label: 'Panel' },
  { key: 'basvurular', label: 'Başvurular' },
  { key: 'urunler', label: 'Ürünler' },
  { key: 'siparisler', label: 'Siparişler' },
  { key: 'uyeler', label: 'Üyeler' },
  { key: 'ayarlar', label: 'Ayarlar' },
];

const ORDER_STATUSES = [
  'Onay bekliyor',
  'Hazırlanıyor',
  'Kargolandı',
  'Tamamlandı',
  'İptal',
];

function waLink(phone, text = '') {
  let p = (phone || '').replace(/\D/g, '');
  if (p.startsWith('0')) p = '90' + p.slice(1);
  else if (!p.startsWith('90')) p = '90' + p;
  return `https://wa.me/${p}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export default function Admin() {
  const { isAdmin, logout, users, loading } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [tab, setTab] = useState('panel');

  if (loading) return null; // oturum yükleniyor
  if (!isAdmin) return <AdminLogin />;

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link to="/" className="logo">
            <img src="/img/logo.png" alt="Serev Tedarik" className="logo-img" />
          </Link>
          <div className="admin-title">
            <span className="shield-badge">
              <IconShield width={22} height={22} />
            </span>
            <div>
              <strong>Yönetici Paneli</strong>
              <span>{settings.storeName} yönetim merkezi</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Çıkış
          </button>
        </div>
      </header>

      <div className="container admin-page">
        <nav className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`admin-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === 'basvurular' && (
                <span
                  className={`tab-count${pendingCount > 0 ? ' hot' : ''}`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {tab === 'panel' && <Dashboard onGo={setTab} />}
        {tab === 'basvurular' && (
          <MembersAdmin initialFilter="pending" title="Üyelik Başvuruları" />
        )}
        {tab === 'urunler' && <ProductsAdmin />}
        {tab === 'siparisler' && <OrdersAdmin />}
        {tab === 'uyeler' && <MembersAdmin initialFilter="all" title="Tüm Üyeler" />}
        {tab === 'ayarlar' && <SettingsAdmin />}
      </div>
    </motion.div>
  );
}

/* ============================ PANEL ============================ */
function Dashboard({ onGo }) {
  const { users, orders } = useAuth();
  const { products } = useCatalog();
  const pending = users.filter((u) => u.status === 'pending').length;
  const members = users.length;

  const cards = [
    { label: 'Bekleyen Başvuru', value: pending, tab: 'uyeler', accent: pending > 0 },
    { label: 'Toplam Üye', value: members, tab: 'uyeler' },
    { label: 'Sipariş', value: orders.length, tab: 'siparisler' },
    { label: 'Ürün', value: products.length, tab: 'urunler' },
  ];

  return (
    <div>
      <div className="dash-cards">
        {cards.map((c) => (
          <button
            key={c.label}
            className={`dash-card${c.accent ? ' accent' : ''}`}
            onClick={() => onGo(c.tab)}
          >
            <span className="dash-value">{c.value}</span>
            <span className="dash-label">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="dash-grid">
        <div className="account-card">
          <h3>Son Siparişler</h3>
          {orders.length === 0 ? (
            <p className="account-empty">Henüz sipariş yok.</p>
          ) : (
            <div className="order-list">
              {orders.slice(0, 5).map((o) => (
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

        <div className="account-card">
          <h3>Son Başvurular</h3>
          {users.length === 0 ? (
            <p className="account-empty">Henüz başvuru yok.</p>
          ) : (
            <div className="order-list">
              {users.slice(-5).reverse().map((u) => (
                <div className="order-row" key={u.id}>
                  <div>
                    <strong>{u.companyName || u.fullName}</strong>
                    <span className="order-date">{u.email}</span>
                  </div>
                  <span className={`mini-status ${u.status}`}>
                    {u.status === 'approved'
                      ? 'Onaylı'
                      : u.status === 'rejected'
                      ? 'Red'
                      : u.status === 'suspended'
                      ? 'Askıda'
                      : 'Beklemede'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================ ÜRÜNLER ============================ */
const BADGE_OPTIONS = [
  { value: '', label: 'Rozet Yok' },
  { value: 'Yeni', label: 'Yeni', tone: 'new' },
  { value: 'Çok Satan', label: 'Çok Satan', tone: 'hot' },
  { value: 'İndirim', label: 'İndirim', tone: 'discount' },
  { value: 'Tükendi', label: 'Tükendi', tone: 'sold' },
];

const emptyProduct = {
  title: '',
  desc: '',
  img: '',
  category: '',
  badge: '',
  price: '',
  priceTemsilci: '',
  inStock: true,
};

function ProductsAdmin() {
  const { products, categories, addProduct, updateProduct, deleteProduct } =
    useCatalog();
  const { showToast } = useCart();
  const [editing, setEditing] = useState(null); // ürün veya null
  const [catModal, setCatModal] = useState(false);

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-h2">
          Ürünler <span className="count-pill">{products.length}</span>
        </h2>
        <div className="toolbar-actions">
          <button className="btn-outline" onClick={() => setCatModal(true)}>
            + Kategori Ekle
          </button>
          <button
            className="btn-primary"
            onClick={() => setEditing({ ...emptyProduct })}
          >
            + Ürün Ekle
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="account-empty">Henüz ürün yok. “Ürün Ekle” ile başla.</p>
      ) : (
        <div className="admin-product-list">
          {products.map((p) => (
            <div className="admin-product-row" key={p.id}>
              <Thumb src={p.img} alt={p.title} className="apr-img" />
              <div className="apr-info">
                <strong>{p.title}</strong>
                <span>{p.category || 'Kategorisiz'}</span>
              </div>
              <div className="apr-prices">
                <span>Perakende: {formatPrice(Number(p.price) || 0)}</span>
                <span>Temsilci: {formatPrice(Number(p.priceTemsilci) || 0)}</span>
              </div>
              <span className={`apr-stock${p.inStock ? '' : ' out'}`}>
                {p.inStock ? 'Stokta' : 'Tükendi'}
              </span>
              <div className="apr-actions">
                <button className="mini-btn" onClick={() => setEditing(p)}>
                  Düzenle
                </button>
                <button
                  className="reject-btn"
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
      )}

      {editing && (
        <ProductForm
          initial={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            if (editing.id) {
              updateProduct(editing.id, data);
              showToast('Ürün güncellendi');
            } else {
              addProduct(data);
              showToast('Ürün eklendi');
            }
            setEditing(null);
          }}
          onOpenCat={() => setCatModal(true)}
        />
      )}

      {catModal && <CategoryModal onClose={() => setCatModal(false)} />}
    </div>
  );
}

function ProductForm({ initial, categories, onClose, onSave, onOpenCat }) {
  const [form, setForm] = useState(initial);
  const { showToast } = useCart();
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const webp = await fileToWebp(f);
      set('img', webp);
      showToast('Resim WebP’ye çevrildi');
    } catch (err) {
      showToast(err.message || 'Resim yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    if (!form.title.trim()) return showToast('Ürün adı gir');
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{initial.id ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h3>
          <button className="close-cart" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Resim */}
          <div className="img-upload">
            <Thumb src={form.img} alt="Önizleme" className="img-upload-preview" />
            <div>
              <label className="btn-outline upload-label">
                {uploading ? 'Çevriliyor…' : 'Resim Seç'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  hidden
                />
              </label>
              {form.img && (
                <button className="text-btn" onClick={() => set('img', '')}>
                  Kaldır
                </button>
              )}
              <p className="hint-sm">Her format otomatik WebP’ye çevrilir.</p>
            </div>
          </div>

          <div className="form-group">
            <label>Ürün Adı</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              rows={3}
              value={form.desc}
              onChange={(e) => set('desc', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Kategori</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                <option value="">Seçiniz</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn-outline"
              style={{ alignSelf: 'flex-end' }}
              onClick={onOpenCat}
              type="button"
            >
              + Yeni Kategori
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Perakendeci Fiyatı (₺)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Temsilci Fiyatı (₺)</label>
              <input
                type="number"
                value={form.priceTemsilci}
                onChange={(e) => set('priceTemsilci', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rozet (opsiyonel)</label>
              <div className="badge-picker">
                {BADGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value || 'none'}
                    type="button"
                    className={`badge-chip ${opt.tone || ''} ${
                      form.badge === opt.value ? 'active' : ''
                    }`}
                    onClick={() => set('badge', opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="stock-toggle">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => set('inStock', e.target.checked)}
              />
              Stokta var
            </label>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn-outline" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn-primary" onClick={save}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ onClose }) {
  const { categories, addCategory, deleteCategory } = useCatalog();
  const { showToast } = useCart();
  const [name, setName] = useState('');

  const add = () => {
    if (!name.trim()) return;
    const ok = addCategory(name);
    showToast(ok ? 'Kategori eklendi' : 'Bu kategori zaten var');
    setName('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Kategoriler</h3>
          <button className="close-cart" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="cat-add-row">
            <input
              value={name}
              placeholder="Yeni kategori adı"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <button className="btn-primary" onClick={add}>
              Ekle
            </button>
          </div>
          <div className="cat-chips">
            {categories.map((c) => (
              <span className="cat-chip" key={c}>
                {c}
                <button
                  onClick={() => {
                    deleteCategory(c);
                    showToast('Kategori silindi');
                  }}
                  title="Sil"
                >
                  ×
                </button>
              </span>
            ))}
            {categories.length === 0 && (
              <p className="account-empty">Henüz kategori yok.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ SİPARİŞLER ============================ */
function OrdersAdmin() {
  const { orders, updateOrderStatus, deleteOrder } = useAuth();
  const { showToast } = useCart();
  const [filter, setFilter] = useState('Tümü');
  const [open, setOpen] = useState(null);

  const list =
    filter === 'Tümü' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-h2">
          Siparişler <span className="count-pill">{orders.length}</span>
        </h2>
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
        <div className="admin-order-list">
          {list.map((o) => (
            <div className="admin-order-card" key={o.code}>
              <div className="aoc-head" onClick={() => setOpen(open === o.code ? null : o.code)}>
                <div>
                  <strong>{o.code}</strong>
                  <span className="order-date">
                    {new Date(o.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="aoc-right">
                  <strong>{formatPrice(o.total)}</strong>
                  <select
                    className={`status-select s-${o.status.replace(/\s/g, '')}`}
                    value={o.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      updateOrderStatus(o.code, e.target.value);
                      showToast('Durum güncellendi');
                    }}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {open === o.code && (
                <div className="aoc-detail">
                  <div className="aoc-items">
                    {o.items?.map((i, idx) => (
                      <div key={idx} className="aoc-item">
                        <span>
                          {i.title} × {i.qty}
                        </span>
                        <span>{formatPrice((Number(i.price) || 0) * i.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="aoc-customer">
                    <p>
                      <strong>{o.customerName || '—'}</strong>
                    </p>
                    <p>{o.phone}</p>
                    <p>{o.email}</p>
                    <p>{o.address}</p>
                    {o.note && <p>Not: {o.note}</p>}
                  </div>
                  <div className="aoc-buttons">
                    {o.phone && (
                      <a
                        className="wa-resend-btn small"
                        href={waLink(
                          o.phone,
                          `Merhaba, ${o.code} numaralı siparişiniz hakkında...`
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🟢 WhatsApp’tan Yaz
                      </a>
                    )}
                    <button
                      className="reject-btn"
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
    </div>
  );
}

/* ============================ ÜYELER ============================ */
function MembersAdmin({ initialFilter = 'all', title = 'Tüm Üyeler' }) {
  const {
    users,
    approveUser,
    rejectUser,
    setUserTier,
    suspendUser,
    deleteUser,
    setUserNote,
    getUserOrders,
  } = useAuth();
  const { showToast } = useCart();
  const [filter, setFilter] = useState(initialFilter);

  const order = { pending: 0, approved: 1, suspended: 2, rejected: 3 };
  const list = [...users]
    .filter((u) => (filter === 'all' ? true : u.status === filter))
    .sort(
      (a, b) =>
        (order[a.status] ?? 9) - (order[b.status] ?? 9) ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-h2">
          {title} <span className="count-pill">{list.length}</span>
        </h2>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tümü</option>
          <option value="pending">Beklemede</option>
          <option value="approved">Onaylı</option>
          <option value="rejected">Reddedilmiş</option>
          <option value="suspended">Askıda</option>
        </select>
      </div>

      {list.length === 0 ? (
        <p className="account-empty">Kayıt yok.</p>
      ) : (
        <div className="admin-cards">
          {list.map((u) => (
            <MemberCard
              key={u.id}
              u={u}
              orders={getUserOrders(u.id)}
              onApprove={(tier) => {
                approveUser(u.id, tier);
                showToast(`${u.companyName} onaylandı`);
              }}
              onReject={() => {
                rejectUser(u.id);
                showToast('Reddedildi');
              }}
              onTier={(tier) => {
                setUserTier(u.id, tier);
                showToast('Seviye güncellendi');
              }}
              onSuspend={() => {
                suspendUser(u.id);
                showToast('Askıya alındı');
              }}
              onDelete={() => {
                if (confirm('Üye silinsin mi?')) {
                  deleteUser(u.id);
                  showToast('Üye silindi');
                }
              }}
              onNote={(note) => setUserNote(u.id, note)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({ u, orders, onApprove, onReject, onTier, onSuspend, onDelete, onNote }) {
  const [tier, setTier] = useState(u.tier || u.requestedType || 'perakende');
  const [note, setNote] = useState(u.note || '');
  const [showOrders, setShowOrders] = useState(false);

  const statusLabel = {
    pending: 'Beklemede',
    approved: 'Onaylı',
    rejected: 'Reddedildi',
    suspended: 'Askıda',
  }[u.status];

  return (
    <div className="pending-card">
      <div className="app-card-head">
        <strong>{u.companyName || u.fullName}</strong>
        <span className={`mini-status ${u.status}`}>{statusLabel}</span>
      </div>
      <ul className="account-info">
        <li>
          <span>Yetkili</span>
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
          <span>Başvuru</span>
          <strong>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</strong>
        </li>
        <li>
          <span>Üyelik Tipi</span>
          <strong>
            {u.status === 'approved' ? TIERS[u.tier]?.label || u.tier : '—'}
          </strong>
        </li>
      </ul>

      <div className="member-actions">
        {u.status === 'pending' && (
          <>
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
            <select
              value={u.tier || 'perakende'}
              onChange={(e) => onTier(e.target.value)}
            >
              <option value="perakende">Perakendeci</option>
              <option value="temsilci">Temsilci</option>
            </select>
            <button className="reject-btn" onClick={onSuspend}>
              Askıya Al
            </button>
          </>
        )}
        {(u.status === 'rejected' || u.status === 'suspended') && (
          <button className="approve-btn" onClick={() => onApprove(tier)}>
            ✓ Onayla
          </button>
        )}
        <button className="text-btn danger" onClick={onDelete}>
          Sil
        </button>
      </div>

      <div className="member-extra">
        <button
          className="text-btn"
          onClick={() => setShowOrders((s) => !s)}
        >
          Siparişleri ({orders.length}) {showOrders ? '▲' : '▼'}
        </button>
        {showOrders && (
          <div className="order-list compact">
            {orders.length === 0 ? (
              <p className="account-empty">Sipariş yok.</p>
            ) : (
              orders.map((o) => (
                <div className="order-row" key={o.code}>
                  <strong>{o.code}</strong>
                  <span>{formatPrice(o.total)}</span>
                </div>
              ))
            )}
          </div>
        )}
        <div className="note-row">
          <input
            value={note}
            placeholder="Üye notu..."
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => onNote(note)}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================ AYARLAR ============================ */
function SettingsAdmin() {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useCart();
  const [form, setForm] = useState(settings);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const save = () => {
    updateSettings(form);
    showToast('Ayarlar kaydedildi');
  };

  return (
    <div className="settings-wrap">
      <h2 className="admin-h2">Ayarlar</h2>
      <div className="account-card">
        <div className="form-group">
          <label>Mağaza Adı</label>
          <input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>WhatsApp Numarası (905XXXXXXXXX)</label>
          <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
        </div>
        <div className="form-group">
          <label>İletişim E-postası</label>
          <input value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Üst Şerit Yazısı</label>
          <input value={form.topBar} onChange={(e) => set('topBar', e.target.value)} />
        </div>
        <button className="btn-primary" onClick={save}>
          Ayarları Kaydet
        </button>
      </div>

      <PasswordCard />
    </div>
  );
}

// Şifre değiştirme: yöneticinin kayıtlı e-postasına sıfırlama bağlantısı gönderir.
function PasswordCard() {
  const { user, forgotPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    await forgotPassword(user?.email);
    setBusy(false);
    setSent(true);
  };

  return (
    <div className="account-card" style={{ marginTop: 18 }}>
      <h3 style={{ marginBottom: 10 }}>Şifre Değiştir</h3>
      {sent ? (
        <p className="auth-sub" style={{ margin: 0 }}>
          ✅ Şifre sıfırlama bağlantısı <b>{user?.email}</b> adresine gönderildi.
          E-postandaki bağlantıdan yeni şifreni belirleyebilirsin (1 saat geçerli).
        </p>
      ) : (
        <>
          <p className="auth-sub" style={{ marginTop: 0 }}>
            Güvenlik için şifre, kayıtlı e-postana ({user?.email}) gönderilen
            bağlantı üzerinden değiştirilir.
          </p>
          <button className="btn-primary" onClick={send} disabled={busy}>
            {busy ? 'Gönderiliyor…' : 'Şifre Sıfırlama Bağlantısı Gönder'}
          </button>
        </>
      )}
    </div>
  );
}
