import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Tek sayfa: ?token varsa "yeni şifre belirle", yoksa "e-posta ile link iste".
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  return token ? <SetNewPassword token={token} /> : <RequestLink />;
}

// 1) E-posta gir → sıfırlama bağlantısı gönderilsin
function RequestLink() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await forgotPassword(email);
    setBusy(false);
    setSent(true); // güvenlik: e-posta var/yok fark etmeksizin aynı mesaj
  };

  return (
    <AuthShell>
      <motion.div className="auth-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="auth-title">Şifremi Unuttum</h1>
        {sent ? (
          <>
            <div className="success-icon">📨</div>
            <p className="auth-sub">
              Eğer bu e-posta sistemde kayıtlıysa, şifre sıfırlama bağlantısı
              gönderildi. Gelen kutunu (ve spam klasörünü) kontrol et.
            </p>
            <Link to="/giris" className="checkout-btn" style={{ display: 'block', textAlign: 'center' }}>
              Giriş Sayfasına Dön
            </Link>
          </>
        ) : (
          <>
            <p className="auth-sub">
              Kayıtlı e-postanı gir; şifreni sıfırlaman için bir bağlantı gönderelim.
            </p>
            <form onSubmit={submit}>
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label>E-Posta</label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="checkout-btn" disabled={busy}>
                {busy ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
              </button>
            </form>
            <p className="auth-foot">
              <Link to="/giris">Giriş sayfasına dön</Link>
            </p>
          </>
        )}
      </motion.div>
    </AuthShell>
  );
}

// 2) Token ile yeni şifre belirle
function SetNewPassword({ token }) {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (pw1.length < 4) return setErr('Şifre en az 4 karakter olmalı.');
    if (pw1 !== pw2) return setErr('Şifreler eşleşmiyor.');
    setBusy(true);
    const res = await resetPassword(token, pw1);
    setBusy(false);
    if (!res.ok) return setErr(res.error);
    setDone(true);
    setTimeout(() => navigate('/giris'), 1800);
  };

  return (
    <AuthShell>
      <motion.div className="auth-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="auth-title">Yeni Şifre Belirle</h1>
        {done ? (
          <>
            <div className="success-icon">✅</div>
            <p className="auth-sub">Şifren güncellendi. Giriş sayfasına yönlendiriliyorsun…</p>
          </>
        ) : (
          <>
            <p className="auth-sub">Yeni şifreni gir.</p>
            {err && <div className="auth-error">{err}</div>}
            <form onSubmit={submit}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Yeni Şifre</label>
                <input type="password" placeholder="••••••••" value={pw1} onChange={(e) => setPw1(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Yeni Şifre (Tekrar)</label>
                <input type="password" placeholder="••••••••" value={pw2} onChange={(e) => setPw2(e.target.value)} />
              </div>
              <button type="submit" className="checkout-btn" disabled={busy}>
                {busy ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </AuthShell>
  );
}
