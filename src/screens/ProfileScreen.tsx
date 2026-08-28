import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { getCurrentUserId } from '../services/auth';
import { getWorkerProfile } from '../services/worker';
import { getUserProfile } from '../services/user';
import UserAvatar from '../components/UserAvatar';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { role, clearRole } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const uid = getCurrentUserId();
      if (!uid) {
        if (mounted) setLoading(false);
        return;
      }
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
        setPhoto(profilePhoto);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [role]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('profile.title')}</Text>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
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
            <Text style={[styles.phone, { color: colors.textSecondary }]}>{phone}</Text>
          ) : null}
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
    paddingTop: 60,
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
  phone: {
    fontSize: 15,
    marginTop: 10,
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
