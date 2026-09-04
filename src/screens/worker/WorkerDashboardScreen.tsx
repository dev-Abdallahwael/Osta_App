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
import {
  useNavigation,
  useFocusEffect,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { getCurrentUserId } from '../../services/auth';
import {
  getWorkerProfile,
  setWorkerAvailability,
  type WorkerProfile,
} from '../../services/worker';
import { subscribeToChats, type ChatSummary } from '../../services/chat';
import { getUserProfile } from '../../services/user';
import type { RootStackParamList, HomeStackParamList } from '../../navigation/types';
import UserAvatar from '../../components/UserAvatar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DashboardNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ChatRow extends ChatSummary {
  otherId: string;
  otherName: string;
}

function chatRelativeTime(
  ts: number,
  t: (k: string, o?: Record<string, unknown>) => string,
): string {
  if (!ts) return '';
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return t('chat.now');
  if (diffMin < 60) return t('chat.minuteAgo', { n: diffMin });
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return t('chat.hourAgo', { n: diffH });
  return t('chat.dayAgo', { n: Math.floor(diffH / 24) });
}

export default function WorkerDashboardScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<DashboardNavigation>();
  const { clearRole, markWorkerOnboarded } = useApp();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [chats, setChats] = useState<ChatRow[]>([]);

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

  useEffect(() => {
    const me = getCurrentUserId();
    if (!me) return;
    let mounted = true;
    const resolveNames = async (list: ChatSummary[]): Promise<ChatRow[]> => {
      return Promise.all(
        list.map(async (c) => {
          const otherId = c.participantIds.find((p) => p !== me) ?? '';
          let otherName = '';
          if (otherId) {
            const p = await getUserProfile(otherId);
            otherName = p?.name ?? '—';
          }
          return { ...c, otherId, otherName };
        }),
      );
    };
    const unsub = subscribeToChats(me, (list) => {
      resolveNames(list)
        .then((resolved) => {
          if (mounted) setChats(resolved);
        })
        .catch(() => {
          if (mounted) setChats([]);
        });
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

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
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 }]}
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
      {chats.length > 0 ? (
        <View
          style={[
            styles.chatsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {chats.map((c, idx) => (
            <Pressable
              key={c.chatId}
              onPress={() =>
                navigation.navigate('Chat', {
                  chatId: c.chatId,
                  otherId: c.otherId,
                  otherName: c.otherName,
                })
              }
              style={[styles.chatRow, idx > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}
            >
              <View style={[styles.chatAvatar, { backgroundColor: colors.background }]}>
                <Text style={styles.chatAvatarText}>👤</Text>
              </View>
              <View style={styles.chatBody}>
                <View style={styles.chatNameRow}>
                  <Text
                    style={[styles.chatName, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {c.otherName}
                  </Text>
                  {c.lastMessageAt ? (
                    <Text style={[styles.chatTime, { color: colors.textSecondary }]}>
                      {chatRelativeTime(c.lastMessageAt, t)}
                    </Text>
                  ) : null}
                </View>
                {c.lastMessage ? (
                  <Text
                    style={[styles.chatPreview, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {c.lastMessage}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Pressable
          style={[
            styles.emptyCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate('Conversations')}
        >
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('workerDashboard.chatsEmpty')}
          </Text>
        </Pressable>
      )}

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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chatsCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 12,
  },
  chatAvatarText: {
    fontSize: 20,
  },
  chatBody: {
    flex: 1,
  },
  chatNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  chatTime: {
    fontSize: 12,
    marginStart: 8,
  },
  chatPreview: {
    fontSize: 13,
    marginTop: 2,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
