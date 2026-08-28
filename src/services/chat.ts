import {
  doc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  getDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, hasConfig } from './firebase';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  imageURL?: string | null;
  createdAt: number; // unix ms
}

export interface ChatSummary {
  chatId: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: number; // unix ms, 0 if never
}

export function chatIdBetween(userId: string, workerId: string): string {
  return `${userId}_${workerId}`;
}

export async function getOrCreateChat(
  userId: string,
  workerId: string,
): Promise<string> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }
  const chatId = chatIdBetween(userId, workerId);
  const ref = doc(db, 'chats', chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participantIds: [userId, workerId],
      userUid: userId,
      workerUid: workerId,
      lastMessage: '',
      lastMessageAt: null,
      createdAt: Timestamp.now(),
    });
  }
  return chatId;
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  input: { text?: string; imageURL?: string | null },
): Promise<string> {
  if (!hasConfig || !db) {
    throw new Error('Firebase not configured');
  }
  const msgRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text: input.text ?? '',
    imageURL: input.imageURL ?? null,
    createdAt: Timestamp.now(),
  });
  const preview =
    input.text?.trim() || (input.imageURL ? '[Image]' : '');
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: preview,
    lastMessageAt: Timestamp.now(),
  });
  return msgRef.id;
}

export function subscribeToChat(
  chatId: string,
  onMessages: (messages: ChatMessage[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  if (!hasConfig || !db) {
    onError?.(new Error('Firebase not configured'));
    return () => {};
  }
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200),
  );
  return onSnapshot(
    q,
    (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((d) => {
        const data = d.data();
        const ts = data.createdAt as { seconds: number; nanoseconds: number } | null;
        return {
          id: d.id,
          senderId: String(data.senderId ?? ''),
          text: String(data.text ?? ''),
          imageURL: data.imageURL ? String(data.imageURL) : null,
          createdAt: ts ? ts.seconds * 1000 : 0,
        };
      });
      onMessages(msgs);
    },
    onError,
  );
}

export function subscribeToChats(
  myUid: string,
  onChats: (chats: ChatSummary[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  if (!hasConfig || !db) {
    onError?.(new Error('Firebase not configured'));
    return () => {};
  }
  // Single auto-indexed field (array-contains); sort by lastMessageAt client-side
  // to avoid a composite-index requirement on the free plan.
  const q = query(
    collection(db, 'chats'),
    where('participantIds', 'array-contains', myUid),
  );
  return onSnapshot(
    q,
    (snap) => {
      const chats: ChatSummary[] = snap.docs.map((d) => {
        const data = d.data();
        const ts = data.lastMessageAt as { seconds: number; nanoseconds: number } | null;
        return {
          chatId: d.id,
          participantIds: Array.isArray(data.participantIds)
            ? data.participantIds.map(String)
            : [],
          lastMessage: String(data.lastMessage ?? ''),
          lastMessageAt: ts ? ts.seconds * 1000 : 0,
        };
      });
      chats.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      onChats(chats);
    },
    onError,
  );
}
