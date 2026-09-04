import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import type { Language } from '../localization/i18n';

export default function LanguageSelectScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { setLanguage } = useLanguage();
  const { markLanguageSelected } = useApp();
  const [busy, setBusy] = useState<Language | null>(null);

  const options: { value: Language; label: string; nativeLabel: string; icon: string }[] = [
    { value: 'ar', label: 'العربية', nativeLabel: 'Arabic', icon: '🇪🇬' },
    { value: 'en', label: 'English', nativeLabel: 'English', icon: '🌐' },
  ];

  async function chooseLanguage(lang: Language) {
    setBusy(lang);
    try {
      setLanguage(lang);
      await markLanguageSelected();
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.appName, { color: colors.accent }]}>
        {t('app.name')}
      </Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('languageSelect.title')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('languageSelect.subtitle')}
      </Text>

      <View style={styles.cardsRow}>
        {options.map((opt) => {
          const isActive = busy === opt.value;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              onPress={() => chooseLanguage(opt.value)}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {isActive ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <>
                  <Text style={styles.cardIcon}>{opt.icon}</Text>
                  <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
                    {opt.label}
                  </Text>
                  {opt.value !== opt.nativeLabel && (
                    <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                      {opt.nativeLabel}
                    </Text>
                  )}
                </>
              )}
            </Pressable>
          );
        })}
      </View>
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
  appName: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
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
    minHeight: 140,
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
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    textAlign: 'center',
  },
});
