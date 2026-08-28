import { setDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, hasConfig } from './firebase';
import { getCurrentUserId } from './auth';

export interface UserOnboardingData {
  phone: string;
  name: string;
  location: { lat: number; lng: number; address: string; city: string } | null;
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  defaultLocation: { lat: number; lng: number; address: string; city: string } | null;
}

export async function submitUserProfile(data: UserOnboardingData): Promise<string> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }
  const uid = getCurrentUserId();
  if (!uid) {
    throw new Error('No signed-in user');
  }

  const payload = {
    uid,
    name: data.name,
    phone: '+20' + data.phone,
    defaultLocation: data.location
      ? {
          lat: data.location.lat,
          lng: data.location.lng,
          address: data.location.address,
          city: data.location.city,
        }
      : null,
    createdAt: Timestamp.now(),
  };

  await setDoc(doc(db, 'users', uid), payload, { merge: true });
  return uid;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!hasConfig || !db) {
    return null;
  }
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) {
    return null;
  }
  const d = snap.data() as UserProfile & Record<string, unknown>;
  const loc = (d.defaultLocation ?? null) as
    | { lat: number; lng: number; address: string; city: string }
    | null;
  return {
    uid: d.uid ?? userId,
    name: String(d.name ?? ''),
    phone: String(d.phone ?? ''),
    defaultLocation: loc
      ? {
          lat: Number(loc.lat ?? 0),
          lng: Number(loc.lng ?? 0),
          address: String(loc.address ?? ''),
          city: String(loc.city ?? ''),
        }
      : null,
  };
}
