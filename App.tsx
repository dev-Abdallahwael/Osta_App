import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ensureAnonymousSignIn } from './src/services/auth';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import LanguageTestScreen from './src/screens/LanguageTestScreen';

function Root() {
  const { renderKey } = useLanguage();

  return (
    <View style={styles.container} key={renderKey}>
      <StatusBar style="auto" />
      <LanguageTestScreen />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    ensureAnonymousSignIn();
  }, []);

  return (
    <LanguageProvider>
      <Root />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
