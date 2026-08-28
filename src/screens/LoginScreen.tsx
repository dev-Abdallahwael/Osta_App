import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { signInWithEmailPassword } from '../services/auth';
import type { RootStackParamList } from '../navigation/types';
import type { Role } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { completeOnboarding } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function roleForEmail(address: string): Role {
    const normalized = address.trim().toLowerCase();
    if (normalized === 'worker@test.com') return 'worker';
    return 'user';
  }

  async function onLogin() {
    if (!email.trim() || !password) {
      setError(t('login.errorEmpty'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailPassword(email.trim(), password);
      const role = roleForEmail(email);
      await completeOnboarding(role);
    } catch (err) {
      console.warn('Login failed:', err);
      setError(t('login.errorInvalid'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t('login.title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('login.subtitle')}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
          ]}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('login.password')}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
          ]}
        />

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <Pressable
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={onLogin}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>{t('login.submit')}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.textSecondary }]}>
            {t('login.back')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  back: {
    textAlign: 'center',
    fontSize: 15,
  },
});
