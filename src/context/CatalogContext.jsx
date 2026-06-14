import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  products as seedProducts,
  categories as seedCategories,
} from '../data/products.js';

const CatalogContext = createContext(null);
// v2: yayına geçişte demo veriler kaldırıldı; eski önbelleği yok saymak için
// anahtar adı değiştirildi (eski demo ürünler tarayıcıda kalmasın).
const P_KEY = 'serev_catalog_products_v2';
const C_KEY = 'serev_catalog_categories_v2';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(() => load(P_KEY, seedProducts));
  const [categories, setCategories] = useState(() =>
    load(C_KEY, seedCategories.map((c) => c.name))
  );

  useEffect(() => {
    localStorage.setItem(P_KEY, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(C_KEY, JSON.stringify(categories));
  }, [categories]);

  // --- ÜRÜNLER ---
  const addProduct = useCallback((data) => {
    setProducts((prev) => {
      const id = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
      return [
        ...prev,
        {
          id,
          title: data.title || 'Yeni Ürün',
          desc: data.desc || '',
          img: data.img || '',
          category: data.category || '',
          badge: data.badge || '',
          price: Number(data.price) || 0,
          priceTemsilci: Number(data.priceTemsilci) || 0,
          inStock: data.inStock !== false,
          rating: Number(data.rating) || 0,
          reviewCount: Number(data.reviewCount) || 0,
          features: data.features || [],
        },
      ];
    });
  }, []);

  const updateProduct = useCallback((id, data) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...data,
              price: data.price !== undefined ? Number(data.price) : p.price,
              priceTemsilci:
                data.priceTemsilci !== undefined
                  ? Number(data.priceTemsilci)
                  : p.priceTemsilci,
            }
          : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // --- KATEGORİLER ---
  const addCategory = useCallback((name) => {
    const n = (name || '').trim();
    if (!n) return false;
    let added = false;
    setCategories((prev) => {
      if (prev.some((c) => c.toLocaleLowerCase('tr') === n.toLocaleLowerCase('tr')))
        return prev;
      added = true;
      return [...prev, n];
    });
    return added;
  }, []);

  const deleteCategory = useCallback((name) => {
    setCategories((prev) => prev.filter((c) => c !== name));
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
