import { useEffect } from 'react';
import { isRunningInExpoGo } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensureAnonymousSignIn, onAuthChange } from './src/services/auth';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation';

function Root() {
  const { colors } = useTheme();
  const { role, workerOnboarded, userOnboarded, isBooting } = useApp();

  useEffect(() => {
    const onboarded =
      role === 'worker' ? workerOnboarded : role === 'user' ? userOnboarded : false;
    // Expo Go does not include Android remote push notification support.
    if (!role || !onboarded || isBooting || isRunningInExpoGo()) return;
    let unsub: (() => void) | null = null;
    const registered = { done: false };
    unsub = onAuthChange((user) => {
      if (user && !registered.done) {
        import('./src/services/notifications').then(({ registerForPushNotifications }) =>
          registerForPushNotifications(role),
        ).finally(() => {
          registered.done = true;
        });
      }
    });
    return () => unsub?.();
  }, [role, workerOnboarded, userOnboarded, isBooting]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      <AppNavigator key={role ?? 'none'} />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    ensureAnonymousSignIn();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppProvider>
            <Root />
          </AppProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
