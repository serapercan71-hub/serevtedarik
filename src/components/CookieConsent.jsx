import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'serapercan_cookie_consent';

// KVKK / çerez bilgilendirme şeridi. Kullanıcı kabul edince bir daha çıkmaz.
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* localStorage yoksa sessiz geç */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* yok say */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-bar" role="dialog" aria-label="Çerez bilgilendirmesi">
      <p className="cookie-text">
        Bu site, deneyimini iyileştirmek için çerezler kullanır. Detaylar için{' '}
        <Link to="/sayfa/gizlilik">Gizlilik Politikası &amp; KVKK</Link>{' '}
        metnini inceleyebilirsin.
      </p>
      <button className="cookie-btn" onClick={accept}>
        Kabul Et
      </button>
    </div>
  );
}
