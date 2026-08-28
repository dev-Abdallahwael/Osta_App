import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ensureAnonymousSignIn } from './src/services/auth';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import TestScreen from './src/screens/TestScreen';

function Root() {
  const { renderKey } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} key={renderKey}>
      <StatusBar style="auto" />
      <TestScreen />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    ensureAnonymousSignIn();
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
