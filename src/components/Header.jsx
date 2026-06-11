import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import {
  IconInstagram,
  IconHeart,
  IconUser,
  IconCart,
  IconShield,
} from './icons.jsx';

export default function Header() {
  const [sticky, setSticky] = useState(false);
  const { totalItems, openCart } = useCart();
  const { user, isAdmin, isMember } = useAuth();
  const { count: favCount } = useFavorites();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const pending = isMember && user.status === 'pending';

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/urunler?q=${encodeURIComponent(q)}` : '/urunler');
  };

  return (
    <>
      <div className="top-bar">
        Toptan & perakende tedarik · Üye girişi yaparak özel fiyatlarınızı görün
      </div>

      <header className={`site-header${sticky ? ' sticky' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="logo">
            <img src="/img/logo.png" alt="Serap Ercan Logo" className="logo-img" />
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
              className="icon-btn"
            >
              <IconInstagram />
            </a>

            <Link to="/favorilerim" className="icon-btn" title="Favorilerim">
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
                <Link to="/giris" className="icon-btn" title="Üye Girişi">
                  <IconUser />
                </Link>
                <Link to="/kayit" className="join-btn">
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

            {/* Yönetici paneli girişi (her durumda erişilebilir, sade) */}
            <Link
              to="/admin"
              className={`icon-btn admin-icon${isAdmin ? ' active' : ''}`}
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
        <NavLink to="/urunler">Tüm Ürünler</NavLink>
        <NavLink to="/urunler?kategori=Ev%20%26%20Ya%C5%9Fam">Ev & Yaşam</NavLink>
        <NavLink to="/urunler?kategori=Mutfak%20Gere%C3%A7leri">
          Mutfak Gereçleri
        </NavLink>
      </nav>
    </>
  );
}
