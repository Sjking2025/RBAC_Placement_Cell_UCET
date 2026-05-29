import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

/**
 * Resolves the effective theme from a preference.
 * 'system' → checks OS preference
 * 'light' / 'dark' → used directly
 */
function resolveTheme(preference) {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
}

export const ThemeProvider = ({ children }) => {
  // User's chosen preference: 'light' | 'dark' | 'system'
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  // The actually applied theme: 'light' | 'dark'
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(preference));

  // Apply theme to DOM
  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    setResolvedTheme(theme);
  }, []);

  // When preference changes, save and apply
  useEffect(() => {
    localStorage.setItem('theme', preference);
    applyTheme(resolveTheme(preference));
  }, [preference, applyTheme]);

  // Listen for OS theme changes when preference is 'system'
  useEffect(() => {
    if (preference !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => applyTheme(e.matches ? 'dark' : 'light');

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference, applyTheme]);

  const setTheme = useCallback((newPreference) => {
    setPreference(newPreference);
  }, []);

  const value = {
    theme: resolvedTheme,      // 'light' or 'dark' (what's actually applied)
    preference,                // 'light', 'dark', or 'system' (user's choice)
    setTheme,                  // set preference
    isDark: resolvedTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
