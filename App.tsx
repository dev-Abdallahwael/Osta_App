import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensureAnonymousSignIn } from './src/services/auth';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation';

function Root() {
  const { colors } = useTheme();
  const { role } = useApp();

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
