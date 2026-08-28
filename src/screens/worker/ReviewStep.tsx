import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import OnboardingLayout, { StepHeader } from '../../components/OnboardingLayout';

export default function ReviewStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data } = useWorkerOnboarding();

  function priceFor(categoryId: string): string {
    return (
      data.prices.find((p) => p.categoryId === categoryId)?.price ?? '—'
    );
  }

  return (
    <OnboardingLayout step={7} total={7} scroll={false}>
      <StepHeader
        title={t('workerOnboarding.review.title')}
        hint={t('workerOnboarding.review.hint')}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {data.photoUri && (
          <View style={styles.photoWrap}>
            <Image source={{ uri: data.photoUri }} style={styles.photo} />
          </View>
        )}

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
                {priceFor(c.id)} {t('workerOnboarding.price.currency')}
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
                {t('workerOnboarding.review.radius')}: {data.radiusKm} km
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
                  {h.start} – {h.end}
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
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
