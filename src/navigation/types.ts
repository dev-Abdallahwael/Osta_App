export type Role = 'worker' | 'user';

export type RootStackParamList = {
  RoleSelect: undefined;
  Login: undefined;
  WorkerStack: undefined;
  UserStack: undefined;
};

export type WorkerStackParamList = {
  WorkerHome: undefined;
  WorkerOnboarding: { edit?: boolean } | undefined;
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

export type UserStackParamList = {
  UserHome: undefined;
  CategoryWorkers: { categoryId: string };
};

export type UserOnboardingParamList = {
  UserPhoneStep: undefined;
  UserDetailsStep: undefined;
};
