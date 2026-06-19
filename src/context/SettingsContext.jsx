import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SELLER_WHATSAPP, STORE_NAME } from '../data/store.js';

const SettingsContext = createContext(null);
// v2: contactEmail varsayılanı değişti → eski önbelleği yok say (info@ görünsün)
const KEY = 'serev_settings_v2';

const defaults = {
  whatsapp: SELLER_WHATSAPP,
  storeName: STORE_NAME,
  topBar: 'Toptan & perakende tedarik · Üye girişi yaparak özel fiyatlarınızı görün',
  contactEmail: 'info@serevtedarik.com',
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
