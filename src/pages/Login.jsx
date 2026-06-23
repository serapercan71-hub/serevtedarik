import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('phone'); // 'phone' | 'email'
  const [identifier, setIdentifier] = useState(''); // telefon ya da e-posta
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setIdentifier('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const creds =
      mode === 'phone'
        ? { phone: identifier, password }
        : { email: identifier, password };
    const res = await login(creds);
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
          Fiyatları görmek ve sipariş vermek için giriş yapın.
        </p>

        {/* Giriş yöntemi seçici */}
        <div className="login-mode-switch">
          <button
            type="button"
            className={mode === 'phone' ? 'active' : ''}
            onClick={() => switchMode('phone')}
          >
            📱 Telefon ile
          </button>
          <button
            type="button"
            className={mode === 'email' ? 'active' : ''}
            onClick={() => switchMode('email')}
          >
            ✉️ E-posta ile
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>{mode === 'phone' ? 'Telefon' : 'E-Posta'}</label>
            <input
              type={mode === 'phone' ? 'tel' : 'email'}
              inputMode={mode === 'phone' ? 'numeric' : 'email'}
              placeholder={mode === 'phone' ? '05XX XXX XX XX' : 'ornek@mail.com'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete={mode === 'phone' ? 'tel' : 'email'}
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
          <Link to="/sifre-sifirla">Şifremi unuttum</Link>
        </p>
        <p className="auth-foot">
          Hesabın yok mu? <Link to="/kayit">Üyelik başvurusu yap</Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
