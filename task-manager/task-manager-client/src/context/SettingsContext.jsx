import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const DEFAULTS = {
  theme:             'light',   // 'light' | 'dark'
  soundEnabled:      true,
  notificationsEnabled: true,
  compactView:       false,
  language:          'en',
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('settings') || 'null');
      return { ...DEFAULTS, ...stored };
    } catch {
      return DEFAULTS;
    }
  });

  const update = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('settings', JSON.stringify(next));
      return next;
    });
  };

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
};
