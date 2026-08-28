import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import LoginScreen from '../screens/LoginScreen';
import PlaceholderHomeScreen from '../screens/PlaceholderHomeScreen';
import type { RootStackParamList, WorkerStackParamList, UserStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const WorkerStack = createNativeStackNavigator<WorkerStackParamList>();
const UserStack = createNativeStackNavigator<UserStackParamList>();

function WorkerHomeScreen() {
  return <PlaceholderHomeScreen role="worker" />;
}

function UserHomeScreen() {
  return <PlaceholderHomeScreen role="user" />;
}

function WorkerHome() {
  return (
    <WorkerStack.Navigator>
      <WorkerStack.Screen
        name="WorkerHome"
        component={WorkerHomeScreen}
        options={{ headerShown: false }}
      />
    </WorkerStack.Navigator>
  );
}

function UserHome() {
  return (
    <UserStack.Navigator>
      <UserStack.Screen
        name="UserHome"
        component={UserHomeScreen}
        options={{ headerShown: false }}
      />
    </UserStack.Navigator>
  );
}

export default function AppNavigator() {
  const { role, isBooting } = useApp();

  function initialRoute(): 'RoleSelect' | 'WorkerStack' | 'UserStack' {
    if (role === 'worker') return 'WorkerStack';
    if (role === 'user') return 'UserStack';
    return 'RoleSelect';
  }

  if (isBooting) {
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName={initialRoute()}>
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
        <RootStack.Screen
          name="WorkerStack"
          component={WorkerHome}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="UserStack"
          component={UserHome}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
