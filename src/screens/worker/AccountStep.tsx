import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.com$/i;

export default function AccountStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update, edit } = useWorkerOnboarding();
  const valid =
    edit ||
    EMAIL_PATTERN.test(data.email.trim()) &&
    data.password.length >= 6 &&
    data.password === data.confirmPassword;

  return (
    <OnboardingLayout step={7} total={8} canContinue={valid}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('workerOnboarding.account.title')}
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('workerOnboarding.account.hint')}
      </Text>
      <TextInput
        value={data.email}
        onChangeText={(email) => update({ email })}
        placeholder={t('workerOnboarding.account.emailPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
      />
      <TextInput
        value={data.password}
        onChangeText={(password) => update({ password })}
        placeholder={t('workerOnboarding.account.passwordPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
      />
      <TextInput
        value={data.confirmPassword}
        onChangeText={(confirmPassword) => update({ confirmPassword })}
        placeholder={t('workerOnboarding.account.confirmPasswordPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
      />
      <Text style={[styles.validation, { color: colors.textSecondary }]}>
        {t('workerOnboarding.account.validation')}
      </Text>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  hint: { fontSize: 15, marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 14 },
  validation: { fontSize: 13, lineHeight: 20, marginTop: 2 },
});
