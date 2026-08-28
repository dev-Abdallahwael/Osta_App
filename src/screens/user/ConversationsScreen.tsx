import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import type { HomeStackParamList } from '../../navigation/types';
import { getCurrentUserId } from '../../services/auth';
import { subscribeToChats, type ChatSummary } from '../../services/chat';
import { getUserProfile } from '../../services/user';
import { getWorkerProfile } from '../../services/worker';

interface Row extends ChatSummary {
  otherId: string;
  otherName: string;
}

export default function ConversationsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { role } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const me = getCurrentUserId();
    if (!me) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const resolveNames = async (chats: ChatSummary[]): Promise<Row[]> => {
      return Promise.all(
        chats.map(async (c) => {
          const meIsWorker = role === 'worker';
          const myUidInChat = c.participantIds.find((p) => p === me);
          const otherId =
            c.participantIds.find((p) => p !== myUidInChat) ?? '';
          let otherName = '';
          if (otherId) {
            const p = meIsWorker
              ? await getUserProfile(otherId)
              : await getWorkerProfile(otherId);
            otherName = p?.name ?? '—';
          }
          return { ...c, otherId, otherName };
        }),
      );
    };

    const unsub = subscribeToChats(
      me,
      (chats) => {
        resolveNames(chats).then((resolved) => {
          if (mounted) {
            setRows(resolved);
            setLoading(false);
          }
        });
      },
      () => {
        if (mounted) setLoading(false);
      },
    );
    return () => {
      mounted = false;
      unsub();
    };
  }, [role]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : rows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('chat.empty')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {rows.map((c) => (
            <Pressable
              key={c.chatId}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() =>
                navigation.navigate('Chat', {
                  chatId: c.chatId,
                  otherId: c.otherId,
                  otherName: c.otherName,
                })
              }
            >
              <View style={[styles.avatar, { backgroundColor: colors.background }]}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={styles.body}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{c.otherName}</Text>
                {c.lastMessage ? (
                  <Text
                    style={[styles.preview, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {c.lastMessage}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    fontSize: 13,
    marginTop: 2,
  },
});
