import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { useUserOnboarding } from '../../context/UserOnboardingContext';
import { useApp } from '../../context/AppContext';
import { submitUserProfile } from '../../services/user';
import UserOnboardingLayout from '../../components/UserOnboardingLayout';

export default function UserDetailsStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, update, reset } = useUserOnboarding();
  const { markUserOnboarded } = useApp();
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    if (saving) return;
    setSaving(true);
    try {
      await submitUserProfile(data);
      reset();
      await markUserOnboarded();
    } catch (err) {
      console.warn('User submit failed:', err);
      Alert.alert(
        t('userOnboarding.details.submitErrorTitle'),
        t('userOnboarding.details.submitErrorBody'),
      );
    } finally {
      setSaving(false);
    }
  }

  async function detectLocation() {
    if (locating) return;
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('userOnboarding.details.locationDeniedTitle'),
          t('userOnboarding.details.locationDeniedBody'),
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;
      let city = '';
      let address = '';
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (geo) {
          city = geo.city ?? geo.region ?? geo.subregion ?? '';
          address =
            [geo.street, geo.district, geo.subregion, geo.city]
              .filter(Boolean)
              .join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
      } catch {
        address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }
      update({ location: { lat: latitude, lng: longitude, address, city } });
    } catch (err) {
      console.warn('Location detect failed:', err);
      Alert.alert(
        t('userOnboarding.details.locationErrorTitle'),
        t('userOnboarding.details.locationErrorBody'),
      );
    } finally {
      setLocating(false);
    }
  }

  return (
    <UserOnboardingLayout
      step={2}
      total={2}
      canContinue={data.name.trim().length > 0}
      onFinish={handleFinish}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('userOnboarding.details.title')}
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('userOnboarding.details.hint')}
      </Text>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {t('userOnboarding.details.nameLabel')}
      </Text>
      <TextInput
        value={data.name}
        onChangeText={(name) => update({ name })}
        placeholder={t('userOnboarding.details.namePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
        ]}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {t('userOnboarding.details.locationLabel')}
      </Text>
      <Pressable
        style={[
          styles.locationCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={detectLocation}
      >
        {locating ? (
          <ActivityIndicator color={colors.accent} />
        ) : data.location ? (
          <View style={styles.flex}>
            <Text style={[styles.locationTitle, { color: colors.textPrimary }]}>
              📍 {data.location.city || t('userOnboarding.details.locationNearby')}
            </Text>
            <Text style={[styles.locationSub, { color: colors.textSecondary }]}>
              {data.location.address || t('userOnboarding.details.locationAddress')}
            </Text>
          </View>
        ) : (
          <View style={styles.flex}>
            <Text style={[styles.locationTitle, { color: colors.accent }]}>
              {t('userOnboarding.details.detectLocation')}
            </Text>
            <Text style={[styles.locationSub, { color: colors.textSecondary }]}>
              {t('userOnboarding.details.detectHint')}
            </Text>
          </View>
        )}
      </Pressable>
    </UserOnboardingLayout>
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
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  locationCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 72,
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationSub: {
    fontSize: 13,
  },
});
