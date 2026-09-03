import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import type { HomeStackParamList } from '../../navigation/types';
import { getCurrentUserId } from '../../services/auth';
import { sendMessage, subscribeToChat, type ChatMessage } from '../../services/chat';

type Props = NativeStackScreenProps<HomeStackParamList, 'Chat'>;

const REVIEW_INACTIVITY_MS = 2 * 24 * 60 * 60 * 1000;

export default function ChatThreadScreen({ route }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { role } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const me = getCurrentUserId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsub = subscribeToChat(
      route.params.chatId,
      (msgs) => {
        setMessages(msgs);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
    return unsub;
  }, [route.params.chatId]);

  const lastActivity = messages.length
    ? Math.max(...messages.map((m) => m.createdAt))
    : 0;
  const showReviewPrompt =
    role === 'user' &&
    !!route.params.otherId &&
    !promptDismissed &&
    messages.length > 0 &&
    Date.now() - lastActivity >= REVIEW_INACTIVITY_MS;

  async function handleSend() {
    const text = draft.trim();
    if (!text || !me) return;
    setDraft('');
    try {
      await sendMessage(route.params.chatId, me, { text });
    } catch (err) {
      console.warn('send failed:', err);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {showReviewPrompt && (
        <View style={[styles.prompt, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.promptBody}>
            <Text style={[styles.promptText, { color: colors.textPrimary }]}>
              {t('chat.reviewPrompt', { name: route.params.otherName ?? '' })}
            </Text>
            <Pressable onPress={() => setPromptDismissed(true)}>
              <Text style={[styles.promptDismiss, { color: colors.textSecondary }]}>✕</Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.promptBtn, { backgroundColor: colors.accent }]}
            onPress={() =>
              navigation.navigate('Review', {
                workerId: route.params.otherId,
                workerName: route.params.otherName,
              })
            }
          >
            <Text style={styles.promptBtnText}>{t('chat.rateNow')}</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 30 }} />
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((m) => {
            const mine = m.senderId === me;
            return (
              <View
                key={m.id}
                style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowOther]}
              >
                <View
                  style={[
                    styles.bubble,
                    { backgroundColor: mine ? colors.accent : colors.surface },
                  ]}
                >
                  {m.text ? (
                    <Text style={{ color: mine ? '#fff' : colors.textPrimary }}>
                      {m.text}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t('chat.inputPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          multiline
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border },
          ]}
        />
        <Pressable
          style={[styles.sendBtn, { backgroundColor: colors.accent }]}
          onPress={handleSend}
          disabled={!draft.trim()}
        >
          <Text style={styles.sendText}>{t('chat.send')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  prompt: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    margin: 12,
  },
  promptBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptText: {
    flex: 1,
    fontSize: 13,
    marginRight: 8,
  },
  promptDismiss: {
    fontSize: 16,
    paddingHorizontal: 4,
  },
  promptBtn: {
    marginTop: 10,
    paddingVertical: 9,
    borderRadius: 18,
    alignItems: 'center',
  },
  promptBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  thread: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    maxHeight: 110,
    fontSize: 15,
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
