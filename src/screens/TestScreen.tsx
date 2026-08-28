import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';
import { CATEGORIES } from '../data/categories';

function SettingSection({
  label,
  hint,
  colors,
  children,
}: {
  label: string;
  hint: string;
  colors: { surface: string; border: string; textPrimary: string; textSecondary: string };
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
        {label}
      </Text>
      <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
        {hint}
      </Text>
      {children}
    </View>
  );
}

export default function TestScreen() {
  const { t } = useTranslation();
  const { colors, mode } = useTheme();
  const modeLabel = mode === 'dark' ? t('theme.dark') : t('theme.light');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('settings.title')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('settings.subtitle', { mode: modeLabel })}
      </Text>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              {t('test.categories.title')}
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
              {t('test.categories.hint')}
            </Text>
          </>
        }
        ListFooterComponent={
          <>
            <SettingSection
              label={t('settings.languageLabel')}
              hint={t('settings.languageHint')}
              colors={colors}
            >
              <LanguageToggle />
            </SettingSection>

            <SettingSection
              label={t('settings.themeLabel')}
              hint={t('settings.themeHint')}
              colors={colors}
            >
              <ThemeToggle />
            </SettingSection>
          </>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.categoryCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text
              style={[styles.categoryName, { color: colors.textPrimary }]}
              numberOfLines={2}
            >
              {t(item.nameKey)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  listContent: {
    padding: 20,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
  categoryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
  },
  categoryIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    marginBottom: 14,
  },
});
