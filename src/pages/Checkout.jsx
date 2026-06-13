import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Thumb from '../components/Thumb.jsx';
import { useCart, formatPrice } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { generateOrderCode } from '../data/store.js';

const initialForm = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  district: '',
  note: '',
};

const cityNames = {
  34: 'İstanbul',
  '06': 'Ankara',
  35: 'İzmir',
  16: 'Bursa',
  '01': 'Adana',
};

export default function Checkout() {
  const { items, totalAmount, clearCart, showToast } = useCart();
  const { user, addOrder } = useAuth();
  const { settings } = useSettings();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null); // sipariş oluşunca dolar

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) er.email = 'Geçerli bir e-posta girin';
    if (form.phone.replace(/\D/g, '').length < 10)
      er.phone = 'Geçerli bir telefon girin';
    if (!form.firstName.trim()) er.firstName = 'Adınızı girin';
    if (!form.lastName.trim()) er.lastName = 'Soyadınızı girin';
    if (!form.address.trim()) er.address = 'Adres girin';
    if (!form.city) er.city = 'İl seçin';
    if (!form.district.trim()) er.district = 'İlçe girin';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  // WhatsApp mesajını oluştur (sipariş talebi — ödeme/kargo yok)
  const buildWhatsappText = (code) => {
    const lines = [];
    lines.push(`*${settings.storeName} - Sipariş Talebi*`);
    lines.push(`Sipariş Kodu: *${code}*`);
    lines.push('');
    lines.push('*Ürünler:*');
    items.forEach((i) => {
      lines.push(`• ${i.title} x${i.qty} = ${formatPrice(i.price * i.qty)}`);
    });
    lines.push('');
    lines.push(`*Toplam: ${formatPrice(totalAmount)}*`);
    lines.push('');
    lines.push('*Teslimat Bilgileri:*');
    lines.push(`Ad Soyad: ${form.firstName} ${form.lastName}`);
    lines.push(`Telefon: ${form.phone}`);
    lines.push(`E-posta: ${form.email}`);
    lines.push(
      `Adres: ${form.address}, ${form.district} / ${
        cityNames[form.city] || form.city
      }`
    );
    if (form.note.trim()) lines.push(`Not: ${form.note}`);
    lines.push('');
    lines.push('Sipariş talebimi iletiyorum. Detaylar için dönüş yapar mısınız?');
    return lines.join('\n');
  };

  const openWhatsapp = (code) => {
    const text = encodeURIComponent(buildWhatsappText(code));
    window.open(`https://wa.me/${settings.whatsapp}?text=${text}`, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Lütfen eksik alanları doldurun');
      return;
    }
    const code = generateOrderCode();
    // Sipariş özetini sakla (sepet temizlenecek)
    setOrder({
      code,
      items: [...items],
      total: totalAmount,
      name: `${form.firstName} ${form.lastName}`,
    });
    // Üyenin sipariş geçmişine kaydet
    if (user) {
      addOrder({
        code,
        userId: user.id,
        items: items.map((i) => ({
          title: i.title,
          qty: i.qty,
          price: i.price,
        })),
        total: totalAmount,
        status: 'Onay bekliyor',
        customerName: `${form.firstName} ${form.lastName}`,
        phone: form.phone,
        email: form.email,
        address: `${form.address}, ${form.district} / ${
          cityNames[form.city] || form.city
        }`,
        note: form.note,
        createdAt: new Date().toISOString(),
      });
    }
    openWhatsapp(code);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copy = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToast(`${label} kopyalandı`);
  };

  // ---- SİPARİŞ OLUŞTU EKRANI ----
  if (order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CheckoutHeader />
        <div className="container">
          <div className="order-success">
            <div className="success-icon">✅</div>
            <h1>Sipariş Talebin Alındı!</h1>
            <p className="success-sub">
              Teşekkürler {order.name}. Talebini tamamlamak için WhatsApp
              mesajını satıcıya gönder.
            </p>

            <div className="order-code-box">
              <span className="ocb-label">Sipariş Kodun</span>
              <span className="ocb-code">{order.code}</span>
              <button
                className="copy-btn"
                onClick={() => copy(order.code, 'Sipariş kodu')}
              >
                Kopyala
              </button>
            </div>

            <ol className="success-steps">
              <li>
                <strong>1. WhatsApp’tan gönder:</strong> Açılan WhatsApp
                sohbetindeki hazır mesajı satıcıya gönder (sipariş kodun ve
                ürünlerin mesajda hazır).
              </li>
              <li>
                <strong>2. Satıcı seninle iletişime geçecek:</strong> Sipariş
                detaylarını WhatsApp üzerinden netleştirip ürününü hazırlayıp
                kargoya verecek.
              </li>
            </ol>

            <button
              className="wa-resend-btn"
              onClick={() => openWhatsapp(order.code)}
            >
              <span>🟢</span> WhatsApp Mesajını Tekrar Aç
            </button>

            <Link to="/" className="back-home-link">
              ← Alışverişe devam et
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- BOŞ SEPET ----
  if (items.length === 0) {
    return (
      <>
        <CheckoutHeader />
        <div className="container empty-checkout">
          <h2 className="section-title">Sepetiniz boş</h2>
          <Link to="/urunler" className="home-btn">
            Alışverişe Başla
          </Link>
        </div>
      </>
    );
  }

  // ---- ÖDEME FORMU ----
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <CheckoutHeader />

      <form className="container checkout-wrapper" onSubmit={handleSubmit} noValidate>
        <div className="checkout-form-section">
          <h2 className="checkout-step-title">
            <span>1</span> İletişim Bilgileri
          </h2>
          <div className="form-row">
            <Field
              label="E-Posta Adresi"
              placeholder="ornek@mail.com"
              type="email"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
            />
            <Field
              label="Telefon Numarası"
              placeholder="05XX XXX XX XX"
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              error={errors.phone}
            />
          </div>

          <div className="divider" />

          <h2 className="checkout-step-title">
            <span>2</span> Teslimat Adresi
          </h2>
          <div className="form-row">
            <Field
              label="Adınız"
              placeholder="Adınız"
              value={form.firstName}
              onChange={update('firstName')}
              error={errors.firstName}
            />
            <Field
              label="Soyadınız"
              placeholder="Soyadınız"
              value={form.lastName}
              onChange={update('lastName')}
              error={errors.lastName}
            />
          </div>
          <Field
            label="Açık Adres"
            placeholder="Mahalle, sokak, bina ve daire numarası..."
            value={form.address}
            onChange={update('address')}
            error={errors.address}
            full
          />
          <div className="form-row">
            <div className={`form-group${errors.city ? ' field-error' : ''}`}>
              <label>İl</label>
              <select value={form.city} onChange={update('city')}>
                <option value="">İl Seçiniz</option>
                <option value="34">İstanbul</option>
                <option value="06">Ankara</option>
                <option value="35">İzmir</option>
                <option value="16">Bursa</option>
                <option value="01">Adana</option>
              </select>
              {errors.city && <div className="error-text">{errors.city}</div>}
            </div>
            <Field
              label="İlçe"
              placeholder="İlçe giriniz"
              value={form.district}
              onChange={update('district')}
              error={errors.district}
            />
          </div>
          <Field
            label="Sipariş Notu (opsiyonel)"
            placeholder="Eklemek istediğin bir not var mı?"
            value={form.note}
            onChange={update('note')}
            full
          />

          <div className="payment-info-box">
            <div className="pi-icon">🟢</div>
            <div>
              <strong>Sipariş talebi WhatsApp ile iletilir</strong>
              <p>
                “Sipariş Talebini Gönder” butonuna bastığında WhatsApp açılır ve
                sipariş özetin satıcıya hazır mesaj olarak iletilir. Satıcı
                seninle iletişime geçip ürününü hazırlar ve kargoya verir.
              </p>
            </div>
          </div>
        </div>

        {/* SİPARİŞ ÖZETİ */}
        <div className="order-summary-section">
          <h3>Sipariş Özeti</h3>
          {items.map((item) => (
            <div className="summary-item" key={item.id}>
              <Thumb src={item.img} alt={item.title} className="summary-item-img" />
              <div className="summary-item-info">
                <div className="summary-item-title">{item.title}</div>
                <div className="summary-item-qty">{item.qty} Adet</div>
              </div>
              <div className="summary-item-price">
                {formatPrice(item.price * item.qty)}
              </div>
            </div>
          ))}

          <div className="summary-divider" />

          <div className="summary-line">
            <span>Ürünler Toplamı</span>
            <span style={{ fontWeight: 600 }}>{formatPrice(totalAmount)}</span>
          </div>

          <div className="summary-total">
            <span>Toplam Tutar</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>

          <button type="submit" className="checkout-btn wa-checkout">
            <span>🟢</span> Sipariş Talebini Gönder
          </button>

          <div className="ssl-badge">
            💬 Ödeme alınmaz — sipariş WhatsApp ile iletilir
          </div>
        </div>
      </form>
    </motion.div>
  );
}

function CheckoutHeader() {
  return (
    <header className="checkout-header">
      <div className="container header-inner">
        <Link to="/" className="back-to-cart">
          <span>←</span> Alışverişe Dön
        </Link>
        <Link to="/" className="logo">
          <img src="/img/logo.png" alt="Serap Ercan Logo" className="logo-img" />
        </Link>
      </div>
    </header>
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
