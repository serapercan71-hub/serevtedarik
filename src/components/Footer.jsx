import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>İletişim Bilgileri</h4>
          <p>E-Posta: {settings.contactEmail}</p>
          <p>Sipariş & İletişim: WhatsApp</p>
          <p>Çalışma Saatleri: 09:00 - 18:00</p>
        </div>
        <div className="footer-col">
          <h4>Hızlı Erişim</h4>
          <ul>
            <li>
              <Link to="/hesabim">Hesabım</Link>
            </li>
            <li>
              <Link to="/urunler">Tüm Ürünler</Link>
            </li>
            <li>
              <Link to="/sayfa/hakkimizda">Hakkımızda</Link>
            </li>
            <li>
              <Link to="/sayfa/iletisim">İletişim</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Bilgilendirme</h4>
          <ul>
            <li>
              <Link to="/sayfa/iade-iptal">İptal ve İade Koşulları</Link>
            </li>
            <li>
              <Link to="/sayfa/gizlilik">Gizlilik Politikası &amp; KVKK</Link>
            </li>
            <li>
              <Link to="/sayfa/mesafeli-satis">Mesafeli Satış Sözleşmesi</Link>
            </li>
            <li>
              <Link to="/sayfa/uyelik-kosullari">Üyelik Koşulları</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} {settings.storeName || 'Serap Ercan'}. Tüm hakları saklıdır.</span>
        <span>Toptan & perakende tedarik</span>
      </div>
    </footer>
  );
}
