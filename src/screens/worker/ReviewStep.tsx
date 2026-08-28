import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import { useApp } from '../../context/AppContext';
import { submitWorkerProfile } from '../../services/worker';
import UserAvatar from '../../components/UserAvatar';
import OnboardingLayout, { StepHeader } from '../../components/OnboardingLayout';

export default function ReviewStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { data, reset, edit } = useWorkerOnboarding();
  const { markWorkerOnboarded } = useApp();
  const [saving, setSaving] = useState(false);

  function to12h(value: string): string {
    const [hh, mm] = value.split(':').map(Number);
    const period = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${String(mm).padStart(2, '0')} ${period}`;
  }

  function priceFor(categoryId: string): string {
    return (
      data.prices.find((p) => p.categoryId === categoryId)?.price ?? '—'
    );
  }

  async function handleFinish() {
    if (saving) return;
    setSaving(true);
    try {
      await submitWorkerProfile(data, edit);
      reset();
      if (edit) {
        navigation.getParent()?.navigate('WorkerHome' as never);
      } else {
        await markWorkerOnboarded();
      }
    } catch (err) {
      console.warn('Submit failed:', err);
      Alert.alert(
        t('workerOnboarding.review.submitErrorTitle'),
        t('workerOnboarding.review.submitErrorBody'),
        [{ text: t('workerOnboarding.review.retry'), onPress: () => handleFinish() }],
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingLayout step={7} total={7} scroll={false} onFinish={handleFinish} canContinue={!saving}>
      <StepHeader
        title={edit ? t('workerOnboarding.review.editTitle') : t('workerOnboarding.review.title')}
        hint={edit ? t('workerOnboarding.review.editHint') : t('workerOnboarding.review.hint')}
      />
      {saving && (
        <View style={styles.savingBar}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.savingText, { color: colors.textSecondary }]}>
            {t('workerOnboarding.review.saving')}
          </Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.photoWrap}>
          <UserAvatar uri={data.photoUri} size={96} />
        </View>

        <Row label={t('workerOnboarding.review.name')}>{data.name}</Row>
        <Row label={t('workerOnboarding.review.phone')}>{data.phone}</Row>
        {data.bio ? <Row label={t('workerOnboarding.review.bio')}>{data.bio}</Row> : null}

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          {t('workerOnboarding.review.services')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {data.selectedCategories.map((c) => (
            <View key={c.id} style={styles.serviceRow}>
              <Text style={{ color: colors.textPrimary }}>{c.icon}</Text>
              <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
                {t(c.nameKey)}
              </Text>
              <Text style={{ color: colors.textPrimary }}>
                {priceFor(c.id)} {t('workerOnboarding.price.perHour')}
              </Text>
            </View>
          ))}
        </View>

        {data.location && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              {t('workerOnboarding.review.location')}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.locationText, { color: colors.textPrimary }]}>
                {data.location.address}
              </Text>
              <Text style={[styles.locationSub, { color: colors.textSecondary }]}>
                {t('workerOnboarding.review.radius')}:{' '}
                {data.coverWholeCity
                  ? t('workerOnboarding.location.wholeCity')
                  : `${data.radiusKm} km`}
              </Text>
            </View>
          </>
        )}

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          {t('workerOnboarding.review.hours')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {data.availableDays.map((day) => {
            const h = data.hours[day];
            return (
              <View key={day} style={styles.serviceRow}>
                <Text style={{ color: colors.textPrimary }}>
                  {t(`workerOnboarding.days.${day}`)}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {to12h(h.start)} – {to12h(h.end)}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={[styles.note, { color: colors.textSecondary }]}>
          {t('workerOnboarding.review.note')}
        </Text>
      </ScrollView>
    </OnboardingLayout>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  photoWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  savingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  savingText: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginStart: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  serviceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 15,
  },
  locationSub: {
    fontSize: 13,
    marginTop: 4,
  },
  note: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
});
