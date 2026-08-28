import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import type { MainTabParamList, HomeStackParamList } from './types';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import CategoryWorkersScreen from '../screens/user/CategoryWorkersScreen';
import WorkerDashboardScreen from '../screens/worker/WorkerDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: '🏠',
  Profile: '👤',
  Settings: '⚙️',
};

function TabIcon({ route, focused }: { route: string; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
      {TAB_ICONS[route as keyof MainTabParamList]}
    </Text>
  );
}

function HomeStackNavigator() {
  const { role } = useApp();
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={role === 'worker' ? WorkerDashboardScreen : UserHomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="CategoryWorkers"
        component={CategoryWorkersScreen}
        options={{ headerShown: true, title: '' }}
      />
    </HomeStack.Navigator>
  );
}

export default function MainTabs() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon route={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: t('tabs.home') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabs.profile') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}
