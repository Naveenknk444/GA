import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addComment, fetchPostById, reportPost, type CommentRow, type PostDetail } from '@/api/posts';
import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';

const CATEGORY_META = {
  discussion: { label: 'DISCUSSION', color: AppColors.talk },
  support:    { label: 'SUPPORT',    color: '#34D399' },
  milestone:  { label: 'MILESTONE',  color: AppColors.share },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [reporting, setReporting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id) return;
    fetchPostById(id).then((result) => {
      if (result) {
        setPost(result.post);
        setComments(result.comments);
      }
      setLoading(false);
    });
  }, [id]);

  function handleReport() {
    if (!post || !user) return;
    Alert.alert(
      'Report Post',
      'Report this post as inappropriate content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report', style: 'destructive',
          onPress: async () => {
            setReporting(true);
            try {
              await reportPost(post.id, user.id);
              Alert.alert('Reported', 'Thank you. Our team will review this post.');
            } catch {
              Alert.alert('Error', 'Could not submit report. Please try again.');
            } finally {
              setReporting(false);
            }
          },
        },
      ],
    );
  }

  async function handleSendReply() {
    if (!reply.trim() || !user || !id) return;
    setSending(true);
    try {
      await addComment(id, user.id, reply.trim());
      setReply('');
      // refresh comments
      const result = await fetchPostById(id);
      if (result) setComments(result.comments);
      scrollRef.current?.scrollToEnd({ animated: true });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={AppColors.accent} size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={{ color: AppColors.text }}>Post not found.</Text>
      </View>
    );
  }

  const meta = CATEGORY_META[post.category];

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={AppColors.text} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
            <Pressable hitSlop={10} onPress={handleReport} disabled={reporting}>
              <Ionicons name="flag-outline" size={20} color={AppColors.textMuted} />
            </Pressable>
            <Pressable
              hitSlop={10}
              onPress={() => post && Share.share({ title: post.title, message: post.body })}>
              <Ionicons name="share-outline" size={22} color={AppColors.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* post header */}
          <View style={styles.postHead}>
            <View style={[styles.avatar, { backgroundColor: meta.color + '22' }]}>
              <Ionicons name="person" size={18} color={meta.color} />
            </View>
            <Text style={styles.author}>{post.profiles?.handle ?? 'Member'}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.muted}>{timeAgo(post.created_at)}</Text>
            <Text style={[styles.tag, { color: meta.color }]}>{meta.label}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.body}>{post.body}</Text>

          {/* post actions */}
          <View style={styles.actions}>
            <View style={styles.action}>
              <Ionicons name="chatbubble-outline" size={18} color={AppColors.textMuted} />
              <Text style={styles.actionText}>{comments.length} replies</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* replies header */}
          <View style={styles.repliesHead}>
            <Text style={styles.repliesCount}>{comments.length} replies</Text>
          </View>

          {/* comments */}
          <View style={{ gap: 16 }}>
            {comments.length === 0 && (
              <Text style={[styles.muted, { textAlign: 'center', paddingVertical: 12 }]}>
                No replies yet. Be the first.
              </Text>
            )}
            {comments.map((c) => (
              <View key={c.id} style={styles.reply}>
                <View style={[styles.replyAvatar, { backgroundColor: AppColors.talk + '22' }]}>
                  <Ionicons name="person" size={14} color={AppColors.talk} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.replyMeta}>
                    <Text style={styles.replyAuthor}>{c.profiles?.handle ?? 'Member'}</Text>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.muted}>{timeAgo(c.created_at)}</Text>
                  </View>
                  <Text style={styles.replyBody}>{c.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* reply composer */}
        <View style={styles.composer}>
          <TextInput
            placeholder="Write a reply..."
            placeholderTextColor={AppColors.textMuted}
            style={styles.composerInput}
            value={reply}
            onChangeText={setReply}
            multiline
          />
          <Pressable
            style={[styles.send, (!reply.trim() || sending) && { opacity: 0.4 }]}
            onPress={handleSendReply}
            disabled={!reply.trim() || sending}>
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={16} color="#fff" />}
          </Pressable>
        </View>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 8 },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  author: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  dot: { color: AppColors.textMuted, fontSize: 13 },
  muted: { color: AppColors.textMuted, fontSize: 13 },
  tag: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  title: { color: AppColors.text, fontSize: 22, fontWeight: '700', marginTop: 14 },
  body: { color: '#D6DAE0', fontSize: 15, lineHeight: 22, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 22, marginTop: 16 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: AppColors.textMuted, fontSize: 13 },
  divider: { height: 1, backgroundColor: AppColors.hairline, marginVertical: 18 },
  repliesHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  repliesCount: { color: AppColors.text, fontSize: 15, fontWeight: '600' },
  reply: { flexDirection: 'row', gap: 12 },
  replyAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  replyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  replyAuthor: { color: AppColors.text, fontSize: 13, fontWeight: '600' },
  replyBody: { color: '#D6DAE0', fontSize: 14, lineHeight: 20 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: AppColors.text,
    fontSize: 14,
    outlineStyle: 'none' as any,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
