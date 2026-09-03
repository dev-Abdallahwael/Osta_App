import React, { useEffect, useRef } from 'react';
import {
  Alert,
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
import { useWorkerOnboarding } from '../context/WorkerOnboardingContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WorkerOnboardingParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<WorkerOnboardingParamList>;

const STEP_NAMES = [
  'PhoneStep',
  'PersonalStep',
  'CategoriesStep',
  'PriceStep',
  'LocationStep',
  'HoursStep',
  'AccountStep',
  'ReviewStep',
] as const;

interface Props {
  step: number;
  total: number;
  canContinue?: boolean;
  scroll?: boolean;
  children: React.ReactNode;
  onFinish?: () => void;
}

export default function OnboardingLayout({
  step,
  total,
  canContinue = true,
  scroll = true,
  children,
  onFinish,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { edit } = useWorkerOnboarding();
  const insets = useSafeAreaInsets();
  const contentOffset = useRef(new Animated.Value(6)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    contentOffset.setValue(6);
    contentOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(contentOffset, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOffset, contentOpacity, step]);

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (edit) {
      navigation.navigate('Main' as never);
    } else {
      (navigation as Nav as { navigate: (s: string) => void }).navigate('RoleSelect');
    }
  }

  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={styles.listContent}>{children}</View>
  );

  function handlePrimary() {
    const next = STEP_NAMES[step];
    if (next) {
      navigation.navigate(next as never);
      return;
    }
    if (onFinish) {
      onFinish();
      return;
    }
    Alert.alert(
      t('workerOnboarding.review.comingSoonTitle'),
      t('workerOnboarding.review.comingSoonBody'),
    );
  }

  const isLastStep = step === total;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.accent }]}>‹</Text>
        </Pressable>
        <Text style={[styles.progress, { color: colors.textSecondary }]}>
          {t('workerOnboarding.step')} {step} {t('workerOnboarding.of')} {total}
        </Text>
        <View style={styles.backSpacer} />
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[styles.progressFill, { backgroundColor: colors.accent, width: `${(step / total) * 100}%` }]}
        />
      </View>

      <Animated.View style={[styles.animatedContent, { opacity: contentOpacity, transform: [{ translateY: contentOffset }] }]}>
        {content}
      </Animated.View>

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[
            styles.continueBtn,
            { backgroundColor: canContinue ? colors.accent : colors.border },
          ]}
          onPress={handlePrimary}
          disabled={!canContinue}
        >
          <Text style={styles.continueText}>
            {isLastStep
              ? t('workerOnboarding.submit')
              : t('workerOnboarding.continue')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

export function StepHeader({ title, hint }: { title: string; hint: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.heading}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
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
  backSpacer: {
    width: 44,
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
  heading: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  hint: {
    fontSize: 15,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  listContent: {
    flex: 1,
    paddingHorizontal: 20,
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
  continueBtn: {
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
  },
  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
