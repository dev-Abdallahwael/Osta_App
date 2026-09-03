import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList } from '../../navigation/types';
import { submitReview, hasUserReviewedWorker } from '../../services/review';
import { getUserProfile } from '../../services/user';
import { getCurrentUserId } from '../../services/auth';

type Props = NativeStackScreenProps<HomeStackParamList, 'Review'>;

const STARS = [1, 2, 3, 4, 5];

export default function ReviewScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const { workerId, workerName } = route.params;

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const already = await hasUserReviewedWorker(workerId);
      if (mounted) {
        setAlreadyReviewed(already);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [workerId]);

  async function handleSubmit() {
    if (rating < 1 || submitting) return;
    setSubmitting(true);
    try {
      const me = await getSelfName();
      await submitReview(workerId, rating, text, me);
      Alert.alert(t('review.successTitle'), t('review.successBody'), [
        { text: t('review.ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const isDup = err && (err as Error).message === 'ALREADY_REVIEWED';
      Alert.alert(
        isDup ? t('review.alreadyTitle') : t('review.errorTitle'),
        isDup ? t('review.alreadyBody') : t('review.errorBody'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function getSelfName(): Promise<string> {
    const uid = getCurrentUserId();
    if (!uid) return '';
    const p = await getUserProfile(uid);
    return p?.name ?? '';
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      {alreadyReviewed ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.alreadyTitle, { color: colors.textPrimary }]}>
            {t('review.alreadyTitle')}
          </Text>
          <Text style={[styles.alreadyBody, { color: colors.textSecondary }]}>
            {t('review.alreadyBody')}
          </Text>
        </View>
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {workerName ? t('review.forWorker', { name: workerName }) : t('review.title')}
            </Text>
            <View style={styles.stars}>
              {STARS.map((s) => (
                <Pressable key={s} onPress={() => setRating(s)}>
                  <Text
                    style={[
                      styles.star,
                      { color: s <= rating ? '#f5a623' : colors.textSecondary },
                    ]}
                  >
                    ★
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t('review.inputPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border },
              ]}
            />
            <Pressable
              style={[
                styles.submitBtn,
                { backgroundColor: rating >= 1 ? colors.accent : colors.border },
              ]}
              onPress={handleSubmit}
              disabled={rating < 1 || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>{t('review.submit')}</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  hint: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  star: {
    fontSize: 34,
    marginHorizontal: 4,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  alreadyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  alreadyBody: {
    fontSize: 14,
    textAlign: 'center',
  },
});
