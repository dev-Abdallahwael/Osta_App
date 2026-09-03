import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { completeOnboarding } = useApp();
  const [busy, setBusy] = useState<null | 'worker' | 'user'>(null);

  async function chooseRole(role: 'worker' | 'user') {
    // Each device gets its own identity via anonymous sign-in (App.tsx),
    // so role selection does not log into any shared account.
    setBusy(role);
    try {
      await completeOnboarding(role);
    } finally {
      setBusy(null);
    }
  }

  const cards: { role: 'worker' | 'user'; icon: string }[] = [
    { role: 'user', icon: '🙋' },
    { role: 'worker', icon: '🛠️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('roleSelect.title')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('roleSelect.subtitle')}
      </Text>

      <View style={styles.cardsRow}>
        {cards.map((c) => (
          <Pressable
            key={c.role}
            accessibilityRole="button"
            onPress={() => chooseRole(c.role)}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {busy === c.role ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Text style={styles.cardIcon}>{c.icon}</Text>
                <Text style={[styles.cardText, { color: colors.textPrimary }]}>
                  {t(`roleSelect.${c.role}.title`)}
                </Text>
                <Text
                  style={[styles.cardSub, { color: colors.textSecondary }]}
                >
                  {t(`roleSelect.${c.role}.subtitle`)}
                </Text>
              </>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
        <Text style={[styles.loginLinkText, { color: colors.accent }]}>
          {t('roleSelect.signInLink')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 36,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
  },
  card: {
    flex: 1,
    minHeight: 180,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 28,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
