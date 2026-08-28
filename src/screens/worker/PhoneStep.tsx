import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';

const COUNTRY_CODE = '+20';

export default function PhoneStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update } = useWorkerOnboarding();

  function handleChange(raw: string) {
    const cleaned = raw.replace(/[^0-9]/g, '').replace(/^0+/, '');
    update({ phone: cleaned.slice(0, 10) });
  }

  return (
    <OnboardingLayout
      step={1}
      total={7}
      canContinue={data.phone.trim().length > 0}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('workerOnboarding.phone.title')}
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('workerOnboarding.phone.hint')}
      </Text>

      <View
        style={[
          styles.field,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={[styles.codeBadge, { backgroundColor: colors.background }]}>
          <Text style={styles.flag}>🇪🇬</Text>
          <Text style={[styles.code, { color: colors.textPrimary }]}>
            {COUNTRY_CODE}
          </Text>
        </View>
        <TextInput
          value={data.phone}
          onChangeText={handleChange}
          placeholder={t('workerOnboarding.phone.numberPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
          style={[styles.input, { color: colors.textPrimary }]}
        />
      </View>
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingRight: 16,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 12,
    margin: 1,
  },
  flag: {
    fontSize: 16,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
