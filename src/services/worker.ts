import {
  setDoc,
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage, hasConfig } from './firebase';
import { ensureAnonymousSignIn } from './auth';
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
  edit = false,
): Promise<SubmitWorkerResult> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }

  const user = await ensureAnonymousSignIn();
  const uid = user?.uid;
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

  const workerPayload: Record<string, unknown> = {
    uid,
    accountType: 'worker',
    name: data.name,
    phone: '+20' + data.phone,
    photoURL,
    bio: data.bio,
    categories,
    categoryIds: data.selectedCategories.map((c: Category) => c.id),
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
  };

  if (!edit) {
    workerPayload.isAvailable = true;
    workerPayload.isFeatured = false;
    workerPayload.featuredUntil = null;
    workerPayload.ratingAvg = 0;
    workerPayload.ratingCount = 0;
    workerPayload.isHidden = false;
    workerPayload.createdAt = toDateCompat();
  }

  await setDoc(doc(db, 'workers', uid), workerPayload, { merge: true });

  return { workerId: uid, photoURL };
}

export interface WorkerProfile {
  uid: string;
  accountType?: 'worker';
  name: string;
  phone: string;
  photoURL: string;
  bio: string;
  isAvailable: boolean;
  isHidden: boolean;
  isFeatured: boolean;
  featuredUntil: { seconds: number; nanoseconds: number } | null;
  boostRequested: boolean;
  ratingAvg: number;
  ratingCount: number;
  categories: { categoryId: string; startingPrice: number }[];
  categoryIds: string[];
  radiusKm: number;
  coversWholeCity: boolean;
  location: { lat: number; lng: number; city: string; address: string } | null;
  availableHours: Record<string, { start: string; end: string }>;
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

export async function requestBoost(workerId: string): Promise<void> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }
  await setDoc(
    doc(db, 'workers', workerId),
    { boostRequested: true },
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
  const rawLocation = (d.location ?? null) as
    | { lat: number; lng: number; city: string; address: string }
    | null;
  const rawHours = (d.availableHours ?? {}) as Record<
    string,
    { start: string; end: string }
  >;
  return {
    uid: d.uid ?? workerId,
    accountType: d.accountType === 'worker' ? 'worker' : undefined,
    name: String(d.name ?? ''),
    phone: String(d.phone ?? ''),
    photoURL: String(d.photoURL ?? ''),
    bio: String(d.bio ?? ''),
    isAvailable: Boolean(d.isAvailable),
    isHidden: Boolean(d.isHidden),
    isFeatured: Boolean(d.isFeatured),
    featuredUntil: d.featuredUntil
      ? { seconds: Number(d.featuredUntil.seconds ?? 0), nanoseconds: Number(d.featuredUntil.nanoseconds ?? 0) }
      : null,
    boostRequested: Boolean(d.boostRequested),
    ratingAvg: Number(d.ratingAvg ?? 0),
    ratingCount: Number(d.ratingCount ?? 0),
    categories: Array.isArray(d.categories) ? d.categories : [],
    categoryIds: Array.isArray(d.categoryIds) ? d.categoryIds : [],
    radiusKm: Number(d.radiusKm ?? 0),
    coversWholeCity: Boolean(d.coversWholeCity),
    location: rawLocation
      ? {
          lat: Number(rawLocation.lat ?? 0),
          lng: Number(rawLocation.lng ?? 0),
          city: String(rawLocation.city ?? ''),
          address: String(rawLocation.address ?? ''),
        }
      : null,
    availableHours: rawHours,
  };
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface WorkerSearchHit extends WorkerProfile {
  distanceKm: number;
  inRange: boolean;
  price: number;
}

export interface SearchWorkersOptions {
  categoryId: string;
  userLocation: { lat: number; lng: number; city?: string } | null;
  sortBy?: 'distance' | 'rating' | 'price';
}

export async function searchWorkers(
  options: SearchWorkersOptions,
): Promise<{ inRange: WorkerSearchHit[]; nearest: WorkerSearchHit[] }> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }

  // Single auto-indexed field keeps this free-tier friendly (no composite-index
  // requirement). Availability/hidden/city are filtered in code below.
  const q = query(
    collection(db, 'workers'),
    where('categoryIds', 'array-contains', options.categoryId),
    limit(200),
  );

  const snapshot = await getDocs(q);
  const hits: WorkerSearchHit[] = [];

  for (const snap of snapshot.docs) {
    const d = snap.data() as WorkerProfile & Record<string, unknown>;
    if (d.isAvailable === false) continue;
    if (d.isHidden === true) continue;

    const rawLocation = (d.location ?? null) as
      | { lat: number; lng: number; city: string; address: string }
      | null;
    if (!rawLocation) continue;

    if (
      options.userLocation?.city &&
      String(rawLocation.city ?? '').toLowerCase() !==
        options.userLocation.city.toLowerCase()
    ) {
      continue;
    }

    const categoryEntry = Array.isArray(d.categories)
      ? (d.categories as { categoryId: string; startingPrice: number }[]).find(
          (c) => c.categoryId === options.categoryId,
        )
      : undefined;
    const price = categoryEntry?.startingPrice ?? 0;

    const distanceKm = options.userLocation
      ? haversineKm(
          { lat: options.userLocation.lat, lng: options.userLocation.lng },
          { lat: rawLocation.lat, lng: rawLocation.lng },
        )
      : -1;

    const coversCity = Boolean(d.coversWholeCity);
    const radiusKm = Number(d.radiusKm ?? 0);
    const inRange = coversCity || (distanceKm >= 0 && distanceKm <= radiusKm);

    hits.push({
      uid: d.uid ?? snap.id,
      accountType: d.accountType === 'worker' ? 'worker' : undefined,
      name: String(d.name ?? ''),
      phone: String(d.phone ?? ''),
      photoURL: String(d.photoURL ?? ''),
      bio: String(d.bio ?? ''),
      isAvailable: Boolean(d.isAvailable),
      isHidden: Boolean(d.isHidden),
      isFeatured: Boolean(d.isFeatured),
      featuredUntil: d.featuredUntil
        ? { seconds: Number(d.featuredUntil.seconds ?? 0), nanoseconds: Number(d.featuredUntil.nanoseconds ?? 0) }
        : null,
      boostRequested: Boolean(d.boostRequested),
      ratingAvg: Number(d.ratingAvg ?? 0),
      ratingCount: Number(d.ratingCount ?? 0),
      categories: Array.isArray(d.categories) ? d.categories : [],
      categoryIds: Array.isArray(d.categoryIds) ? d.categoryIds : [],
      radiusKm,
      coversWholeCity: coversCity,
      location: {
        lat: Number(rawLocation.lat ?? 0),
        lng: Number(rawLocation.lng ?? 0),
        city: String(rawLocation.city ?? ''),
        address: String(rawLocation.address ?? ''),
      },
      availableHours: (d.availableHours ?? {}) as Record<string, { start: string; end: string }>,
      distanceKm,
      inRange,
      price,
    });
  }

  const sortBy = options.sortBy ?? 'distance';
  const featuredKey = (h: WorkerSearchHit) => {
    if (!h.isFeatured) return 0;
    if (!h.featuredUntil) return 1;
    return h.featuredUntil.seconds * 1000 > Date.now() ? 1 : 0;
  };
  const sortFn = (a: WorkerSearchHit, b: WorkerSearchHit) => {
    const fa = featuredKey(a);
    const fb = featuredKey(b);
    if (fa !== fb) return fb - fa;
    if (sortBy === 'rating') return b.ratingAvg - a.ratingAvg;
    if (sortBy === 'price') return a.price - b.price || a.distanceKm - b.distanceKm;
    return a.distanceKm - b.distanceKm;
  };

  const inRange = hits.filter((h) => h.inRange).sort(sortFn);
  const nearest = hits
    .filter((h) => !h.inRange)
    .sort((a, b) => featuredKey(b) - featuredKey(a) || a.distanceKm - b.distanceKm);

  return { inRange, nearest };
}
