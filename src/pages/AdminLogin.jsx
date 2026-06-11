import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Yöneticiye özel ayrı giriş alanı (müşteri girişinden bağımsız).
export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = adminLogin(email, password);
    if (!res.ok) setError(res.error);
    // Başarılıysa oturum güncellenir, /admin paneli otomatik açılır.
  };

  return (
    <AuthShell>
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className="admin-login-pill">🔐 Yönetici Alanı</span>
        <h1 className="auth-title">Yönetici Girişi</h1>
        <p className="auth-sub">
          Bu alan yalnızca site yöneticisine özeldir.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Yönetici E-Postası</label>
            <input
              type="email"
              placeholder="admin@..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label>Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="checkout-btn">
            Yönetici Olarak Giriş Yap
          </button>
        </form>

        <p className="auth-foot">
          Müşteri misin? <Link to="/giris">Üye girişine git</Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
