import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db, hasConfig } from './firebase';
import { getCurrentUserId } from './auth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = 'messages';

function resolveProjectId(): string | null {
  const easId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    null;
  const envId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    process.env.EXPO_PUBLIC_EXPO_PROJECT_ID ??
    null;
  return (easId || envId) ?? null;
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function getExpoPushToken(): Promise<string | null> {
  const projectId = resolveProjectId();
  if (!projectId) return null;
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;
  if (finalStatus !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    finalStatus = req.status;
  }
  if (finalStatus !== 'granted') return null;
  if (Platform.OS === 'android') await ensureChannel();
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export async function registerForPushNotifications(
  role: 'worker' | 'user',
): Promise<void> {
  if (!hasConfig || !db) return;
  const uid = getCurrentUserId();
  if (!uid) return;
  if (!Device.isDevice) return;
  const token = await getExpoPushToken().catch((err) => {
    console.warn('push token fetch failed:', err);
    return null;
  });
  if (!token) return;

  const ref = role === 'worker' ? doc(db, 'workers', uid) : doc(db, 'users', uid);
  await setDoc(
    ref,
    { pushToken: token, pushPlatform: Platform.OS },
    { merge: true },
  );
}
