import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Her sayfa değişiminde otomatik en üste kaydırır.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
