const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function sendExpoPush(expoToken, { title, body, data }) {
  const resp = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: expoToken,
      title,
      body,
      data: data || {},
    }),
  });
  return resp.json();
}

exports.onMessageCreated = onDocumentCreated(
  'chats/{chatId}/messages/{messageId}',
  async (event) => {
    const message = event.data.data();
    if (!message) return;
    const senderId = message.senderId;
    const chatId = event.params.chatId;

    const chatSnap = await db.doc(`chats/${chatId}`).get();
    if (!chatSnap.exists) return;
    const chat = chatSnap.data();

    const userUid = chat.userUid;
    const workerUid = chat.workerUid;
    const recipientUid = senderId === userUid ? workerUid : userUid;
    const recipientIsWorker = recipientUid === workerUid;

    const tokenPath = recipientIsWorker
      ? `workers/${recipientUid}`
      : `users/${recipientUid}`;

    const recipientSnap = await db.doc(tokenPath).get();
    if (!recipientSnap.exists) return;
    const pushToken = recipientSnap.data().pushToken;
    if (!pushToken) return;

    const senderSnap = await db
      .doc(recipientIsWorker ? `users/${userUid}` : `workers/${workerUid}`)
      .get();
    const senderName = senderSnap.exists
      ? senderSnap.data().name
      : senderId;

    const text = message.text || '[Image]';
    await sendExpoPush(pushToken, {
      title: senderName || 'Osta',
      body: text,
      data: { chatId, otherId: senderId },
    });
  }
);
