import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext.jsx';

const CatalogContext = createContext(null);
// Admin'in önceden eklediği (henüz ürünü olmayan) kategori adları.
const XCAT_KEY = 'serev_extra_categories';

function loadExtra() {
  try {
    const raw = localStorage.getItem(XCAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

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

export function CatalogProvider({ children }) {
  // Fiyatlar kullanıcının yetkisine göre şekillendiği için, kullanıcı
  // değiştiğinde ürünleri yeniden çekiyoruz.
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [extraCats, setExtraCats] = useState(loadExtra);

  const refresh = useCallback(async () => {
    const { ok, data } = await api('/products');
    if (ok) setProducts(data.products || []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, user?.id, user?.status, user?.tier, user?.isAdmin]);

  useEffect(() => {
    localStorage.setItem(XCAT_KEY, JSON.stringify(extraCats));
  }, [extraCats]);

  // Kategoriler: ürünlerden türetilen + admin'in eklediği ekstra adlar
  const categories = useMemo(() => {
    const derived = products.map((p) => p.category).filter(Boolean);
    return [...new Set([...derived, ...extraCats])].sort((a, b) =>
      a.localeCompare(b, 'tr')
    );
  }, [products, extraCats]);

  // --- ÜRÜNLER (API) ---
  const addProduct = useCallback(
    async (data) => {
      const { ok } = await api('/products', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          desc: data.desc,
          img: data.img,
          category: data.category,
          badge: data.badge,
          pricePerakende: data.price,
          priceTemsilci: data.priceTemsilci,
          inStock: data.inStock,
          stockStatus: data.stockStatus,
          rating: data.rating,
          reviewCount: data.reviewCount,
        }),
      });
      if (ok) await refresh();
      return ok;
    },
    [refresh]
  );

  const updateProduct = useCallback(
    async (id, data) => {
      const { ok } = await api('/products', {
        method: 'PUT',
        body: JSON.stringify({
          id,
          title: data.title,
          desc: data.desc,
          img: data.img,
          category: data.category,
          badge: data.badge,
          pricePerakende: data.price,
          priceTemsilci: data.priceTemsilci,
          inStock: data.inStock,
          stockStatus: data.stockStatus,
        }),
      });
      if (ok) await refresh();
      return ok;
    },
    [refresh]
  );

  const deleteProduct = useCallback(
    async (id) => {
      const { ok } = await api(`/products?id=${id}`, { method: 'DELETE' });
      if (ok) await refresh();
      return ok;
    },
    [refresh]
  );

  // --- KATEGORİLER (yerel ad listesi; ürünlerden türetilenle birleşir) ---
  const addCategory = useCallback((name) => {
    const n = (name || '').trim();
    if (!n) return false;
    let added = false;
    setExtraCats((prev) => {
      if (prev.some((c) => c.toLocaleLowerCase('tr') === n.toLocaleLowerCase('tr')))
        return prev;
      added = true;
      return [...prev, n];
    });
    return added;
  }, []);

  const deleteCategory = useCallback((name) => {
    setExtraCats((prev) => prev.filter((c) => c !== name));
  }, []);

  // --- YARDIMCILAR ---
  const getProductById = useCallback(
    (id) => products.find((p) => p.id === Number(id)),
    [products]
  );

  const getRelated = useCallback(
    (product, limit = 3) => {
      if (!product) return [];
      return products
        .filter((p) => p.id !== product.id && p.category === product.category)
        .concat(
          products.filter(
            (p) => p.id !== product.id && p.category !== product.category
          )
        )
        .slice(0, limit);
    },
    [products]
  );

  const value = {
    products,
    categories,
    refresh,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    getProductById,
    getRelated,
  };

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog, CatalogProvider içinde kullanılmalı');
  return ctx;
}
