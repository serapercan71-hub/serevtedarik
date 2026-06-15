import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import {
  IconInstagram,
  IconHeart,
  IconUser,
  IconCart,
  IconShield,
  IconMenu,
  IconClose,
  IconSearch,
} from './icons.jsx';

export default function Header() {
  const [sticky, setSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { user, isAdmin, isMember } = useAuth();
  const { count: favCount } = useFavorites();
  const { settings } = useSettings();
  const { categories } = useCatalog();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const pending = isMember && user.status === 'pending';

  // Aktif menü vurgusu: /urunler'deki ?kategori= ve ?filter= parametrelerine göre.
  const sp = new URLSearchParams(location.search);
  const activeCat = sp.get('kategori');
  const activeFilter = sp.get('filter');
  const onProducts = location.pathname === '/urunler';
  const catClass = (cat) =>
    onProducts && activeCat === cat ? 'active' : undefined;
  const filterClass = (f) =>
    onProducts && activeFilter === f ? 'active' : undefined;

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobil menü açıkken arka plan kaymasın
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    setMenuOpen(false);
    navigate(q ? `/urunler?q=${encodeURIComponent(q)}` : '/urunler');
  };

  const go = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <>
      <div className="top-bar">{settings.topBar}</div>

      <header className={`site-header${sticky ? ' sticky' : ''}`}>
        <div className="container header-inner">
          <button
            className="icon-btn menu-toggle"
            title="Menü"
            onClick={() => setMenuOpen(true)}
          >
            <IconMenu />
          </button>

          <Link to="/" className="logo">
            <img src="/img/logo.png" alt="Serev Tedarik" className="logo-img" />
          </Link>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Ürün, kategori veya marka ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">ARA</button>
          </form>

          <div className="header-icons">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              title="Instagram"
              className="icon-btn hide-mobile"
            >
              <IconInstagram />
            </a>

            <Link
              to="/favorilerim"
              className="icon-btn hide-mobile"
              title="Favorilerim"
            >
              <IconHeart />
              {favCount > 0 && <span className="icon-badge">{favCount}</span>}
            </Link>

            <button className="icon-btn cart-trigger" onClick={openCart} title="Sepetim">
              <IconCart />
              {totalItems > 0 && <span className="icon-badge">{totalItems}</span>}
            </button>

            {/* Hesap durumu */}
            {!user && (
              <>
                <Link
                  to="/giris"
                  className="icon-btn hide-mobile"
                  title="Üye Girişi"
                >
                  <IconUser />
                </Link>
                <Link to="/kayit" className="join-btn hide-mobile">
                  Üye Ol
                </Link>
              </>
            )}
            {isMember && (
              <Link to="/hesabim" className="icon-btn account-icon" title="Hesabım">
                <IconUser />
                {pending && <span className="account-dot" title="Onay bekliyor" />}
              </Link>
            )}

            {/* Yönetici paneli girişi */}
            <Link
              to="/admin"
              className={`icon-btn admin-icon hide-mobile${isAdmin ? ' active' : ''}`}
              title="Yönetici Paneli"
            >
              <IconShield />
            </Link>
          </div>
        </div>
      </header>

      <nav className="main-nav">
        <NavLink to="/" end>
          Ana Sayfa
        </NavLink>
        <Link
          to="/urunler"
          className={onProducts && !activeCat && !activeFilter ? 'active' : undefined}
        >
          Tüm Ürünler
        </Link>
        <Link to="/urunler?filter=kampanya" className={filterClass('kampanya')}>
          Kampanyalar
        </Link>
        <Link to="/urunler?filter=cok-satan" className={filterClass('cok-satan')}>
          Çok Satanlar
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/urunler?kategori=${encodeURIComponent(cat)}`}
            className={catClass(cat)}
          >
            {cat}
          </Link>
        ))}
      </nav>

      {/* MOBİL MENÜ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.aside
              className="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="mobile-drawer-head">
                <img src="/img/logo.png" alt="Serev Tedarik" className="logo-img" />
                <button
                  className="icon-btn"
                  onClick={() => setMenuOpen(false)}
                  title="Kapat"
                >
                  <IconClose />
                </button>
              </div>

              <form className="mobile-search" onSubmit={handleSearch}>
                <IconSearch width={18} height={18} />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </form>

              <nav className="mobile-nav">
                <button onClick={() => go('/')}>Ana Sayfa</button>
                <button onClick={() => go('/urunler')}>Tüm Ürünler</button>
                <button onClick={() => go('/urunler?filter=kampanya')}>
                  Kampanyalar
                </button>
                <button onClick={() => go('/urunler?filter=cok-satan')}>
                  Çok Satanlar
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => go(`/urunler?kategori=${encodeURIComponent(cat)}`)}
                  >
                    {cat}
                  </button>
                ))}
                <button onClick={() => go('/favorilerim')}>
                  Favorilerim {favCount > 0 ? `(${favCount})` : ''}
                </button>
              </nav>

              <div className="mobile-auth">
                {!user && (
                  <>
                    <button className="checkout-btn" onClick={() => go('/giris')}>
                      Üye Girişi
                    </button>
                    <button className="mobile-join" onClick={() => go('/kayit')}>
                      Üye Ol — fiyatları gör
                    </button>
                  </>
                )}
                {isMember && (
                  <button className="checkout-btn" onClick={() => go('/hesabim')}>
                    Hesabım
                  </button>
                )}
                <button className="mobile-admin" onClick={() => go('/admin')}>
                  <IconShield width={16} height={16} /> Yönetici Paneli
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
