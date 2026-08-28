import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { hasConfig, db } from './firebase';

export interface ConnectivityResult {
  ok: boolean;
  action: string;
  error?: string;
}

export async function runConnectivityTest(uid: string): Promise<ConnectivityResult[]> {
  const results: ConnectivityResult[] = [];
  if (!hasConfig || !db) {
    return [{ ok: false, action: 'sign-in', error: 'Firebase not configured' }];
  }

  try {
    const target = doc(db, `_test/${uid}`);
    await setDoc(target, { createdAt: new Date() });
    results.push({ ok: true, action: 'write' });
  } catch (err) {
    results.push({ ok: false, action: 'write', error: String(err) });
  }

  try {
    const snap = await getDoc(doc(db, `_test/${uid}`));
    results.push({ ok: snap.exists(), action: 'read' });
  } catch (err) {
    results.push({ ok: false, action: 'read', error: String(err) });
  }

  try {
    await deleteDoc(doc(db, `_test/${uid}`));
    results.push({ ok: true, action: 'cleanup' });
  } catch (err) {
    results.push({ ok: false, action: 'cleanup', error: String(err) });
  }

  return results;
}
