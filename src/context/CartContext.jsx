import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const STORAGE_KEY = 'serapercan_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  // Sepet her değiştiğinde localStorage'a yaz — sayfalar arası korunur.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Oturum (kullanıcı) değişince sepeti temizle — başka kullanıcının
  // sepeti/fiyatları sızmasın. İlk yüklemede (sayfa yenileme) temizlenmez.
  const sessionKey = user ? user.role + ':' + (user.id || 'admin') : 'guest';
  const prevSessionRef = useRef(undefined);
  useEffect(() => {
    if (prevSessionRef.current === undefined) {
      prevSessionRef.current = sessionKey; // ilk render: dokunma
      return;
    }
    if (prevSessionRef.current !== sessionKey) {
      prevSessionRef.current = sessionKey;
      setItems([]);
      setIsOpen(false);
    }
  }, [sessionKey]);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const addItem = useCallback(
    (product) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + 1 } : i
          );
        }
        return [...prev, { ...product, qty: 1 }];
      });
      showToast(`${product.title} sepete eklendi`);
    },
    [showToast]
  );

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const changeQty = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const value = {
    items,
    isOpen,
    toast,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    changeQty,
    clearCart,
    openCart,
    closeCart,
    showToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart, CartProvider içinde kullanılmalı');
  return ctx;
}

// Para biçimlendirme yardımcı fonksiyonu (Türkçe biçim).
export function formatPrice(value) {
  return (
    value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₺'
  );
}
