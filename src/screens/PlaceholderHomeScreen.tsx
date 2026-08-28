import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function PlaceholderHomeScreen({ role }: { role: 'worker' | 'user' }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { clearRole } = useApp();
  const label = t(`placeholder.${role}.title`);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t(`placeholder.${role}.subtitle`)}
      </Text>
      <Pressable style={[styles.button, { backgroundColor: colors.accent }]} onPress={clearRole}>
        <Text style={styles.buttonText}>{t('placeholder.switchRole')}</Text>
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
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
