import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../localization/i18n';

interface Props {
  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
  activeTextColor?: string;
  containerColor?: string;
}

export default function LanguageToggle({
  activeColor = '#2563eb',
  inactiveColor = 'transparent',
  textColor = '#64748b',
  activeTextColor = '#ffffff',
  containerColor = '#e2e8f0',
}: Props) {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  const options: { value: Language; label: string }[] = [
    { value: 'ar', label: t('language.test.arabic') },
    { value: 'en', label: t('language.test.english') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: containerColor }]}>
      {options.map((opt) => {
        const active = language === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => toggleLanguage(opt.value)}
            style={[
              styles.option,
              {
                backgroundColor: active ? activeColor : inactiveColor,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? activeTextColor : textColor },
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
  container: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
