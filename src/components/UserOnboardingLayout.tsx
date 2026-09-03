import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserOnboardingParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<UserOnboardingParamList>;

const STEP_NAMES = ['UserPhoneStep', 'UserDetailsStep', 'AccountStep'] as const;

interface Props {
  step: number;
  total: number;
  canContinue?: boolean;
  onFinish?: () => void;
  children: React.ReactNode;
}

export default function UserOnboardingLayout({
  step,
  total,
  canContinue = true,
  onFinish,
  children,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const contentOffset = useRef(new Animated.Value(18)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    contentOffset.setValue(18);
    contentOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(contentOffset, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOffset, contentOpacity, step]);

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as Nav as { navigate: (s: string) => void }).navigate('RoleSelect');
    }
  }

  function handlePrimary() {
    const next = STEP_NAMES[step];
    if (next) {
      navigation.navigate(next);
      return;
    }
    if (onFinish) {
      onFinish();
    }
  }

  const isLast = step === total;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {step > 1 ? (
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.accent }]}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={[styles.progress, { color: colors.textSecondary }]}>
          {t('workerOnboarding.step')} {step} {t('workerOnboarding.of')} {total}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: colors.accent, width: `${(step / total) * 100}%` }]}
        />
      </View>

      <Animated.View style={[styles.animatedContent, { opacity: contentOpacity, transform: [{ translateY: contentOffset }] }]}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </Animated.View>

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[
            styles.primaryBtn,
            { backgroundColor: canContinue ? colors.accent : colors.border },
          ]}
          onPress={handlePrimary}
          disabled={!canContinue}
        >
          <Text style={styles.primaryText}>
            {isLast ? t('userOnboarding.finish') : t('workerOnboarding.continue')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 34,
    lineHeight: 36,
  },
  progress: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtn: {
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
