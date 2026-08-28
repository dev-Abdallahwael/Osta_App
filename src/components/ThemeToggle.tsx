import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../theme/tokens';

export default function ThemeToggle() {
  const { mode, setMode, colors } = useTheme();

  const options: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: '🌙' },
    { value: 'light', label: '☀️' },
  ];

  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setMode(opt.value)}
            style={[
              styles.pill,
              { borderColor: colors.border },
              active && { backgroundColor: colors.accent },
            ]}
          >
            <Text style={[styles.pillText, { color: colors.textSecondary }, active && styles.pillTextActive]}>
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
    fontSize: 16,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
});
