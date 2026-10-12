import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await login({ phone, password });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.isAdmin) return navigate('/admin');
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
          Fiyatları görmek ve sipariş vermek için telefon numaran ve şifrenle
          giriş yap.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Telefon</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="05XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label>Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="checkout-btn" disabled={busy}>
            {busy ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>

        <p className="auth-foot" style={{ marginTop: 14 }}>
          Şifreni mi unuttun? Yöneticiyle iletişime geç.
        </p>
        <p className="auth-foot">
          Hesabın yok mu? <Link to="/kayit">Üyelik başvurusu yap</Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
