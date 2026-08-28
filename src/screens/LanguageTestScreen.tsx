import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../components/LanguageToggle';

export default function LanguageTestScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language.test.title')}</Text>
      <Text style={styles.subtitle}>{t('language.test.subtitle')}</Text>

      <Text style={styles.intro}>{t('language.test.rowIntro')}</Text>

      <View style={styles.row}>
        <View style={[styles.box, styles.boxLeft]}>
          <Text style={styles.boxText}>{t('language.test.rowA')}</Text>
        </View>
        <View style={[styles.box, styles.boxRight]}>
          <Text style={styles.boxText}>{t('language.test.rowB')}</Text>
        </View>
      </View>

      <Text style={styles.description}>{t('language.test.description')}</Text>

      <View style={styles.toggleContainer}>
        <LanguageToggle />
        <Text style={styles.toggleCaption}>
          {t('language.test.arabic')} | {t('language.test.english')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
    textAlign: 'center',
  },
  intro: {
    fontSize: 14,
    color: '#64748b',
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
  boxLeft: {
    backgroundColor: '#2563eb',
  },
  boxRight: {
    backgroundColor: '#059669',
  },
  boxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 24,
    textAlign: 'center',
  },
  toggleContainer: {
    marginTop: 8,
  },
  toggleCaption: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8',
  },
});
