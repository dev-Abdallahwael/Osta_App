import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { mode, colors, setMode } = useTheme();
  const { t } = useTranslation();

  const options: { value: 'dark' | 'light'; label: string }[] = [
    { value: 'dark', label: t('theme.dark') },
    { value: 'light', label: t('theme.light') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setMode(opt.value)}
            style={[
              styles.option,
              {
                backgroundColor: active ? colors.accent : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? '#ffffff' : colors.textSecondary },
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
    borderWidth: 1,
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
