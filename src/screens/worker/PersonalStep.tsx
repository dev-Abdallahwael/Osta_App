import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';

export default function PersonalStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update } = useWorkerOnboarding();

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      update({ photoUri: result.assets[0].uri });
    }
  }

  return (
    <OnboardingLayout step={2} total={8} canContinue={data.name.trim().length > 0}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('workerOnboarding.personal.title')}
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('workerOnboarding.personal.nameHint')}
      </Text>

      <TextInput
        value={data.name}
        onChangeText={(v) => update({ name: v })}
        placeholder={t('workerOnboarding.personal.namePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
        ]}
      />

      <Pressable onPress={pickPhoto} style={styles.photoButton}>
        {data.photoUri ? (
          <Image source={{ uri: data.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { borderColor: colors.border }]}>
            <Text style={[styles.photoPlaceholderText, { color: colors.textSecondary }]}>
              {t('workerOnboarding.personal.addPhoto')}
            </Text>
          </View>
        )}
      </Pressable>

      <Text style={[styles.bioLabel, { color: colors.textPrimary }]}>
        {t('workerOnboarding.personal.bioLabel')}
        <Text style={{ color: colors.textSecondary }}>
          {' '}
          {t('workerOnboarding.optional')}
        </Text>
      </Text>
      <TextInput
        value={data.bio}
        onChangeText={(v) => update({ bio: v })}
        placeholder={t('workerOnboarding.personal.bioPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        multiline
        style={[
          styles.bioInput,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
        ]}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  photoButton: {
    marginBottom: 20,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
