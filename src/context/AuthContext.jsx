import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { ADMIN } from '../data/store.js';

const AuthContext = createContext(null);

const USERS_KEY = 'serapercan_users';
const SESSION_KEY = 'serapercan_session';
const ORDERS_KEY = 'serapercan_orders';
const PRICES_KEY = 'serapercan_prices';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => load(USERS_KEY, []));
  const [session, setSession] = useState(() => load(SESSION_KEY, null));
  const [orders, setOrders] = useState(() => load(ORDERS_KEY, []));
  // Admin'in manuel girdiği fiyatlar: { [productId]: { perakende, temsilci } }
  const [productPrices, setProductPrices] = useState(() => load(PRICES_KEY, {}));

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
  useEffect(() => {
    localStorage.setItem(PRICES_KEY, JSON.stringify(productPrices));
  }, [productPrices]);

  // Oturumdaki kullanıcının güncel (canlı) hali — admin onayı anında yansır.
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
      const newUser = {
        id: 'u' + Date.now(),
        companyName: form.companyName.trim(),
        taxNo: form.taxNo.trim(),
        fullName: form.fullName.trim(),
        email,
        phone: form.phone.trim(),
        password: form.password,
        requestedType: form.requestedType || 'perakende',
        status: 'pending',
        tier: null,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      return { ok: true };
    },
    [users]
  );

  // ---- ÜYE GİRİŞİ (müşteri paneli) ----
  const login = useCallback(
    (email, password) => {
      const mail = email.trim().toLowerCase();
      // Admin bu formdan giremez — yönetici girişi ayrı.
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
      setSession({ role: 'member', userId: found.id });
      return { ok: true, role: 'member', status: found.status };
    },
    [users]
  );

  // ---- YÖNETİCİ GİRİŞİ (ayrı alan) ----
  const adminLogin = useCallback((email, password) => {
    const mail = email.trim().toLowerCase();
    if (mail === ADMIN.email && password === ADMIN.password) {
      setSession({ role: 'admin' });
      return { ok: true };
    }
    return { ok: false, error: 'Yönetici e-posta veya şifresi hatalı.' };
  }, []);

  const logout = useCallback(() => setSession(null), []);

  // ---- ADMIN İŞLEMLERİ ----
  const approveUser = useCallback((id, tier) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: 'approved', tier } : u
      )
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

  // ---- FİYATLAR ----
  // Ürünün her iki fiyatını çöz (admin override varsa onu, yoksa üründeki varsayılanı)
  const resolvePrices = useCallback(
    (product) => {
      const o = productPrices[product.id] || {};
      return {
        perakende: o.perakende ?? product.price,
        temsilci: o.temsilci ?? product.priceTemsilci ?? product.price,
      };
    },
    [productPrices]
  );

  // Oturumdaki üyenin seviyesine göre gösterilecek fiyat (erişim yoksa null)
  const getProductPrice = useCallback(
    (product) => {
      if (!isApproved || !priceTier) return null;
      return resolvePrices(product)[priceTier];
    },
    [isApproved, priceTier, resolvePrices]
  );

  // Admin: bir ürünün iki fiyatını manuel kaydet
  const setProductPrice = useCallback((productId, perakende, temsilci) => {
    setProductPrices((prev) => ({
      ...prev,
      [productId]: {
        perakende: Number(perakende),
        temsilci: Number(temsilci),
      },
    }));
  }, []);

  // ---- SİPARİŞLER ----
  const addOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const getUserOrders = useCallback(
    (userId) => orders.filter((o) => o.userId === userId),
    [orders]
  );

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
    productPrices,
    resolvePrices,
    getProductPrice,
    setProductPrice,
    addOrder,
    getUserOrders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return ctx;
}
