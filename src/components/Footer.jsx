export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>İletişim Bilgileri</h4>
          <p>E-Posta: serapercan71@gmail.com</p>
          <p>Sipariş & İletişim: WhatsApp</p>
          <p>Çalışma Saatleri: 09:00 - 18:00</p>
        </div>
        <div className="footer-col">
          <h4>Hızlı Erişim</h4>
          <ul>
            <li>
              <a href="#">Hesabım</a>
            </li>
            <li>
              <a href="#">Yeni Gelenler</a>
            </li>
            <li>
              <a href="#">İletişim</a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Bilgilendirme</h4>
          <ul>
            <li>
              <a href="#">İptal ve İade Koşulları</a>
            </li>
            <li>
              <a href="#">Gizlilik Politikası</a>
            </li>
            <li>
              <a href="#">Üyelik Koşulları</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Serap Ercan. Tüm hakları saklıdır.</span>
        <span>Toptan & perakende tedarik</span>
      </div>
    </footer>
  );
}
