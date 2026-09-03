import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/categories';
import type { HomeStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserHomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { clearRole } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((c) => t(c.nameKey).toLowerCase().includes(q));
  }, [query, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {t('userHome.greeting')}
            </Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t('userHome.title')}
            </Text>
          </View>
          <Pressable
            onPress={clearRole}
            hitSlop={10}
            style={[styles.switchBtn, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.switchText, { color: colors.accent }]}>
              {t('userHome.switchAccount')}
            </Text>
          </Pressable>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('userHome.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.searchInput,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 && (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            {t('userHome.noResults')}
          </Text>
        )}
        {filtered.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              Keyboard.dismiss();
              navigation.navigate('CategoryWorkers', { categoryId: cat.id });
            }}
          >
            <Text style={styles.cardIcon}>{cat.icon}</Text>
            <Text style={[styles.cardName, { color: colors.textPrimary }]}>
              {t(cat.nameKey)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  card: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  empty: {
    width: '100%',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
