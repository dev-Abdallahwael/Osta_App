import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentUserId } from '../../services/auth';
import { getWorkerProfile, requestBoost, type WorkerProfile } from '../../services/worker';

function isFeaturedNow(p: WorkerProfile): boolean {
  if (!p.isFeatured) return false;
  if (!p.featuredUntil) return true;
  return p.featuredUntil.seconds * 1000 > Date.now();
}

export default function BoostScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);
      setError(false);
      (async () => {
        const uid = getCurrentUserId();
        if (!uid) {
          if (mounted) setLoading(false);
          return;
        }
        try {
          const p = await getWorkerProfile(uid);
          if (mounted) setProfile(p);
        } catch {
          if (mounted) setError(true);
        }
        if (mounted) setLoading(false);
      })();
      return () => {
        mounted = false;
      };
    }, []),
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />
      </View>
    );
  }

  const boosted = profile ? isFeaturedNow(profile) : false;
  const pending = profile ? Boolean(profile.boostRequested) : false;

  const handleRequest = useCallback(async () => {
    const uid = getCurrentUserId();
    if (!uid) return;
    setSubmitting(true);
    try {
      await requestBoost(uid);
      setProfile((p) => (p ? { ...p, boostRequested: true } : p));
    } finally {
      setSubmitting(false);
    }
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('boost.title')}
      </Text>

      {error ? (
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          {t('boost.error')}
        </Text>
      ) : boosted ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statusIcon, { color: colors.accent }]}>★</Text>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('boost.activeTitle')}
          </Text>
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            {profile?.featuredUntil
              ? t('boost.activeUntil', {
                  date: new Date(profile.featuredUntil.seconds * 1000).toLocaleDateString(),
                })
              : t('boost.activePermanent')}
          </Text>
        </View>
      ) : pending ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statusIcon, { color: colors.textSecondary }]}>⏳</Text>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('boost.pendingTitle')}
          </Text>
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            {t('boost.pendingBody')}
          </Text>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statusIcon, { color: colors.textSecondary }]}>👑</Text>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('boost.availableTitle')}
          </Text>
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            {t('boost.availableBody')}
          </Text>
          <Pressable
            style={[styles.boostBtn, { backgroundColor: colors.accent }]}
            onPress={handleRequest}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.boostBtnText}>{t('boost.requestBtn')}</Text>
            )}
          </Pressable>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('boost.howTitle')}
        </Text>
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          {t('boost.howBody')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  statusIcon: { fontSize: 32, textAlign: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  note: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  boostBtn: {
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 22,
    alignItems: 'center',
  },
  boostBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
