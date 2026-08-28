import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import OnboardingLayout, { StepHeader } from '../../components/OnboardingLayout';

export default function PriceStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update } = useWorkerOnboarding();

  function setPrice(categoryId: string, value: string) {
    const current = data.prices.find((p) => p.categoryId === categoryId);
    const next = current
      ? data.prices.map((p) =>
          p.categoryId === categoryId ? { ...p, price: value } : p,
        )
      : [...data.prices, { categoryId, price: value }];
    update({ prices: next });
  }

  function priceFor(categoryId: string): string {
    return data.prices.find((p) => p.categoryId === categoryId)?.price ?? '';
  }

  const allHavePrice =
    data.selectedCategories.length > 0 &&
    data.selectedCategories.every((c) => priceFor(c.id).trim().length > 0);

  return (
    <OnboardingLayout step={4} total={7} canContinue={allHavePrice} scroll={false}>
      <StepHeader
        title={t('workerOnboarding.price.title')}
        hint={t('workerOnboarding.price.hint')}
      />
      <FlatList
        data={data.selectedCategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={[styles.catName, { color: colors.textPrimary }]}>
              {t(item.nameKey)}
            </Text>
            <TextInput
              value={priceFor(item.id)}
              onChangeText={(v) => setPrice(item.id, v)}
              placeholder={t('workerOnboarding.price.from')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              style={[
                styles.input,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />
            <Text style={[styles.currency, { color: colors.textSecondary }]}>
              {t('workerOnboarding.price.perHour')}
            </Text>
          </View>
        )}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 34,
  },
  icon: {
    fontSize: 22,
  },
  catName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    width: 80,
    textAlign: 'center',
  },
  currency: {
    marginLeft: 6,
    fontSize: 14,
  },
});
