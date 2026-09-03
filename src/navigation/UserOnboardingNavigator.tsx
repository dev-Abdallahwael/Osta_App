import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserOnboardingProvider } from '../context/UserOnboardingContext';
import type { UserOnboardingParamList } from '../navigation/types';
import UserPhoneStep from '../screens/user/UserPhoneStep';
import UserDetailsStep from '../screens/user/UserDetailsStep';
import AccountStep from '../screens/user/AccountStep';

const Stack = createNativeStackNavigator<UserOnboardingParamList>();

export default function UserOnboardingNavigator() {
  return (
    <UserOnboardingProvider>
      <Stack.Navigator initialRouteName="UserPhoneStep" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="UserPhoneStep" component={UserPhoneStep} />
        <Stack.Screen name="UserDetailsStep" component={UserDetailsStep} />
        <Stack.Screen name="AccountStep" component={AccountStep} />
      </Stack.Navigator>
    </UserOnboardingProvider>
  );
}
