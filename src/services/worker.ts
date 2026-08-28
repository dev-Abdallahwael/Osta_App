import { setDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage, hasConfig } from './firebase';
import { getCurrentUserId } from './auth';
import type { WorkerOnboardingData } from '../context/WorkerOnboardingContext';
import type { Category } from '../data/categories';

export interface SubmitWorkerResult {
  workerId: string;
  photoURL: string;
}

async function uploadPhoto(workerId: string, uri: string): Promise<string> {
  const ref = storageRef(storage!, `workers/${workerId}/photo.jpg`);
  const res = await fetch(uri);
  const blob = await res.blob();
  await uploadBytes(ref, blob, { contentType: res.headers.get('content-type') ?? 'image/jpeg' });
  return getDownloadURL(ref);
}

function toDateCompat(): object {
  // serverTimestamp is unsupported in plain objects in some RN setups; prefer client Timestamp.
  return Timestamp.now();
}

export async function submitWorkerProfile(
  data: WorkerOnboardingData,
): Promise<SubmitWorkerResult> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }

  const uid = getCurrentUserId();
  if (!uid) {
    throw new Error('No signed-in user');
  }

  const priceMap = new Map<string, string>(
    data.prices.map((p) => [p.categoryId, p.price]),
  );

  const categories = data.selectedCategories.map((c: Category) => ({
    categoryId: c.id,
    startingPrice: Number(priceMap.get(c.id) ?? 0) || 0,
  }));

  let photoURL = '';
  if (data.photoUri && storage) {
    try {
      photoURL = await uploadPhoto(uid, data.photoUri);
    } catch {
      // Storage may not be enabled on the free plan; continue without a photo.
      photoURL = '';
    }
  }

  const availableHours: Record<string, { start: string; end: string }> = {};
  for (const day of data.availableDays) {
    availableHours[day] = {
      start: data.hours[day].start,
      end: data.hours[day].end,
    };
  }

  const workerPayload = {
    uid,
    name: data.name,
    phone: '+20' + data.phone,
    photoURL,
    bio: data.bio,
    categories,
    location: data.location
      ? {
          lat: data.location.lat,
          lng: data.location.lng,
          city: data.location.city,
          address: data.location.address,
        }
      : null,
    radiusKm: data.coverWholeCity ? 0 : data.radiusKm,
    coversWholeCity: data.coverWholeCity,
    availableHours,
    isAvailable: true,
    isFeatured: false,
    featuredUntil: null,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: toDateCompat(),
  };

  await setDoc(doc(db, 'workers', uid), workerPayload, { merge: true });

  return { workerId: uid, photoURL };
}

export interface WorkerProfile {
  uid: string;
  name: string;
  phone: string;
  photoURL: string;
  bio: string;
  isAvailable: boolean;
  categories: { categoryId: string; startingPrice: number }[];
  radiusKm: number;
  coversWholeCity: boolean;
}

export async function setWorkerAvailability(
  workerId: string,
  isAvailable: boolean,
): Promise<void> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }
  await setDoc(
    doc(db, 'workers', workerId),
    { isAvailable },
    { merge: true },
  );
}

export async function getWorkerProfile(workerId: string): Promise<WorkerProfile | null> {
  if (!hasConfig || !db) {
    return null;
  }
  const snap = await getDoc(doc(db, 'workers', workerId));
  if (!snap.exists()) {
    return null;
  }
  const d = snap.data() as WorkerProfile & Record<string, unknown>;
  return {
    uid: d.uid ?? workerId,
    name: String(d.name ?? ''),
    phone: String(d.phone ?? ''),
    photoURL: String(d.photoURL ?? ''),
    bio: String(d.bio ?? ''),
    isAvailable: Boolean(d.isAvailable),
    categories: Array.isArray(d.categories) ? d.categories : [],
    radiusKm: Number(d.radiusKm ?? 0),
    coversWholeCity: Boolean(d.coversWholeCity),
  };
}
