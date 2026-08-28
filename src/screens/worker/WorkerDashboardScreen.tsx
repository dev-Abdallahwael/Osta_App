import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { getCurrentUserId } from '../../services/auth';
import { getWorkerProfile, type WorkerProfile } from '../../services/worker';
import UserAvatar from '../../components/UserAvatar';

export default function WorkerDashboardScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { clearRole, markWorkerOnboarded } = useApp();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const uid = getCurrentUserId();
      if (uid) {
        const p = await getWorkerProfile(uid);
        if (mounted) setProfile(p);
      } else {
        markWorkerOnboarded();
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [markWorkerOnboarded]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
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
        <View
          style={[
            styles.liveBadge,
            { backgroundColor: profile?.isAvailable ? colors.success : colors.border },
          ]}
        >
          <View
            style={[
              styles.liveDot,
              { backgroundColor: profile?.isAvailable ? colors.success : colors.textSecondary },
            ]}
          />
          <Text style={styles.liveText}>
            {t('workerDashboard.live')}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {t('workerDashboard.profileTitle')}
        </Text>
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>
          {t('workerDashboard.profileText')}
        </Text>
        {profile && profile.categories.length > 0 && (
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            {t('workerDashboard.services')}: {profile.categories.length}
          </Text>
        )}
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={clearRole}
      >
        <Text style={styles.buttonText}>{t('placeholder.switchRole')}</Text>
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
  content: {
    padding: 20,
    paddingTop: 70,
    flexGrow: 1,
    alignItems: 'center',
  },
  head: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
