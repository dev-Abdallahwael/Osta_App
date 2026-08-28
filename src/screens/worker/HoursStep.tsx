import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
  useWorkerOnboarding,
  type DayKey,
} from '../../context/WorkerOnboardingContext';
import OnboardingLayout, { StepHeader } from '../../components/OnboardingLayout';
import type { ThemeTokens } from '../../theme/tokens';

const DAY_KEYS: DayKey[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

function to12h(value: string): { h: number; m: string; ampm: 'AM' | 'PM' } {
  const [hh, mm] = value.split(':').map(Number);
  return {
    h: hh % 12 === 0 ? 12 : hh % 12,
    m: String(mm).padStart(2, '0'),
    ampm: hh >= 12 ? 'PM' : 'AM',
  };
}

function fromParts(h: number, m: string, ampm: 'AM' | 'PM'): string {
  let hour24 = ampm === 'PM' ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
  return `${String(hour24).padStart(2, '0')}:${m}`;
}

export default function HoursStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update } = useWorkerOnboarding();

  const firstDay = data.availableDays.length > 0 ? data.availableDays[0] : 'sat';
  const start = to12h(data.hours[firstDay].start);
  const end = to12h(data.hours[firstDay].end);

  function toggleDay(day: DayKey) {
    const next = data.availableDays.includes(day)
      ? data.availableDays.filter((d) => d !== day)
      : [...data.availableDays, day];
    update({ availableDays: next });
  }

  function applyTime(field: 'start' | 'end', value: string) {
    const hours = { ...data.hours };
    const target: DayKey[] =
      data.availableDays.length > 0 ? data.availableDays : ['sat'];
    for (const day of target) {
      hours[day] = { ...hours[day], [field]: value };
    }
    update({ hours });
  }

  function nudge(field: 'start' | 'end', deltaHour: number) {
    const cur = field === 'start' ? start : end;
    let nextHour24 = (cur.ampm === 'PM'
      ? (cur.h === 12 ? 12 : cur.h + 12)
      : cur.h === 12 ? 0 : cur.h) + deltaHour;
    nextHour24 = (nextHour24 + 24) % 24;
    applyTime(field, `${String(nextHour24).padStart(2, '0')}:${cur.m}`);
  }

  function toggleAmpm(field: 'start' | 'end') {
    const cur = field === 'start' ? start : end;
    applyTime(field, fromParts(cur.h, cur.m, cur.ampm === 'AM' ? 'PM' : 'AM'));
  }

  return (
    <OnboardingLayout
      step={6}
      total={7}
      canContinue={data.availableDays.length > 0}
    >
      <StepHeader
        title={t('workerOnboarding.hours.title')}
        hint={t('workerOnboarding.hours.hint')}
      />

      <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
        {t('workerOnboarding.hours.selectDays')}
      </Text>
      <View style={styles.daysWrap}>
        {DAY_KEYS.map((day) => {
          const enabled = data.availableDays.includes(day);
          return (
            <Pressable
              key={day}
              onPress={() => toggleDay(day)}
              style={[
                styles.dayChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: enabled ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayChipText,
                  { color: enabled ? colors.accent : colors.textSecondary },
                ]}
              >
                {t(`workerOnboarding.days.${day}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
        {t('workerOnboarding.hours.timeRange')}
      </Text>
      <Text style={[styles.timeHint, { color: colors.textSecondary }]}>
        {t('workerOnboarding.hours.appliesToAll')}
      </Text>

      <View style={styles.cards}>
        <TimeCard
          colors={colors}
          label={t('workerOnboarding.hours.from')}
          time={start}
          onMinus={() => nudge('start', -1)}
          onPlus={() => nudge('start', 1)}
          onToggleAmpm={() => toggleAmpm('start')}
        />
        <TimeCard
          colors={colors}
          label={t('workerOnboarding.hours.to')}
          time={end}
          onMinus={() => nudge('end', -1)}
          onPlus={() => nudge('end', 1)}
          onToggleAmpm={() => toggleAmpm('end')}
        />
      </View>
    </OnboardingLayout>
  );
}

function TimeCard({
  colors,
  label,
  time,
  onMinus,
  onPlus,
  onToggleAmpm,
}: {
  colors: ThemeTokens;
  label: string;
  time: { h: number; m: string; ampm: 'AM' | 'PM' };
  onMinus: () => void;
  onPlus: () => void;
  onToggleAmpm: () => void;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.time, { color: colors.textPrimary }]}>
        {time.h}:{time.m}
      </Text>
      <View style={styles.controls}>
        <Pressable
          onPress={onMinus}
          style={[styles.controlBtn, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.controlText, { color: colors.accent }]}>−</Text>
        </Pressable>
        <Pressable
          onPress={onToggleAmpm}
          style={[
            styles.ampmBtn,
            { borderColor: colors.accent, borderWidth: 2 },
          ]}
        >
          <Text style={[styles.ampmText, { color: colors.accent }]}>
            {time.ampm}
          </Text>
        </Pressable>
        <Pressable
          onPress={onPlus}
          style={[styles.controlBtn, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.controlText, { color: colors.accent }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  dayChip: {
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeHint: {
    fontSize: 13,
    marginBottom: 16,
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'center',
  },
  time: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '600',
  },
  ampmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  ampmText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
