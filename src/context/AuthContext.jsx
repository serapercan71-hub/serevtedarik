import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { ADMIN } from '../data/store.js';
import { useSettings } from './SettingsContext.jsx';

const AuthContext = createContext(null);

const USERS_KEY = 'serapercan_users';
const SESSION_KEY = 'serapercan_session';
const ORDERS_KEY = 'serapercan_orders';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const { settings } = useSettings();
  const [users, setUsers] = useState(() => load(USERS_KEY, []));
  const [session, setSession] = useState(() => load(SESSION_KEY, null));
  const [orders, setOrders] = useState(() => load(ORDERS_KEY, []));

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);
  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const user = useMemo(() => {
    if (!session) return null;
    if (session.role === 'admin') {
      return { role: 'admin', email: ADMIN.email, fullName: 'Yönetici' };
    }
    const live = users.find((u) => u.id === session.userId);
    return live ? { ...live, role: 'member' } : null;
  }, [session, users]);

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';
  const isApproved = isMember && user.status === 'approved';
  const priceTier = isApproved ? user.tier : null;

  // ---- KAYIT ----
  const register = useCallback(
    (form) => {
      const email = form.email.trim().toLowerCase();
      if (users.some((u) => u.email === email)) {
        return { ok: false, error: 'Bu e-posta ile zaten bir başvuru var.' };
      }
      if (email === ADMIN.email) {
        return { ok: false, error: 'Bu e-posta kullanılamaz.' };
      }

      // Her üye yalnızca 1 telefon numarasıyla kayıt olabilir (benzersiz).
      // Numarayı tek biçime getir: rakamları al, baştaki 0'ları ve 90 ülke
      // kodunu kaldır, çekirdek 10 haneyi "0XXXXXXXXXX" olarak sakla.
      const canonPhone = (s) => {
        let d = String(s || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^90/, '');
        return d.length === 10 ? '0' + d : '';
      };
      const phoneCanon = canonPhone(form.phone);
      if (!phoneCanon) {
        return { ok: false, error: 'Geçerli bir telefon numarası girin.' };
      }
      if (users.some((u) => canonPhone(u.phone) === phoneCanon)) {
        return {
          ok: false,
          error: 'Bu telefon numarası ile zaten bir kayıt var.',
        };
      }
      const newUser = {
        id: 'u' + Date.now(),
        companyName: form.companyName.trim(),
        taxNo: form.taxNo.trim(),
        fullName: form.fullName.trim(),
        email,
        phone: phoneCanon,
        password: form.password,
        requestedType: form.requestedType || 'perakende',
        status: 'pending',
        tier: null,
        note: '',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      return { ok: true };
    },
    [users]
  );

  // ---- ÜYE GİRİŞİ ----
  const login = useCallback(
    (email, password) => {
      const mail = email.trim().toLowerCase();
      if (mail === ADMIN.email) {
        return {
          ok: false,
          error: 'Bu alan üyelere özeldir. Yönetici girişini kullanın.',
        };
      }
      const found = users.find((u) => u.email === mail);
      if (!found || found.password !== password) {
        return { ok: false, error: 'E-posta veya şifre hatalı.' };
      }
      if (found.status === 'suspended') {
        return { ok: false, error: 'Üyeliğiniz askıya alınmış. İletişime geçin.' };
      }
      setSession({ role: 'member', userId: found.id });
      return { ok: true, role: 'member', status: found.status };
    },
    [users]
  );

  // ---- YÖNETİCİ GİRİŞİ (şifre ayarlardan, değiştirilebilir) ----
  const adminLogin = useCallback(
    (email, password) => {
      const mail = email.trim().toLowerCase();
      if (mail === ADMIN.email && password === settings.adminPassword) {
        setSession({ role: 'admin' });
        return { ok: true };
      }
      return { ok: false, error: 'Yönetici e-posta veya şifresi hatalı.' };
    },
    [settings.adminPassword]
  );

  const logout = useCallback(() => setSession(null), []);

  // ---- ADMIN: ÜYE İŞLEMLERİ ----
  const approveUser = useCallback((id, tier) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'approved', tier } : u))
    );
  }, []);
  const rejectUser = useCallback((id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'rejected', tier: null } : u))
    );
  }, []);
  const setUserTier = useCallback((id, tier) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, tier } : u)));
  }, []);
  const suspendUser = useCallback((id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'suspended' } : u))
    );
  }, []);
  const deleteUser = useCallback((id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);
  const setUserNote = useCallback((id, note) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, note } : u)));
  }, []);

  // ---- FİYAT (doğrudan üründen, seviyeye göre) ----
  const getProductPrice = useCallback(
    (product) => {
      if (!isApproved || !priceTier) return null;
      return priceTier === 'temsilci'
        ? Number(product.priceTemsilci ?? product.price)
        : Number(product.price);
    },
    [isApproved, priceTier]
  );

  // ---- SİPARİŞLER ----
  const addOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);
  const getUserOrders = useCallback(
    (userId) => orders.filter((o) => o.userId === userId),
    [orders]
  );
  const updateOrderStatus = useCallback((code, status) => {
    setOrders((prev) => prev.map((o) => (o.code === code ? { ...o, status } : o)));
  }, []);
  const deleteOrder = useCallback((code) => {
    setOrders((prev) => prev.filter((o) => o.code !== code));
  }, []);

  const value = {
    user,
    users,
    orders,
    isAdmin,
    isMember,
    isApproved,
    priceTier,
    register,
    login,
    adminLogin,
    logout,
    approveUser,
    rejectUser,
    setUserTier,
    suspendUser,
    deleteUser,
    setUserNote,
    getProductPrice,
    addOrder,
    getUserOrders,
    updateOrderStatus,
    deleteOrder,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return ctx;
}
