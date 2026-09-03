import {
  signInAnonymously,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, hasConfig } from './firebase';

export type AuthListener = (user: User | null) => void;

export async function ensureAnonymousSignIn(): Promise<User | null> {
  if (!hasConfig || !auth) {
    return null;
  }
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Anonymous sign-in failed:', err);
    return null;
  }
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

export async function createAccount(email: string, password: string): Promise<User> {
  if (!hasConfig || !auth) {
    throw new Error('Firebase not configured');
  }
  const user = await ensureAnonymousSignIn();
  if (!user) {
    throw new Error('No signed-in user');
  }
  if (!user.isAnonymous) {
    return user;
  }
  const credential = EmailAuthProvider.credential(email.trim(), password);
  return (await linkWithCredential(user, credential)).user;
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<User> {
  if (!hasConfig || !auth) {
    throw new Error('Firebase not configured');
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut(): Promise<void> {
  if (!hasConfig || !auth) {
    return;
  }
  await fbSignOut(auth);
}
