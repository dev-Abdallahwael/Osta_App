import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useUserOnboarding } from '../../context/UserOnboardingContext';
import { useApp } from '../../context/AppContext';
import { submitUserProfile } from '../../services/user';
import { createAccount } from '../../services/auth';
import UserOnboardingLayout from '../../components/UserOnboardingLayout';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.com$/i;

export default function AccountStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update, reset } = useUserOnboarding();
  const { markUserOnboarded } = useApp();
  const [saving, setSaving] = React.useState(false);
  const valid =
    EMAIL_PATTERN.test(data.email.trim()) &&
    data.password.length >= 6 &&
    data.password === data.confirmPassword;

  async function handleFinish() {
    if (saving) return;
    setSaving(true);
    try {
      await createAccount(data.email, data.password);
      await submitUserProfile(data);
      reset();
      await markUserOnboarded();
    } catch (err) {
      console.warn('User account setup failed:', err);
      Alert.alert(
        t('userOnboarding.details.submitErrorTitle'),
        t('userOnboarding.details.submitErrorBody'),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <UserOnboardingLayout step={3} total={3} canContinue={valid && !saving} onFinish={handleFinish}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('userOnboarding.account.title')}
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('userOnboarding.account.hint')}
      </Text>
      <TextInput value={data.email} onChangeText={(email) => update({ email })} placeholder={t('userOnboarding.account.emailPlaceholder')} placeholderTextColor={colors.textSecondary} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} />
      <TextInput value={data.password} onChangeText={(password) => update({ password })} placeholder={t('userOnboarding.account.passwordPlaceholder')} placeholderTextColor={colors.textSecondary} secureTextEntry style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} />
      <TextInput value={data.confirmPassword} onChangeText={(confirmPassword) => update({ confirmPassword })} placeholder={t('userOnboarding.account.confirmPasswordPlaceholder')} placeholderTextColor={colors.textSecondary} secureTextEntry style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} />
      {saving ? <ActivityIndicator color={colors.accent} /> : null}
      <Text style={[styles.validation, { color: colors.textSecondary }]}>{t('userOnboarding.account.validation')}</Text>
    </UserOnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  hint: { fontSize: 15, marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 14 },
  validation: { fontSize: 13, lineHeight: 20, marginTop: 2 },
});
