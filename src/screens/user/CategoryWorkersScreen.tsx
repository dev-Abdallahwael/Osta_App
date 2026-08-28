import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES } from '../../data/categories';
import type { HomeStackParamList } from '../../navigation/types';
import { getCurrentUserId } from '../../services/auth';
import { getUserProfile } from '../../services/user';
import { searchWorkers, type WorkerSearchHit } from '../../services/worker';
import UserAvatar from '../../components/UserAvatar';

type Props = NativeStackScreenProps<HomeStackParamList, 'CategoryWorkers'>;
type SortKey = 'distance' | 'rating' | 'price';

function isFeaturedNow(hit: WorkerSearchHit): boolean {
  if (!hit.isFeatured) return false;
  if (!hit.featuredUntil) return true;
  const untilMs = hit.featuredUntil.seconds * 1000;
  return untilMs > Date.now();
}

export default function CategoryWorkersScreen({ route }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const cat = CATEGORIES.find((c) => c.id === route.params.categoryId);
  const [inRange, setInRange] = useState<WorkerSearchHit[]>([]);
  const [nearest, setNearest] = useState<WorkerSearchHit[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('distance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const uid = getCurrentUserId();
      let userLocation: { lat: number; lng: number; city?: string } | null = null;
      if (uid) {
        const profile = await getUserProfile(uid);
        if (profile?.defaultLocation) {
          userLocation = {
            lat: profile.defaultLocation.lat,
            lng: profile.defaultLocation.lng,
            city: profile.defaultLocation.city || undefined,
          };
        }
      }
      const res = await searchWorkers({
        categoryId: route.params.categoryId,
        userLocation,
        sortBy: 'distance',
      });
      setInRange(res.inRange);
      setNearest(res.nearest);
    } catch (err) {
      console.warn('searchWorkers failed:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [route.params.categoryId]);

  useEffect(() => {
    load();
  }, [load]);

  const displayed = useCallback(() => {
    const list = inRange.length > 0 ? [...inRange] : [...nearest];
    if (sortBy === 'rating') list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    else if (sortBy === 'price') list.sort((a, b) => a.price - b.price || a.distanceKm - b.distanceKm);
    else list.sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }, [inRange, nearest, sortBy]);

  const showFallbackNotice = inRange.length === 0 && nearest.length > 0;

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'distance', label: t('categoryWorkers.sortDistance') },
    { key: 'rating', label: t('categoryWorkers.sortRating') },
    { key: 'price', label: t('categoryWorkers.sortPrice') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {cat && (
        <View style={styles.sectionHeader}>
          <Text style={[styles.catIcon, { color: colors.textPrimary }]}>{cat.icon}</Text>
          <View style={styles.flex}>
            <Text style={[styles.catName, { color: colors.textPrimary }]}>{t(cat.nameKey)}</Text>
            {inRange.length > 0 && (
              <Text style={[styles.count, { color: colors.textSecondary }]}>
                {inRange.length} {t('categoryWorkers.available')}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={[styles.sortRow, { borderColor: colors.border }]}>
        {sortOptions.map((opt) => {
          const active = sortBy === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setSortBy(opt.key)}
              style={[styles.sortPill, active && { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.sortText, { color: active ? '#fff' : colors.textSecondary }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />
      ) : error ? (
        <Text style={[styles.centerText, { color: colors.textSecondary }]}>
          {t('categoryWorkers.error')}
        </Text>
      ) : showFallbackNotice ? (
        <ScrollView contentContainerStyle={styles.list}>
          <Text style={[styles.fallbackNote, { color: colors.accent }]}>
            {t('categoryWorkers.noCoverage')}
          </Text>
          {displayed().map((hit) => (
            <WorkerCard
              key={hit.uid}
              hit={hit}
              onPress={() =>
                navigation.navigate('WorkerProfile', { workerId: hit.uid })
              }
            />
          ))}
        </ScrollView>
      ) : displayed().length > 0 ? (
        <ScrollView contentContainerStyle={styles.list}>
          {displayed().map((hit) => (
            <WorkerCard
              key={hit.uid}
              hit={hit}
              onPress={() =>
                navigation.navigate('WorkerProfile', { workerId: hit.uid })
              }
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={[styles.centerText, { color: colors.textSecondary }]}>
          {t('categoryWorkers.empty')}
        </Text>
      )}
    </View>
  );
}

function WorkerCard({ hit, onPress }: { hit: WorkerSearchHit; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const showFeatured = isFeaturedNow(hit);
  const distanceText =
    hit.distanceKm >= 0
      ? `${hit.distanceKm < 1 ? (hit.distanceKm * 1000).toFixed(0) + ' m' : hit.distanceKm.toFixed(1) + ' km'}`
      : '';

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <UserAvatar uri={hit.photoURL} size={56} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardName, { color: colors.textPrimary }]}>{hit.name}</Text>
          {showFeatured && (
            <View style={[styles.featuredBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.featuredText}>{t('categoryWorkers.featured')}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.price, { color: colors.textPrimary }]}>
            {hit.price > 0 ? `${hit.price} ${t('categoryWorkers.currencyPerHour')}` : t('categoryWorkers.priceNego')}
          </Text>
          <Text style={[styles.rating, { color: colors.textSecondary }]}>
            ★ {hit.ratingCount > 0 ? hit.ratingAvg.toFixed(1) : t('categoryWorkers.noRating')}
          </Text>
        </View>
        {distanceText ? (
          <Text style={[styles.distance, { color: colors.textSecondary }]}>
            📍 {distanceText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  catIcon: {
    fontSize: 34,
    marginRight: 12,
  },
  flex: {
    flex: 1,
  },
  catName: {
    fontSize: 20,
    fontWeight: '700',
  },
  count: {
    fontSize: 13,
    marginTop: 2,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sortPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 4,
  },
  fallbackNote: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
    paddingHorizontal: 24,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  featuredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  featuredText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  rating: {
    fontSize: 13,
  },
  distance: {
    fontSize: 13,
    marginTop: 6,
  },
});
