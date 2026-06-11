import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const FavoritesContext = createContext(null);
const STORAGE_KEY = 'serapercan_favorites';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(load); // favori ürün id'leri

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const isFavorite = useCallback((id) => ids.includes(id), [ids]);

  const toggleFavorite = useCallback((id) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const value = { ids, count: ids.length, isFavorite, toggleFavorite };
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites, FavoritesProvider içinde kullanılmalı');
  return ctx;
}
