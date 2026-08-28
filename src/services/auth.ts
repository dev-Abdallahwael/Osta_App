import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, hasConfig } from './firebase';

export type AuthListener = (user: User | null) => void;

export function ensureAnonymousSignIn(): void {
  if (!hasConfig || !auth) {
    return;
  }
  signInAnonymously(auth).catch((err) => {
    console.warn('Anonymous sign-in failed:', err);
  });
}

export function onAuthChange(listener: AuthListener): () => void {
  if (!hasConfig || !auth) {
    listener(null);
    return () => {};
  }
  return onAuthStateChanged(auth, listener);
}

export function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid ?? null;
}
