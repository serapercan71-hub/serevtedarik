import { Link } from 'react-router-dom';

// Giriş/Kayıt sayfaları için sade üst başlık + ortalanmış içerik.
export default function AuthShell({ children }) {
  return (
    <div className="auth-page">
      <header className="checkout-header">
        <div className="container header-inner">
          <Link to="/" className="back-to-cart">
            <span>←</span> Ana Sayfa
          </Link>
          <Link to="/" className="logo">
            <img src="/img/logo.png" alt="Serev Tedarik" className="logo-img" />
          </Link>
        </div>
      </header>
      <div className="auth-wrapper">{children}</div>
    </div>
  );
}
