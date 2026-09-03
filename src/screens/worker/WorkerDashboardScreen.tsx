import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { getCurrentUserId } from '../../services/auth';
import {
  getWorkerProfile,
  setWorkerAvailability,
  type WorkerProfile,
} from '../../services/worker';
import type { RootStackParamList } from '../../navigation/types';
import UserAvatar from '../../components/UserAvatar';

export default function WorkerDashboardScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { clearRole, markWorkerOnboarded } = useApp();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [toggling, setToggling] = useState(false);

  const loadProfile = useCallback(async (onDone?: () => void) => {
    const uid = getCurrentUserId();
    if (uid) {
      try {
        const p = await getWorkerProfile(uid);
        setProfile(p);
        setError(false);
      } catch {
        setError(true);
      }
    } else {
      markWorkerOnboarded();
    }
    onDone?.();
  }, [markWorkerOnboarded]);

  useEffect(() => {
    let mounted = true;
    loadProfile(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [loadProfile, attempt]);

  useFocusEffect(
    useCallback(() => {
      // Refresh so live ratingAvg/ratingCount (and other data) reflect newly
      // submitted reviews whenever the dashboard regains focus.
      loadProfile();
    }, [loadProfile]),
  );

  const toggleAvailability = useCallback(async () => {
    if (toggling || !profile) return;
    const next = !profile.isAvailable;
    setToggling(true);
    const previous = profile.isAvailable;
    setProfile((p) => (p ? { ...p, isAvailable: next } : p));
    try {
      const uid = getCurrentUserId();
      if (uid) await setWorkerAvailability(uid, next);
    } catch (err) {
      console.warn('Availability update failed:', err);
      setProfile((p) => (p ? { ...p, isAvailable: previous } : p));
      Alert.alert(
        t('workerDashboard.toggleErrorTitle'),
        t('workerDashboard.toggleErrorBody'),
        [{ text: t('workerDashboard.ok') }],
      );
    } finally {
      setToggling(false);
    }
  }, [toggling, profile, t]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 14 }}>
          {t('common.error')}
        </Text>
        <Pressable
          style={[styles.retryBtn, { backgroundColor: colors.accent }]}
          onPress={() => {
            setLoading(true);
            setAttempt((a) => a + 1);
          }}
        >
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.head}>
        <UserAvatar uri={profile?.photoURL} size={88} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {profile?.name || t('workerDashboard.newWorker')}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            {profile && profile.ratingCount > 0
              ? t('workerDashboard.ratingWithCount', {
                  avg: profile.ratingAvg.toFixed(1),
                  count: profile.ratingCount,
                })
              : t('workerDashboard.ratingPlaceholder')}
          </Text>
        </View>

        <View
          style={[
            styles.availabilityCard,
            {
              backgroundColor: colors.surface,
              borderColor: profile?.isAvailable ? colors.success : colors.border,
            },
          ]}
        >
          <View>
            <Text style={[styles.availabilityLabel, { color: colors.textPrimary }]}>
              {profile?.isAvailable
                ? t('workerDashboard.availableNow')
                : t('workerDashboard.notAvailable')}
            </Text>
            <Text style={[styles.availabilityHint, { color: colors.textSecondary }]}>
              {t('workerDashboard.availabilityHint')}
            </Text>
          </View>
          <Switch
            value={profile?.isAvailable ?? false}
            onValueChange={toggleAvailability}
            disabled={toggling}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {t('workerDashboard.chatsTitle')}
      </Text>
      <Pressable
        style={[
          styles.emptyCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => navigation.navigate('Conversations' as never)}
      >
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('workerDashboard.chatsEmpty')}
        </Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {t('workerDashboard.profileTitle')}
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <InfoRow
          label={t('workerDashboard.phone')}
          value={profile?.phone || '—'}
          colors={colors}
        />
        <InfoRow
          label={t('workerDashboard.services')}
          value={profile ? String(profile.categories.length) : '—'}
          colors={colors}
        />
        <InfoRow
          label={t('workerDashboard.coverage')}
          value={
            profile
              ? profile.coversWholeCity
                ? t('workerDashboard.wholeCity')
                : `${profile.radiusKm} km`
              : '—'
          }
          colors={colors}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('WorkerOnboarding', { edit: true })}
        >
          <Text style={styles.actionText}>{t('workerDashboard.editProfile')}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.accent, borderWidth: 2 }]}
          onPress={() => navigation.navigate('WorkerBoost')}
        >
          <Text style={[styles.actionText, { color: colors.accent }]}>
            {t('workerDashboard.boost')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.surface }]}
          onPress={clearRole}
        >
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            {t('placeholder.switchRole')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { textPrimary: string; textSecondary: string };
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: 'center',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingTop: 70,
  },
  head: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  ratingRow: {
    marginTop: 6,
  },
  ratingText: {
    fontSize: 14,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    borderWidth: 1,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  availabilityHint: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
