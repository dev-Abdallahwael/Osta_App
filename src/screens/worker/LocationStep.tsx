import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useWorkerOnboarding } from '../../context/WorkerOnboardingContext';
import OnboardingLayout, { StepHeader } from '../../components/OnboardingLayout';

const RADII = [5, 15, 25, 35, 45, 55, 65, 75];

export default function LocationStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update } = useWorkerOnboarding();
  const [locating, setLocating] = useState(false);

  async function autoDetect() {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      const pos = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const place = geo[0];
      update({
        location: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address:
            (place?.street ? place.street + ', ' : '') +
            (place?.subregion ?? '') +
            (place?.city ? ', ' + place.city : ''),
          city: place?.city ?? place?.subregion ?? '',
        },
      });
    } catch (err) {
      console.warn('Location failed:', err);
    } finally {
      setLocating(false);
    }
  }

  return (
    <OnboardingLayout step={5} total={7} canContinue={data.location !== null}>
      <StepHeader
        title={t('workerOnboarding.location.title')}
        hint={t('workerOnboarding.location.hint')}
      />

      <Pressable
        onPress={autoDetect}
        style={[styles.detectBtn, { backgroundColor: colors.accent }]}
      >
        {locating ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.detectText}>{t('workerOnboarding.location.autoDetect')}</Text>
        )}
      </Pressable>

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t('workerOnboarding.location.orManual')}
      </Text>
      <TextInput
        value={data.location?.address ?? ''}
        onChangeText={(v) =>
          update({
            location: {
              lat: data.location?.lat ?? 0,
              lng: data.location?.lng ?? 0,
              address: v,
              city: data.location?.city ?? '',
            },
          })
        }
        placeholder={t('workerOnboarding.location.addressPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
        ]}
      />

      <Text style={[styles.radiusLabel, { color: colors.textPrimary }]}>
        {t('workerOnboarding.location.radius')}:
        {data.coverWholeCity
          ? ' ' + t('workerOnboarding.location.wholeCity')
          : ` ${data.radiusKm} km`}
      </Text>
      <View style={styles.radiusWrap}>
        {RADII.map((r) => {
          const active = !data.coverWholeCity && data.radiusKm === r;
          return (
            <Pressable
              key={r}
              onPress={() => update({ radiusKm: r, coverWholeCity: false })}
              style={[
                styles.radiusBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.radiusText,
                  { color: active ? colors.accent : colors.textSecondary },
                ]}
              >
                {r} km
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => update({ coverWholeCity: true })}
          style={[
            styles.radiusBtn,
            styles.cityBtn,
            {
              backgroundColor: colors.surface,
              borderColor: data.coverWholeCity ? colors.accent : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.radiusText,
              { color: data.coverWholeCity ? colors.accent : colors.textSecondary },
            ]}
          >
            {t('workerOnboarding.location.wholeCity')}
          </Text>
        </Pressable>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  detectBtn: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  detectText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  radiusWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  radiusBtn: {
    minWidth: 72,
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cityBtn: {
    minWidth: 108,
  },
  radiusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
