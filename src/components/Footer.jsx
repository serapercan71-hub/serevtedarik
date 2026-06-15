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
          <p>
            Telefon / WhatsApp:{' '}
            <a href="tel:+905448641810">0544 864 18 10</a>
          </p>
          <p>E-Posta: {settings.contactEmail}</p>
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
        <span>© {year} {settings.storeName || 'Serev Tedarik'}. Tüm hakları saklıdır.</span>
        <span className="footer-credit">
          Tasarım:{' '}
          <a
            href="https://www.bariscreativedesign.com/"
            target="_blank"
            rel="noreferrer"
          >
            BarışCreativeDesign
          </a>
        </span>
      </div>
    </footer>
  );
}
