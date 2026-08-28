export type Role = 'worker' | 'user';

export type RootStackParamList = {
  RoleSelect: undefined;
  Login: undefined;
  WorkerStack: undefined;
  UserStack: undefined;
};

export type WorkerStackParamList = {
  WorkerHome: undefined;
};

export type UserStackParamList = {
  UserHome: undefined;
};
