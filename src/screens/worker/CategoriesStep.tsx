import React from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import { CATEGORIES, type Category } from '../../data/categories';
import OnboardingLayout, { StepHeader } from '../../components/OnboardingLayout';

export default function CategoriesStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update } = useWorkerOnboarding();

  function toggleCategory(category: Category) {
    const next = data.selectedCategories.some((c) => c.id === category.id)
      ? data.selectedCategories.filter((c) => c.id !== category.id)
      : [...data.selectedCategories, category];
    update({
      selectedCategories: next,
      prices: data.prices.filter((p) =>
        next.some((c) => c.id === p.categoryId),
      ),
    });
  }

  return (
    <OnboardingLayout
      step={3}
      total={7}
      canContinue={data.selectedCategories.length > 0}
      scroll={false}
    >
      <StepHeader
        title={t('workerOnboarding.categories.title')}
        hint={t('workerOnboarding.categories.hint')}
      />
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => {
          const active = data.selectedCategories.some((c) => c.id === item.id);
          return (
            <Pressable
              onPress={() => toggleCategory(item)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text
                style={[styles.name, { color: colors.textPrimary }]}
                numberOfLines={2}
              >
                {t(item.nameKey)}
              </Text>
            </Pressable>
          );
        }}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  gridRow: {
    gap: 10,
    marginBottom: 10,
  },
  gridContent: {
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 84,
  },
  icon: {
    fontSize: 24,
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
