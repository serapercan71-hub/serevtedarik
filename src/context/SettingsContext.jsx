import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SELLER_WHATSAPP, STORE_NAME, ADMIN } from '../data/store.js';

const SettingsContext = createContext(null);
const KEY = 'serapercan_settings';

const defaults = {
  whatsapp: SELLER_WHATSAPP,
  storeName: STORE_NAME,
  topBar: 'Toptan & perakende tedarik · Üye girişi yaparak özel fiyatlarınızı görün',
  contactEmail: ADMIN.email,
  adminPassword: ADMIN.password,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings, SettingsProvider içinde kullanılmalı');
  return ctx;
}
