import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Layout from './components/Layout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Favorites from './pages/Favorites.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Account from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';
import StaticPage from './pages/StaticPage.jsx';
import NotFound from './pages/NotFound.jsx';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Serev Tedarik';

// Sayfa başlıkları (SEO + sekme başlığı). Dinamik sayfalar (ürün detay)
// kendi başlığını ayrıca ayarlayabilir.
const PAGE_TITLES = {
  '/': 'Ana Sayfa',
  '/urunler': 'Tüm Ürünler',
  '/favorilerim': 'Favorilerim',
  '/giris': 'Üye Girişi',
  '/kayit': 'Üyelik Başvurusu',
  '/hesabim': 'Hesabım',
  '/odeme': 'Sipariş / Ödeme',
  '/admin': 'Yönetici Paneli',
};

function App() {
  const location = useLocation();

  useEffect(() => {
    const t = PAGE_TITLES[location.pathname];
    document.title = t ? `${t} | ${STORE_NAME}` : STORE_NAME;
  }, [location.pathname]);

  return (
    <Layout>
      <ScrollToTop />
      {/* AnimatePresence: sayfa geçişlerinde akıcı fade/slide animasyonu */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/urunler" element={<Products />} />
          <Route path="/favorilerim" element={<Favorites />} />
          <Route path="/urun/:id" element={<ProductDetail />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/kayit" element={<Register />} />
          <Route path="/sifre-sifirla" element={<ResetPassword />} />
          <Route path="/hesabim" element={<Account />} />
          <Route
            path="/odeme"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          {/* /admin kendi yönetici girişini içerir (müşteri girişinden ayrı) */}
          <Route path="/admin" element={<Admin />} />
          {/* Statik bilgi sayfaları: /sayfa/hakkimizda, /sayfa/gizlilik vb. */}
          <Route path="/sayfa/:slug" element={<StaticPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Analytics />
      <SpeedInsights />
    </Layout>
  );
}

export default App;
