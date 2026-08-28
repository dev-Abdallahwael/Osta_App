import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
  useWorkerOnboarding,
  type DayKey,
  type DayHours,
} from '../../context/WorkerOnboardingContext';
import OnboardingLayout, { StepHeader } from '../../components/OnboardingLayout';

const DAY_KEYS: DayKey[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
];

export default function HoursStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update } = useWorkerOnboarding();

  function toggleDay(day: DayKey) {
    const next = data.availableDays.includes(day)
      ? data.availableDays.filter((d) => d !== day)
      : [...data.availableDays, day];
    update({ availableDays: next });
  }

  function setTime(day: DayKey, field: keyof DayHours, value: string) {
    update({
      hours: { ...data.hours, [day]: { ...data.hours[day], [field]: value } },
    });
  }

  function renderSlot(
    active: boolean,
    onPress: () => void,
    value: string,
    chipsStyle: object,
  ) {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.chip,
          { backgroundColor: colors.surface, borderColor: active ? colors.accent : colors.border },
          chipsStyle,
        ]}
      >
        <Text style={[styles.chipText, { color: active ? colors.accent : colors.textSecondary }]}>
          {value}
        </Text>
      </Pressable>
    );
  }

  return (
    <OnboardingLayout
      step={6}
      total={7}
      canContinue={data.availableDays.length > 0}
      scroll={false}
    >
      <StepHeader
        title={t('workerOnboarding.hours.title')}
        hint={t('workerOnboarding.hours.hint')}
      />
      <FlatList
        data={DAY_KEYS}
        keyExtractor={(d) => d}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: day }) => {
          const enabled = data.availableDays.includes(day);
          const hours = data.hours[day];
          return (
            <View
              style={[
                styles.dayCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.dayHeader}>
                <Text
                  style={[
                    styles.dayName,
                    { color: enabled ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  {t(`workerOnboarding.days.${day}`)}
                </Text>
                <Pressable onPress={() => toggleDay(day)} hitSlop={8}>
                  <Text style={{ color: enabled ? colors.accent : colors.textSecondary, fontSize: 15, fontWeight: '700' }}>
                    {enabled
                      ? t('workerOnboarding.hours.remove')
                      : t('workerOnboarding.hours.add')}
                  </Text>
                </Pressable>
              </View>

              {enabled && (
                <View style={styles.slots}>
                  <View style={styles.slotCol}>
                    <Text style={[styles.slotLabel, { color: colors.textSecondary }]}>
                      {t('workerOnboarding.hours.from')}
                    </Text>
                    <View style={styles.slotsWrap}>
                      {TIME_SLOTS.map((v) =>
                        renderSlot(
                          hours.start === v,
                          () => setTime(day, 'start', v),
                          v,
                          styles.chipStart,
                        ),
                      )}
                    </View>
                  </View>
                  <View style={styles.slotCol}>
                    <Text style={[styles.slotLabel, { color: colors.textSecondary }]}>
                      {t('workerOnboarding.hours.to')}
                    </Text>
                    <View style={styles.slotsWrap}>
                      {TIME_SLOTS.map((v) =>
                        renderSlot(
                          hours.end === v,
                          () => setTime(day, 'end', v),
                          v,
                          styles.chipEnd,
                        ),
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
  dayCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
  },
  slots: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  slotCol: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  slotsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipStart: {},
  chipEnd: {},
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
