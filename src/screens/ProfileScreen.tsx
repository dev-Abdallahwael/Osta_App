import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { getCurrentUserEmail, getCurrentUserId } from '../services/auth';
import { getWorkerProfile } from '../services/worker';
import { getUserProfile } from '../services/user';
import UserAvatar from '../components/UserAvatar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { role, clearRole } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    (async () => {
      const uid = getCurrentUserId();
      const currentEmail = getCurrentUserEmail() ?? '';
      if (!uid) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        let profileName = '';
        let profilePhone = '';
        let profilePhoto = '';
        if (role === 'worker') {
          const p = await getWorkerProfile(uid);
          profileName = p?.name ?? '';
          profilePhone = p?.phone ?? '';
          profilePhoto = p?.photoURL ?? '';
        } else {
          const p = await getUserProfile(uid);
          profileName = p?.name ?? '';
          profilePhone = p?.phone ?? '';
        }
        if (mounted) {
          setName(profileName);
          setPhone(profilePhone);
          setEmail(currentEmail);
          setPhoto(profilePhoto);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [role, attempt]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary, marginTop: insets.top + 8 }]}>{t('profile.title')}</Text>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.card}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 12 }}>
            {t('common.error')}
          </Text>
          <Pressable
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            onPress={() => setAttempt((a) => a + 1)}
          >
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <UserAvatar uri={photo} size={80} />
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {name || t('profile.anonymous')}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.background }]}>
            <Text style={[styles.roleText, { color: colors.accent }]}>
              {role === 'worker' ? t('profile.roleWorker') : t('profile.roleUser')}
            </Text>
          </View>
          {phone ? (
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              {t('profile.phone')}: {phone}
            </Text>
          ) : null}
          <View style={styles.credentials}>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              {t('profile.email')}: {email || t('profile.notSet')}
            </Text>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              {t('profile.password')}: {email ? '********' : t('profile.notSet')}
            </Text>
          </View>
        </View>
      )}

      <Pressable
        style={[styles.backBtn, { backgroundColor: colors.accent }]}
        onPress={clearRole}
      >
        <Text style={styles.backText}>{t('switchAccount')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detail: {
    fontSize: 15,
    marginTop: 10,
  },
  credentials: {
    alignSelf: 'stretch',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: 'center',
    alignSelf: 'center',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  backBtn: {
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
