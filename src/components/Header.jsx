import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const [sticky, setSticky] = useState(false);
  const { totalItems, openCart } = useCart();
  const { user, isAdmin, isMember } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // 👤 ikonu hedefi oturuma göre
  const accountTo = isAdmin ? '/admin' : isMember ? '/hesabim' : '/giris';
  const accountTitle = isAdmin
    ? 'Yönetici Paneli'
    : isMember
    ? 'Hesabım'
    : 'Giriş Yap';
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
              <svg viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <Link
              to={accountTo}
              className="icon-btn account-icon"
              title={accountTitle}
            >
              👤
              {pending && <span className="account-dot" title="Onay bekliyor" />}
            </Link>
            <button className="cart-trigger" onClick={openCart} title="Sepeti Aç">
              🛒
              {totalItems > 0 && <span className="cart-counter">{totalItems}</span>}
            </button>
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
