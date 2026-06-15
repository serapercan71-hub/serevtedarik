import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

const AuthContext = createContext(null);

// Tüm API çağrıları için ortak yardımcı. Cookie tabanlı oturum (same-origin)
// otomatik gider. Ağ hatasında uygulama çökmesin diye try/catch.
async function api(path, options = {}) {
  try {
    const res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} };
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // admin: tüm üyeler
  const [orders, setOrders] = useState([]); // admin: tümü / üye: kendi siparişleri

  // ---- OTURUM ----
  const refreshUser = useCallback(async () => {
    const { data } = await api('/auth/me');
    setUser(data.user || null);
    return data.user || null;
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;
  const isMember = user?.role === 'member';
  const isApproved = isMember && user.status === 'approved';
  const priceTier = isApproved ? user.tier : null;

  // ---- ADMIN LİSTELERİ / ÜYE SİPARİŞLERİ ----
  const refreshUsers = useCallback(async () => {
    const { ok, data } = await api('/admin/users');
    if (ok) setUsers(data.users || []);
  }, []);
  const refreshOrders = useCallback(async () => {
    const { ok, data } = await api('/orders');
    if (ok) setOrders(data.orders || []);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      refreshUsers();
      refreshOrders();
    } else if (isMember) {
      refreshOrders();
      setUsers([]);
    } else {
      setUsers([]);
      setOrders([]);
    }
  }, [isAdmin, isMember, user?.id, refreshUsers, refreshOrders]);

  // ---- KAYIT ----
  const register = useCallback(async (form) => {
    const { ok, data } = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        companyName: form.companyName,
        taxNo: form.taxNo,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        requestedType: form.requestedType,
      }),
    });
    return ok ? { ok: true } : { ok: false, error: data.error || 'Kayıt başarısız.' };
  }, []);

  // ---- ÜYE GİRİŞİ ----
  const login = useCallback(async (email, password) => {
    const { ok, data } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!ok) return { ok: false, error: data.error || 'Giriş başarısız.' };
    setUser(data.user);
    return {
      ok: true,
      role: data.user.role,
      status: data.user.status,
      isAdmin: data.user.isAdmin,
    };
  }, []);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
    setUsers([]);
    setOrders([]);
  }, []);

  // ---- ŞİFRE DEĞİŞTİR (giriş yapmış kullanıcı kendi şifresini) ----
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const { ok, data } = await api('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return ok ? { ok: true } : { ok: false, error: data.error || 'Şifre değiştirilemedi.' };
  }, []);

  // ---- ŞİFREMİ UNUTTUM: e-postaya sıfırlama bağlantısı gönder ----
  const forgotPassword = useCallback(async (email) => {
    const { ok, data } = await api('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return ok ? { ok: true } : { ok: false, error: data.error || 'İşlem başarısız.' };
  }, []);

  // ---- BAĞLANTIDAKİ TOKEN İLE YENİ ŞİFRE BELİRLE ----
  const resetPassword = useCallback(async (token, newPassword) => {
    const { ok, data } = await api('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
    return ok ? { ok: true } : { ok: false, error: data.error || 'Şifre sıfırlanamadı.' };
  }, []);

  // ---- ADMIN: ÜYE İŞLEMLERİ ----
  const userAction = useCallback(
    async (body) => {
      const { ok } = await api('/admin/users', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      if (ok) await refreshUsers();
      return ok;
    },
    [refreshUsers]
  );
  const approveUser = useCallback(
    (id, tier) => userAction({ id, action: 'approve', tier }),
    [userAction]
  );
  const rejectUser = useCallback((id) => userAction({ id, action: 'reject' }), [userAction]);
  const setUserTier = useCallback(
    (id, tier) => userAction({ id, action: 'setTier', tier }),
    [userAction]
  );
  const suspendUser = useCallback((id) => userAction({ id, action: 'suspend' }), [userAction]);
  const setUserNote = useCallback(
    (id, note) => userAction({ id, action: 'setNote', note }),
    [userAction]
  );
  const deleteUser = useCallback(
    async (id) => {
      const { ok } = await api('/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      if (ok) await refreshUsers();
      return ok;
    },
    [refreshUsers]
  );

  // ---- FİYAT (seviyeye göre; sunucu admin/onaylı üyeye iki fiyatı da verir) ----
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
  const addOrder = useCallback(
    async (order) => {
      const { ok, data } = await api('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });
      if (ok) await refreshOrders();
      return ok ? { ok: true } : { ok: false, error: data.error };
    },
    [refreshOrders]
  );
  const getUserOrders = useCallback(
    (userId) => orders.filter((o) => o.userId === userId),
    [orders]
  );
  const updateOrderStatus = useCallback(
    async (code, status) => {
      const { ok } = await api('/orders', {
        method: 'PUT',
        body: JSON.stringify({ code, status }),
      });
      if (ok) await refreshOrders();
    },
    [refreshOrders]
  );
  const deleteOrder = useCallback(
    async (code) => {
      const { ok } = await api('/orders', {
        method: 'DELETE',
        body: JSON.stringify({ code }),
      });
      if (ok) await refreshOrders();
    },
    [refreshOrders]
  );

  const value = {
    user,
    loading,
    users,
    orders,
    isAdmin,
    isMember,
    isApproved,
    priceTier,
    register,
    login,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
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
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return ctx;
}
