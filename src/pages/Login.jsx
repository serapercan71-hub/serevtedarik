import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.status === 'approved') return navigate('/urunler');
    // onay bekleyen / reddedilen üye → durumunu görsün
    navigate('/hesabim');
  };

  return (
    <AuthShell>
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="auth-title">Üye Girişi</h1>
        <p className="auth-sub">
          Fiyatları görmek ve sipariş vermek için giriş yapın.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>E-Posta</label>
            <input
              type="email"
              placeholder="ornek@mail.com"
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
            Giriş Yap
          </button>
        </form>

        <p className="auth-foot">
          Hesabın yok mu? <Link to="/kayit">Üyelik başvurusu yap</Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
