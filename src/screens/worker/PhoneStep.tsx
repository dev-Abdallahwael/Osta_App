import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';

export default function PhoneStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update } = useWorkerOnboarding();

  return (
    <OnboardingLayout step={1} total={7} canContinue={data.phone.trim().length > 0}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('workerOnboarding.phone.title')}
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('workerOnboarding.phone.hint')}
      </Text>
      <TextInput
        value={data.phone}
        onChangeText={(v) => update({ phone: v })}
        placeholder={t('workerOnboarding.phone.placeholder')}
        placeholderTextColor={colors.textSecondary}
        keyboardType="phone-pad"
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
        ]}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
});
