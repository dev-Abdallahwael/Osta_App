import { setDoc, doc, Timestamp } from 'firebase/firestore';
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
    } catch (err) {
      console.warn('Photo upload failed (storage may be disabled):', err);
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
