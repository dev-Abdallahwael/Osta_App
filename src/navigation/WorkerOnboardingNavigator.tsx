import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkerOnboardingProvider, useWorkerOnboarding } from '../context/WorkerOnboardingContext';
import type { WorkerOnboardingParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { getCurrentUserId } from '../services/auth';
import { getWorkerProfile } from '../services/worker';
import { CATEGORIES, type Category } from '../data/categories';
import type { DayKey, WorkerOnboardingData } from '../context/WorkerOnboardingContext';
import PhoneStep from '../screens/worker/PhoneStep';
import PersonalStep from '../screens/worker/PersonalStep';
import CategoriesStep from '../screens/worker/CategoriesStep';
import PriceStep from '../screens/worker/PriceStep';
import LocationStep from '../screens/worker/LocationStep';
import HoursStep from '../screens/worker/HoursStep';
import AccountStep from '../screens/worker/AccountStep';
import ReviewStep from '../screens/worker/ReviewStep';

const Stack = createNativeStackNavigator<WorkerOnboardingParamList>();
const DAY_KEYS: DayKey[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

function toOnboardingData(
  p: NonNullable<Awaited<ReturnType<typeof getWorkerProfile>>>,
): WorkerOnboardingData {
  const selectedCategories: Category[] = [];
  const prices: { categoryId: string; price: string }[] = [];
  for (const c of p.categories) {
    const cat = CATEGORIES.find((x) => x.id === c.categoryId);
    if (cat) {
      selectedCategories.push(cat);
      prices.push({ categoryId: c.categoryId, price: String(c.startingPrice) });
    }
  }

  const availableDays: DayKey[] = DAY_KEYS.filter((d) => p.availableHours?.[d]);
  const hours = {} as Record<DayKey, { start: string; end: string }>;
  for (const d of availableDays) {
    hours[d] = {
      start: p.availableHours[d].start,
      end: p.availableHours[d].end,
    };
  }

  return {
    phone: p.phone.replace(/^\+20/, ''),
    email: '',
    password: '',
    confirmPassword: '',
    name: p.name,
    photoUri: p.photoURL || null,
    bio: p.bio,
    selectedCategories,
    prices,
    location: p.location,
    radiusKm: p.radiusKm,
    coverWholeCity: p.coversWholeCity,
    availableDays,
    hours,
  };
}

function Hydrator({ edit }: { edit: boolean }) {
  const { colors } = useTheme();
  const { hydrate } = useWorkerOnboarding();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (edit) {
        const uid = getCurrentUserId();
        const profile = uid ? await getWorkerProfile(uid) : null;
        if (mounted && profile) {
          hydrate(toOnboardingData(profile), true);
        } else if (mounted) {
          hydrate({} as WorkerOnboardingData, true);
        }
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [edit, hydrate]);

  if (loading && edit) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PhoneStep">
      <Stack.Screen name="PhoneStep" component={PhoneStep} />
      <Stack.Screen name="PersonalStep" component={PersonalStep} />
      <Stack.Screen name="CategoriesStep" component={CategoriesStep} />
      <Stack.Screen name="PriceStep" component={PriceStep} />
      <Stack.Screen name="LocationStep" component={LocationStep} />
      <Stack.Screen name="HoursStep" component={HoursStep} />
      <Stack.Screen name="AccountStep" component={AccountStep} />
      <Stack.Screen name="ReviewStep" component={ReviewStep} />
    </Stack.Navigator>
  );
}

export default function WorkerOnboardingNavigator({ edit = false }: { edit?: boolean }) {
  return (
    <WorkerOnboardingProvider>
      <Hydrator edit={edit} />
    </WorkerOnboardingProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
