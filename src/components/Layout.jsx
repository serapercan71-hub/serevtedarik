import { useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import WhatsAppFloat from './WhatsAppFloat.jsx';
import CartDrawer from './CartDrawer.jsx';
import Toast from './Toast.jsx';

// Kendi özel başlığını kullanan (standart Header/Footer almayan) sayfalar.
const BARE_ROUTES = ['/giris', '/kayit', '/admin', '/odeme'];

// Tüm sayfalarda ortak çerçeve: Header + Footer + WhatsApp + sepet + bildirim.
// Header/Footer route'a göre koşullanır; böylece her sayfada tek tek
// yazılmaz ve tutarsızlık (eksik footer/whatsapp) olmaz.
export default function Layout({ children }) {
  const { pathname } = useLocation();
  const bare = BARE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/')
  );

  return (
    <>
      {!bare && <Header />}
      {children}
      {!bare && <Footer />}
      {!bare && <WhatsAppFloat />}
      <CartDrawer />
      <Toast />
    </>
  );
}
