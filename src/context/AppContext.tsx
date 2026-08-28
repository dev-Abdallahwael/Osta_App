import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Role } from '../navigation/types';

const ROLE_KEY = '@osta/role';

interface AppContextValue {
  role: Role | null;
  isBooting: boolean;
  completeOnboarding: (role: Role) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  clearRole: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(ROLE_KEY);
        if (mounted && (stored === 'worker' || stored === 'user')) {
          setRole(stored);
        }
      } catch (err) {
        console.warn('Failed to load role:', err);
      } finally {
        if (mounted) setIsBooting(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const completeOnboarding = useCallback(async (next: Role) => {
    await AsyncStorage.setItem(ROLE_KEY, next);
    setRole(next);
  }, []);

  const switchRole = useCallback(async (next: Role) => {
    await AsyncStorage.setItem(ROLE_KEY, next);
    setRole(next);
  }, []);

  const clearRole = useCallback(async () => {
    await AsyncStorage.removeItem(ROLE_KEY);
    setRole(null);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ role, isBooting, completeOnboarding, switchRole, clearRole }),
    [role, isBooting, completeOnboarding, switchRole, clearRole],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
