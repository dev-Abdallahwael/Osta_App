import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.com$/i;

export default function AccountStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update, edit } = useWorkerOnboarding();
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const emailError = touched.email && !EMAIL_PATTERN.test(data.email.trim())
    ? t('workerOnboarding.account.emailError') : '';
  const passwordError = touched.password && data.password.length < 6
    ? t('workerOnboarding.account.passwordError') : '';
  const confirmError = touched.confirm && data.password !== data.confirmPassword
    ? t('workerOnboarding.account.confirmPasswordError') : '';
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
        onBlur={() => setTouched((v) => ({ ...v, email: true }))}
        placeholder={t('workerOnboarding.account.emailPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, { backgroundColor: colors.surface, borderColor: emailError ? colors.error : colors.border, color: colors.textPrimary }]}
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
        <PasswordField value={data.password} placeholder={t('workerOnboarding.account.passwordPlaceholder')} visible={showPassword} error={passwordError} colors={colors} onChangeText={(password: string) => update({ password })} onBlur={() => setTouched((v) => ({ ...v, password: true }))} onToggle={() => setShowPassword((v) => !v)} showLabel={t('workerOnboarding.account.hidePassword')} hideLabel={t('workerOnboarding.account.showPassword')} />
        <PasswordField value={data.confirmPassword} placeholder={t('workerOnboarding.account.confirmPasswordPlaceholder')} visible={showConfirm} error={confirmError} colors={colors} onChangeText={(confirmPassword: string) => update({ confirmPassword })} onBlur={() => setTouched((v) => ({ ...v, confirm: true }))} onToggle={() => setShowConfirm((v) => !v)} showLabel={t('workerOnboarding.account.hidePassword')} hideLabel={t('workerOnboarding.account.showPassword')} />
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
