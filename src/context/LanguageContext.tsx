import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
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
  toggleLanguage: (next: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function applyRtl(language: Language): void {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(language === 'ar');
}

async function reloadApp(): Promise<void> {
  try {
    await Updates.reloadAsync();
  } catch {
    // Updates.reloadAsync() is unavailable in Expo Go / dev builds.
    // The renderKey remount in App handles the visual RTL flip there.
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const initial = isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
        if (!mounted) return;
        i18n.changeLanguage(initial);
        applyRtl(initial);
        setLanguage(initial);
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

  const toggleLanguage = useCallback((next: Language) => {
    setLanguage((current) => {
      if (current === next) return current;
      i18n.changeLanguage(next);
      applyRtl(next);
      setRenderKey((k) => k + 1);
      AsyncStorage.setItem(STORAGE_KEY, next).catch((err) =>
        console.warn('Failed to persist language:', err),
      );
      void reloadApp();
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ language, isLoaded, renderKey, toggleLanguage }),
    [language, isLoaded, renderKey, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
