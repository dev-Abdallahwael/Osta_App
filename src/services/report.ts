import { doc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, hasConfig } from './firebase';
import { getCurrentUserId } from './auth';

export interface ReportData {
  reporterId: string;
  targetType: 'worker' | 'chat';
  targetId: string;
  reason: string;
  createdAt: Timestamp;
}

export async function createReport(
  targetType: 'worker' | 'chat',
  targetId: string,
  reason: string,
): Promise<string> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }
  const reporterId = getCurrentUserId();
  if (!reporterId) {
    throw new Error('No signed-in user');
  }
  const ref = await addDoc(collection(db, 'reports'), {
    reporterId,
    targetType,
    targetId,
    reason: reason.trim(),
    createdAt: Timestamp.now(),
  } satisfies ReportData);
  return ref.id;
}
