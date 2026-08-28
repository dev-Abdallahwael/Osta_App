import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';

export default function TestScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('language.test.title')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('language.test.subtitle')}
      </Text>

      <Text style={[styles.intro, { color: colors.textSecondary }]}>
        {t('language.test.rowIntro')}
      </Text>

      <View style={styles.row}>
        <View style={[styles.box, { backgroundColor: colors.accent }]}>
          <Text style={styles.boxText}>{t('language.test.rowA')}</Text>
        </View>
        <View style={[styles.box, { backgroundColor: colors.success }]}>
          <Text style={styles.boxText}>{t('language.test.rowB')}</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('language.test.description')}
      </Text>

      <View style={styles.toggleContainer}>
        <LanguageToggle
          activeColor={colors.accent}
          inactiveColor="transparent"
          textColor={colors.textSecondary}
          activeTextColor="#ffffff"
          containerColor={colors.surface}
        />
        <View style={styles.spacer} />
        <ThemeToggle />
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  intro: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  box: {
    width: 110,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  boxText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  toggleContainer: {
    marginTop: 8,
  },
  spacer: {
    height: 16,
  },
});
