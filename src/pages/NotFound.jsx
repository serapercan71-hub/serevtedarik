import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="error-page">
      <motion.div
        className="error-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="error-code">404</div>
        <h1 className="error-title">Sayfa Bulunamadı</h1>
        <p className="error-desc">
          Aradığınız sayfayı bulamıyoruz. Sayfa kaldırılmış, ismi değiştirilmiş
          veya geçici olarak kullanım dışı olabilir.
        </p>
        <Link to="/" className="home-btn">
          Ana Sayfaya Dön
        </Link>
      </motion.div>
    </div>
  );
}
