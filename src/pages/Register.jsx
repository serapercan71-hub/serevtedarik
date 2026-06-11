import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const initial = {
  companyName: '',
  taxNo: '',
  fullName: '',
  email: '',
  phone: '',
  requestedType: 'perakende',
  password: '',
  password2: '',
};

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.companyName.trim()) er.companyName = 'Firma adı gerekli';
    if (!form.fullName.trim()) er.fullName = 'Yetkili adı gerekli';
    if (!/\S+@\S+\.\S+/.test(form.email)) er.email = 'Geçerli e-posta girin';
    if (form.phone.replace(/\D/g, '').length < 10) er.phone = 'Geçerli telefon girin';
    if (form.password.length < 4) er.password = 'En az 4 karakter';
    if (form.password !== form.password2) er.password2 = 'Şifreler eşleşmiyor';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = register(form);
    if (!res.ok) {
      setErrors({ email: res.error });
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <AuthShell>
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="success-icon">📨</div>
          <h1 className="auth-title">Başvurun Alındı!</h1>
          <p className="auth-sub">
            Üyelik başvurunuz alınmıştır. Onaylandıktan sonra fiyatları
            görebilir ve sipariş oluşturabilirsiniz.
          </p>
          <Link to="/giris" className="checkout-btn" style={{ display: 'block', textAlign: 'center' }}>
            Giriş Sayfasına Git
          </Link>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <motion.div
        className="auth-card wide"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="auth-title">Üyelik Başvurusu</h1>
        <p className="auth-sub">
          Başvurun yetkili onayından sonra aktifleşir. Onaylanınca fiyatları
          görebilirsin.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Field label="Firma Adı" value={form.companyName} onChange={update('companyName')} error={errors.companyName} placeholder="Firma / Mağaza adı" />
            <Field label="Vergi No (opsiyonel)" value={form.taxNo} onChange={update('taxNo')} placeholder="Vergi numarası" />
          </div>
          <div className="form-row">
            <Field label="Yetkili Adı Soyadı" value={form.fullName} onChange={update('fullName')} error={errors.fullName} placeholder="Ad Soyad" />
            <Field label="Telefon" value={form.phone} onChange={update('phone')} error={errors.phone} placeholder="05XX XXX XX XX" />
          </div>
          <Field label="E-Posta" type="email" value={form.email} onChange={update('email')} error={errors.email} placeholder="ornek@mail.com" full />

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Üyelik Tipi (talep)</label>
            <select value={form.requestedType} onChange={update('requestedType')}>
              <option value="perakende">Perakendeci</option>
              <option value="temsilci">Temsilci</option>
            </select>
          </div>

          <div className="form-row">
            <Field label="Şifre" type="password" value={form.password} onChange={update('password')} error={errors.password} placeholder="••••••••" />
            <Field label="Şifre (Tekrar)" type="password" value={form.password2} onChange={update('password2')} error={errors.password2} placeholder="••••••••" />
          </div>

          <button type="submit" className="checkout-btn" style={{ marginTop: 8 }}>
            Başvuruyu Gönder
          </button>
        </form>

        <p className="auth-foot">
          Zaten üye misin? <Link to="/giris">Giriş yap</Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}

function Field({ label, error, full, ...props }) {
  return (
    <div
      className={`form-group${error ? ' field-error' : ''}`}
      style={full ? { marginBottom: 20 } : undefined}
    >
      <label>{label}</label>
      <input {...props} />
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
