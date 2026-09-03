import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import LoginScreen from '../screens/LoginScreen';
import MainTabs from './MainTabs';
import WorkerOnboardingNavigator from './WorkerOnboardingNavigator';
import UserOnboardingNavigator from './UserOnboardingNavigator';
import BoostComingSoonScreen from '../screens/worker/BoostComingSoonScreen';
import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

type WorkerOnboardingProps = NativeStackScreenProps<
  RootStackParamList,
  'WorkerOnboarding'
>;

function WorkerOnboardingRoute({ route }: WorkerOnboardingProps) {
  return <WorkerOnboardingNavigator edit={route?.params?.edit ?? false} />;
}

function targetRoute(role: 'worker' | 'user' | null, workerOnboarded: boolean, userOnboarded: boolean) {
  if (!role) return 'RoleSelect';
  if (role === 'worker' && !workerOnboarded) return 'WorkerOnboarding';
  if (role === 'user' && !userOnboarded) return 'UserOnboarding';
  return 'Main';
}

export default function AppNavigator() {
  const { role, workerOnboarded, userOnboarded, isBooting } = useApp();
  const initial = targetRoute(role, workerOnboarded, userOnboarded);

  if (isBooting) {
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator key={initial} initialRouteName={initial}>
        <RootStack.Screen
          name="RoleSelect"
          component={RoleSelectScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="WorkerOnboarding"
          component={WorkerOnboardingRoute}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="UserOnboarding"
          component={UserOnboardingNavigator}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="WorkerBoost"
          component={BoostComingSoonScreen}
          options={{ title: '' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
