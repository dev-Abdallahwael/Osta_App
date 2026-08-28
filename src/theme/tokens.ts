export interface ThemeTokens {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
  error: string;
  success: string;
}

export const darkTheme: ThemeTokens = {
  background: '#0b1220',
  surface: '#111a2e',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  accent: '#2563eb',
  border: '#1e293b',
  error: '#ef4444',
  success: '#22c55e',
};

export const lightTheme: ThemeTokens = {
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  accent: '#2563eb',
  border: '#e2e8f0',
  error: '#dc2626',
  success: '#16a34a',
};

export type ThemeMode = 'dark' | 'light';

export const themes: Record<ThemeMode, ThemeTokens> = {
  dark: darkTheme,
  light: lightTheme,
};
