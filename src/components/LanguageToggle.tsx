import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import type { Language } from '../localization/i18n';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { colors } = useTheme();

  const options: { value: Language; label: string }[] = [
    { value: 'ar', label: 'AR' },
    { value: 'en', label: 'EN' },
  ];

  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      {options.map((opt) => {
        const active = language === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setLanguage(opt.value)}
            style={[
              styles.pill,
              { borderColor: colors.border },
              active && { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: colors.textSecondary },
                active && styles.pillTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pillText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
});
