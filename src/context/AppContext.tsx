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
const USER_ONBOARDED_KEY = '@osta/userOnboarded';

interface AppContextValue {
  role: Role | null;
  workerOnboarded: boolean;
  userOnboarded: boolean;
  isBooting: boolean;
  completeOnboarding: (role: Role) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  markWorkerOnboarded: () => Promise<void>;
  markUserOnboarded: () => Promise<void>;
  clearRole: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [workerOnboarded, setWorkerOnboarded] = useState(false);
  const [userOnboarded, setUserOnboarded] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [wOnboarded, uOnboarded] = await Promise.all([
          AsyncStorage.getItem(WORKER_ONBOARDED_KEY),
          AsyncStorage.getItem(USER_ONBOARDED_KEY),
        ]);
        if (mounted && wOnboarded === '1') {
          setWorkerOnboarded(true);
        }
        if (mounted && uOnboarded === '1') {
          setUserOnboarded(true);
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

  const markUserOnboarded = useCallback(async () => {
    await AsyncStorage.setItem(USER_ONBOARDED_KEY, '1');
    setUserOnboarded(true);
  }, []);

  const switchRole = useCallback(async (next: Role) => {
    await AsyncStorage.setItem(ROLE_KEY, next);
    setRole(next);
  }, []);

  const clearRole = useCallback(async () => {
    await AsyncStorage.removeItem(ROLE_KEY);
    await AsyncStorage.removeItem(WORKER_ONBOARDED_KEY);
    await AsyncStorage.removeItem(USER_ONBOARDED_KEY);
    setRole(null);
    setWorkerOnboarded(false);
    setUserOnboarded(false);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      workerOnboarded,
      userOnboarded,
      isBooting,
      completeOnboarding,
      switchRole,
      markWorkerOnboarded,
      markUserOnboarded,
      clearRole,
    }),
    [
      role,
      workerOnboarded,
      userOnboarded,
      isBooting,
      completeOnboarding,
      switchRole,
      markWorkerOnboarded,
      markUserOnboarded,
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
