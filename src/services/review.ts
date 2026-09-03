import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  collection,
  orderBy,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db, hasConfig } from './firebase';
import { getCurrentUserId } from './auth';

export interface Review {
  id: string;
  workerId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Timestamp | null;
}

export async function hasUserReviewedWorker(workerId: string): Promise<boolean> {
  if (!hasConfig || !db) return false;
  const uid = getCurrentUserId();
  if (!uid) return false;
  const snap = await getDoc(doc(db, 'workers', workerId, 'reviews', uid));
  return snap.exists();
}

export async function submitReview(
  workerId: string,
  rating: number,
  text: string,
  userName: string,
): Promise<void> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }
  const uid = getCurrentUserId();
  if (!uid) {
    throw new Error('No signed-in user');
  }
  const safeRating = Math.min(5, Math.max(1, Math.round(rating)));

  // reviewId = uid → one review per user per worker (duplicate prevention).
  const reviewRef = doc(db, 'workers', workerId, 'reviews', uid);
  const workerRef = doc(db, 'workers', workerId);

  await runTransaction(db, async (tx) => {
    const reviewSnap = await tx.get(reviewRef);
    if (reviewSnap.exists()) {
      throw new Error('ALREADY_REVIEWED');
    }
    const workerSnap = await tx.get(workerRef);
    const currentAvg = Number(workerSnap.exists() ? workerSnap.data().ratingAvg ?? 0 : 0);
    const currentCount = Number(workerSnap.exists() ? workerSnap.data().ratingCount ?? 0 : 0);
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + safeRating) / newCount;

    tx.set(reviewRef, {
      workerId,
      userId: uid,
      userName,
      rating: safeRating,
      text: text.trim(),
      createdAt: Timestamp.now(),
    });
    tx.set(workerRef, { ratingAvg: newAvg, ratingCount: newCount }, { merge: true });
  });
}

export async function getWorkerReviews(workerId: string): Promise<Review[]> {
  if (!hasConfig || !db) return [];
  const snap = await getDocs(
    query(collection(db, 'workers', workerId, 'reviews'), orderBy('createdAt', 'desc')),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      workerId: String(data.workerId ?? ''),
      userId: String(data.userId ?? ''),
      userName: String(data.userName ?? ''),
      rating: Number(data.rating ?? 0),
      text: String(data.text ?? ''),
      createdAt: data.createdAt ? (data.createdAt as Timestamp) : null,
    };
  });
}
