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
const WORKER_ONBOARDED_KEY = '@osta/workerOnboarded';

interface AppContextValue {
  role: Role | null;
  workerOnboarded: boolean;
  isBooting: boolean;
  completeOnboarding: (role: Role) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  markWorkerOnboarded: () => Promise<void>;
  clearRole: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [workerOnboarded, setWorkerOnboarded] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [stored, onboarded] = await Promise.all([
          AsyncStorage.getItem(ROLE_KEY),
          AsyncStorage.getItem(WORKER_ONBOARDED_KEY),
        ]);
        if (mounted && (stored === 'worker' || stored === 'user')) {
          setRole(stored);
        }
        if (mounted && onboarded === '1') {
          setWorkerOnboarded(true);
        }
      } catch (err) {
        console.warn('Failed to load app state:', err);
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

  const markWorkerOnboarded = useCallback(async () => {
    await AsyncStorage.setItem(WORKER_ONBOARDED_KEY, '1');
    setWorkerOnboarded(true);
  }, []);

  const switchRole = useCallback(async (next: Role) => {
    await AsyncStorage.setItem(ROLE_KEY, next);
    setRole(next);
  }, []);

  const clearRole = useCallback(async () => {
    await AsyncStorage.removeItem(ROLE_KEY);
    await AsyncStorage.removeItem(WORKER_ONBOARDED_KEY);
    setRole(null);
    setWorkerOnboarded(false);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      workerOnboarded,
      isBooting,
      completeOnboarding,
      switchRole,
      markWorkerOnboarded,
      clearRole,
    }),
    [
      role,
      workerOnboarded,
      isBooting,
      completeOnboarding,
      switchRole,
      markWorkerOnboarded,
      clearRole,
    ],
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
