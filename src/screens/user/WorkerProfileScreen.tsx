import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES } from '../../data/categories';
import type { HomeStackParamList } from '../../navigation/types';
import { getWorkerProfile, type WorkerProfile } from '../../services/worker';
import { getOrCreateChat } from '../../services/chat';
import { getWorkerReviews, type Review } from '../../services/review';
import { getCurrentUserId } from '../../services/auth';
import { createReport } from '../../services/report';
import UserAvatar from '../../components/UserAvatar';

type Props = NativeStackScreenProps<HomeStackParamList, 'WorkerProfile'>;

const REVIEWS_PER_PAGE = 5;

function to12h(value: string): string {
  const [hh, mm] = value.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`;
}

const DAY_ORDER = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

export default function WorkerProfileScreen({ route }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [chatting, setChatting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const p = await getWorkerProfile(route.params.workerId);
        const r = await getWorkerReviews(route.params.workerId);
        if (mounted) {
          setWorker(p);
          setReviews(r);
          setVisibleCount(REVIEWS_PER_PAGE);
        }
      } catch {
        if (mounted) setError(true);
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [route.params.workerId, attempt]);

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
          onPress={() => setAttempt((a) => a + 1)}
        >
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>{t('workerProfile.notFound')}</Text>
      </View>
    );
  }

  if (worker.isHidden) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>{t('workerProfile.hidden')}</Text>
      </View>
    );
  }

  const categories = CATEGORIES.map((c) => {
    const entry = worker.categories.find((x) => x.categoryId === c.id);
    return entry ? { id: c.id, icon: c.icon, nameKey: c.nameKey, price: entry.startingPrice } : null;
  }).filter(Boolean) as { id: string; icon: string; nameKey: string; price: number }[];

  const dayEntries = DAY_ORDER.filter((d) => worker.availableHours?.[d]).map((d) => ({
    day: d,
    start: worker.availableHours[d].start,
    end: worker.availableHours[d].end,
  }));

  async function handleChat() {
    if (chatting || !worker) return;
    const me = getCurrentUserId();
    if (!me) return;
    setChatting(true);
    try {
      const chatId = await getOrCreateChat(me, route.params.workerId);
      navigation.navigate('Chat', {
        chatId,
        otherId: route.params.workerId,
        otherName: worker.name,
      });
    } catch (err) {
      console.warn('open chat failed:', err);
    } finally {
      setChatting(false);
    }
  }

  function handleReport() {
    const reasons = [
      t('report.reasonFake'),
      t('report.reasonSpam'),
      t('report.reasonInappropriate'),
      t('report.reasonOther'),
    ];
    Alert.alert(t('report.title'), t('report.body'), [
      ...reasons.map((reason) => ({
        text: reason,
        onPress: () => submitReport('worker', route.params.workerId, reason),
      })),
      { text: t('report.cancel'), style: 'cancel' as const },
    ]);
  }

  async function submitReport(targetType: 'worker' | 'chat', targetId: string, reason: string) {
    try {
      await createReport(targetType, targetId, reason);
      Alert.alert(t('report.sentTitle'), t('report.sentBody'));
    } catch (err) {
      console.warn('report failed:', err);
      Alert.alert(t('report.failTitle'), t('report.failBody'));
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <UserAvatar uri={worker.photoURL} size={84} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>{worker.name}</Text>
        <Text style={[styles.rating, { color: colors.textSecondary }]}>
          ★ {worker.ratingCount > 0 ? worker.ratingAvg.toFixed(1) : t('workerProfile.noRating')}
          {worker.ratingCount > 0 ? ` (${worker.ratingCount})` : ''}
        </Text>
        {worker.isAvailable && (
          <View style={[styles.availableBadge, { backgroundColor: colors.success + '22' }]}>
            <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>
              {t('workerProfile.available')}
            </Text>
          </View>
        )}
      </View>

      {worker.bio ? (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('workerProfile.bio')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{worker.bio}</Text>
        </View>
      ) : null}

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('workerProfile.services')}
        </Text>
        {categories.map((c) => (
          <View key={c.id} style={styles.serviceRow}>
            <Text style={styles.serviceIcon}>{c.icon}</Text>
            <Text style={[styles.serviceName, { color: colors.textPrimary }]}>{t(c.nameKey)}</Text>
            <Text style={[styles.servicePrice, { color: colors.textPrimary }]}>
              {c.price > 0 ? `${c.price} ${t('categoryWorkers.currencyPerHour')}` : t('categoryWorkers.priceNego')}
            </Text>
          </View>
        ))}
      </View>

      {dayEntries.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('workerProfile.hours')}
          </Text>
          {dayEntries.map((e) => (
            <View key={e.day} style={styles.dayRow}>
              <Text style={[styles.dayName, { color: colors.textPrimary }]}>
                {t(`workerOnboarding.hours.days.${e.day}`)}
              </Text>
              <Text style={[styles.dayTime, { color: colors.textSecondary }]}>
                {to12h(e.start)} – {to12h(e.end)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('workerProfile.coverage')}
        </Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          {worker.coversWholeCity
            ? t('workerProfile.coverageWholeCity')
            : t('workerProfile.coverageRadius', { radius: worker.radiusKm })}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('workerProfile.reviews')} ({reviews.length})
        </Text>
        {reviews.length === 0 ? (
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t('workerProfile.noReviews')}
          </Text>
        ) : (
          reviews.slice(0, visibleCount).map((r) => (
            <View key={r.id} style={styles.reviewItem}>
              <View style={styles.reviewHead}>
                <Text style={[styles.reviewName, { color: colors.textPrimary }]}>
                  {r.userName || '—'}
                </Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Text
                      key={s}
                      style={[
                        styles.reviewStar,
                        { color: s <= r.rating ? '#f5a623' : colors.textSecondary },
                      ]}
                    >
                      ★
                    </Text>
                  ))}
                </View>
              </View>
              {r.text ? (
                <Text style={[styles.reviewText, { color: colors.textSecondary }]}>{r.text}</Text>
              ) : null}
            </View>
          ))
        )}
        {visibleCount < reviews.length && (
          <Pressable
            style={[styles.loadMoreBtn, { backgroundColor: colors.accent }]}
            onPress={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
          >
            <Text style={styles.loadMoreText}>{t('workerProfile.loadMore')}</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        style={[styles.chatBtn, { backgroundColor: colors.accent }]}
        onPress={handleChat}
      >
        <Text style={styles.chatText}>
          {chatting ? t('workerProfile.chatting') : t('workerProfile.chat')}
        </Text>
      </Pressable>

      <Pressable style={styles.reportBtn} onPress={handleReport}>
        <Text style={[styles.reportText, { color: '#d32f2f' }]}>{t('report.report')}</Text>
      </Pressable>
    </ScrollView>
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  rating: {
    fontSize: 15,
    marginTop: 4,
  },
  availableBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  serviceIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  serviceName: {
    flex: 1,
    fontSize: 14,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  reviewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewStar: {
    fontSize: 14,
    marginLeft: 1,
  },
  reviewText: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  loadMoreBtn: {
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  dayName: {
    fontSize: 14,
  },
  dayTime: {
    fontSize: 14,
  },
  chatBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
  },
  reportBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  reportText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chatText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
