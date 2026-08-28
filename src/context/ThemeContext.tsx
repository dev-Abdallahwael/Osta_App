import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, type ThemeMode, type ThemeTokens } from '../theme/tokens';

const STORAGE_KEY = '@osta/theme';

const DEFAULT_MODE: ThemeMode = 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeTokens;
  isLoaded: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && (stored === 'dark' || stored === 'light')) {
          setModeState(stored);
        }
      } catch (err) {
        console.warn('Failed to load persisted theme:', err);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((err) =>
      console.warn('Failed to persist theme:', err),
    );
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch((err) =>
        console.warn('Failed to persist theme:', err),
      );
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: themes[mode], isLoaded, setMode, toggleTheme }),
    [mode, isLoaded, setMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
