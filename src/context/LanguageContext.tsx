import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  type Language,
} from '../localization/i18n';

const STORAGE_KEY = '@osta/language';

interface LanguageContextValue {
  language: Language;
  isLoaded: boolean;
  renderKey: number;
  setLanguage: (next: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function applyRtl(language: Language): void {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(language === 'ar');
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const pending = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const initial = isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
        if (!mounted) return;
        i18n.changeLanguage(initial);
        applyRtl(initial);
        setLanguageState(initial);
        setRenderKey((k) => k + 1);
      } catch (err) {
        console.warn('Failed to load persisted language:', err);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    if (pending.current) return;
    pending.current = true;
    setLanguageState((current) => {
      if (current === next) {
        pending.current = false;
        return current;
      }
      i18n.changeLanguage(next);
      applyRtl(next);
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
    setRenderKey((k) => k + 1);
    setTimeout(() => {
      pending.current = false;
    }, 500);
  }, []);

  const value = useMemo(
    () => ({ language, isLoaded, renderKey, setLanguage }),
    [language, isLoaded, renderKey, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
