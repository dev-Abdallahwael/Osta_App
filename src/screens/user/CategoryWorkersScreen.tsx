import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES } from '../../data/categories';
import type { UserStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<UserStackParamList, 'CategoryWorkers'>;

export default function CategoryWorkersScreen({ route }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const cat = CATEGORIES.find((c) => c.id === route.params.categoryId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {cat && (
        <>
          <Text style={[styles.icon, { color: colors.textPrimary }]}>{cat.icon}</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t(cat.nameKey)}</Text>
          <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
            {t('categoryWorkers.placeholder')}
          </Text>
        </>
      )}
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
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 15,
    textAlign: 'center',
  },
});
