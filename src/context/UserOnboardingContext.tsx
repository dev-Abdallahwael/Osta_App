import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';

export interface UserOnboardingData {
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  location: { lat: number; lng: number; address: string; city: string } | null;
}

const DEFAULT_DATA: UserOnboardingData = {
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  location: null,
};

interface UserOnboardingContextValue {
  data: UserOnboardingData;
  update: (patch: Partial<UserOnboardingData>) => void;
  reset: () => void;
}

const UserOnboardingContext = createContext<UserOnboardingContextValue | null>(null);

export function UserOnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<UserOnboardingData>(DEFAULT_DATA);

  const update = useCallback((patch: Partial<UserOnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setData(DEFAULT_DATA);
  }, []);

  const value = useMemo(
    () => ({ data, update, reset }),
    [data, update, reset],
  );

  return (
    <UserOnboardingContext.Provider value={value}>
      {children}
    </UserOnboardingContext.Provider>
  );
}

export function useUserOnboarding(): UserOnboardingContextValue {
  const ctx = useContext(UserOnboardingContext);
  if (!ctx) {
    throw new Error(
      'useUserOnboarding must be used within a UserOnboardingProvider',
    );
  }
  return ctx;
}
