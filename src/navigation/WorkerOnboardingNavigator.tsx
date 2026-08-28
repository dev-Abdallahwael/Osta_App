import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkerOnboardingProvider } from '../context/WorkerOnboardingContext';
import type { WorkerOnboardingParamList } from '../navigation/types';
import PhoneStep from '../screens/worker/PhoneStep';
import PersonalStep from '../screens/worker/PersonalStep';
import CategoriesStep from '../screens/worker/CategoriesStep';
import PriceStep from '../screens/worker/PriceStep';
import LocationStep from '../screens/worker/LocationStep';
import HoursStep from '../screens/worker/HoursStep';
import ReviewStep from '../screens/worker/ReviewStep';

const Stack = createNativeStackNavigator<WorkerOnboardingParamList>();

export default function WorkerOnboardingNavigator() {
  return (
    <WorkerOnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PhoneStep">
        <Stack.Screen name="PhoneStep" component={PhoneStep} />
        <Stack.Screen name="PersonalStep" component={PersonalStep} />
        <Stack.Screen name="CategoriesStep" component={CategoriesStep} />
        <Stack.Screen name="PriceStep" component={PriceStep} />
        <Stack.Screen name="LocationStep" component={LocationStep} />
        <Stack.Screen name="HoursStep" component={HoursStep} />
        <Stack.Screen name="ReviewStep" component={ReviewStep} />
      </Stack.Navigator>
    </WorkerOnboardingProvider>
  );
}
