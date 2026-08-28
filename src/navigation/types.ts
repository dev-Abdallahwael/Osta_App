import type { NavigatorScreenParams } from '@react-navigation/native';

export type Role = 'worker' | 'user';

export type RootStackParamList = {
  RoleSelect: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  WorkerOnboarding: { edit?: boolean } | undefined;
  UserOnboarding: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Profile: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  CategoryWorkers: { categoryId: string };
};

export type WorkerOnboardingParamList = {
  PhoneStep: undefined;
  PersonalStep: undefined;
  CategoriesStep: undefined;
  PriceStep: undefined;
  LocationStep: undefined;
  HoursStep: undefined;
  ReviewStep: undefined;
};

export type UserOnboardingParamList = {
  UserPhoneStep: undefined;
  UserDetailsStep: undefined;
};
