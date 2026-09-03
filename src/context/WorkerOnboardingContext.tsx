import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import type { Category } from '../data/categories';

export interface PriceEntry {
  categoryId: string;
  price: string;
}

export interface DayHours {
  start: string;
  end: string;
}

export type DayKey =
  | 'sat'
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface WorkerOnboardingData {
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  photoUri: string | null;
  bio: string;
  selectedCategories: Category[];
  prices: PriceEntry[];
  location: LocationData | null;
  radiusKm: number;
  coverWholeCity: boolean;
  availableDays: DayKey[];
  hours: Record<DayKey, DayHours>;
}

const DEFAULT_HOURS: Record<DayKey, DayHours> = {
  sat: { start: '09:00', end: '18:00' },
  sun: { start: '09:00', end: '18:00' },
  mon: { start: '09:00', end: '18:00' },
  tue: { start: '09:00', end: '18:00' },
  wed: { start: '09:00', end: '18:00' },
  thu: { start: '09:00', end: '18:00' },
  fri: { start: '09:00', end: '18:00' },
};

const DEFAULT_AVAILABLE_DAYS: DayKey[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'];

const DEFAULT_DATA: WorkerOnboardingData = {
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  photoUri: null,
  bio: '',
  selectedCategories: [],
  prices: [],
  location: null,
  radiusKm: 5,
  coverWholeCity: false,
  availableDays: DEFAULT_AVAILABLE_DAYS,
  hours: DEFAULT_HOURS,
};

interface WorkerOnboardingContextValue {
  data: WorkerOnboardingData;
  edit: boolean;
  update: (patch: Partial<WorkerOnboardingData>) => void;
  hydrate: (data: WorkerOnboardingData, edit: boolean) => void;
  reset: () => void;
}

const WorkerOnboardingContext = createContext<WorkerOnboardingContextValue | null>(
  null,
);

export function WorkerOnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<WorkerOnboardingData>(DEFAULT_DATA);
  const [edit, setEdit] = useState(false);

  const update = useCallback((patch: Partial<WorkerOnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const hydrate = useCallback((next: WorkerOnboardingData, isEdit: boolean) => {
    setData({
      ...DEFAULT_DATA,
      ...next,
      hours: { ...DEFAULT_HOURS, ...(next.hours ?? {}) },
    });
    setEdit(isEdit);
  }, []);

  const reset = useCallback(() => {
    setData(DEFAULT_DATA);
    setEdit(false);
  }, []);

  const value = useMemo(
    () => ({ data, edit, update, hydrate, reset }),
    [data, edit, update, hydrate, reset],
  );

  return (
    <WorkerOnboardingContext.Provider value={value}>
      {children}
    </WorkerOnboardingContext.Provider>
  );
}

export function useWorkerOnboarding(): WorkerOnboardingContextValue {
  const ctx = useContext(WorkerOnboardingContext);
  if (!ctx) {
    throw new Error(
      'useWorkerOnboarding must be used within a WorkerOnboardingProvider',
    );
  }
  return ctx;
}
