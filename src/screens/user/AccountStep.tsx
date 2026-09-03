import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [touched, setTouched] = React.useState({ email: false, password: false, confirm: false });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const emailError = touched.email && !EMAIL_PATTERN.test(data.email.trim()) ? t('userOnboarding.account.emailError') : '';
  const passwordError = touched.password && data.password.length < 6 ? t('userOnboarding.account.passwordError') : '';
  const confirmError = touched.confirm && data.password !== data.confirmPassword ? t('userOnboarding.account.confirmPasswordError') : '';
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
      <TextInput value={data.email} onChangeText={(email) => update({ email })} onBlur={() => setTouched((v) => ({ ...v, email: true }))} placeholder={t('userOnboarding.account.emailPlaceholder')} placeholderTextColor={colors.textSecondary} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { backgroundColor: colors.surface, borderColor: emailError ? colors.error : colors.border, color: colors.textPrimary }]} />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
      <PasswordField value={data.password} placeholder={t('userOnboarding.account.passwordPlaceholder')} visible={showPassword} error={passwordError} colors={colors} onChangeText={(password: string) => update({ password })} onBlur={() => setTouched((v) => ({ ...v, password: true }))} onToggle={() => setShowPassword((v) => !v)} showLabel={t('userOnboarding.account.hidePassword')} hideLabel={t('userOnboarding.account.showPassword')} />
      <PasswordField value={data.confirmPassword} placeholder={t('userOnboarding.account.confirmPasswordPlaceholder')} visible={showConfirm} error={confirmError} colors={colors} onChangeText={(confirmPassword: string) => update({ confirmPassword })} onBlur={() => setTouched((v) => ({ ...v, confirm: true }))} onToggle={() => setShowConfirm((v) => !v)} showLabel={t('userOnboarding.account.hidePassword')} hideLabel={t('userOnboarding.account.showPassword')} />
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
  error: { color: '#dc2626', fontSize: 13, marginTop: -8, marginBottom: 12 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, marginBottom: 4 },
  passwordInput: { flex: 1, borderWidth: 0, marginBottom: 0 },
  eye: { paddingHorizontal: 14, paddingVertical: 12 },
  eyeText: { fontSize: 18 },
});

function PasswordField({ value, placeholder, visible, error, colors, onChangeText, onBlur, onToggle, showLabel, hideLabel }: any) {
  return (
    <>
      <View style={[styles.passwordWrap, { backgroundColor: colors.surface, borderColor: error ? colors.error : colors.border }]}>
        <TextInput value={value} onChangeText={onChangeText} onBlur={onBlur} placeholder={placeholder} placeholderTextColor={colors.textSecondary} secureTextEntry={!visible} style={[styles.input, styles.passwordInput, { color: colors.textPrimary }]} />
        <Pressable style={styles.eye} onPress={onToggle} accessibilityLabel={visible ? showLabel : hideLabel} accessibilityRole="button">
          <Text style={[styles.eyeText, { color: colors.textSecondary }]}>👁</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );
}
