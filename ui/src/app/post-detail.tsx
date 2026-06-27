import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';
import { getPost } from '@/data/posts';

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = getPost(id ?? 'rough-night');

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={{ color: AppColors.text }}>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <DesertBackdrop variant="band" height={180} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={AppColors.text} />
          </Pressable>
          <Ionicons name="ellipsis-horizontal" size={22} color={AppColors.text} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* post header */}
          <View style={styles.postHead}>
            <View style={[styles.avatar, { backgroundColor: post.color + '22' }]}>
              <Ionicons name="person" size={18} color={post.color} />
            </View>
            <Text style={styles.author}>{post.author}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.muted}>{post.timeAgo}</Text>
            <Text style={styles.tag}>{post.category.toUpperCase()}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.body}>{post.body}</Text>

          {/* post actions */}
          <View style={styles.actions}>
            <View style={styles.action}>
              <Ionicons name="chatbubble-outline" size={18} color={AppColors.textMuted} />
              <Text style={styles.actionText}>{post.replies.length} replies</Text>
            </View>
            <View style={styles.action}>
              <Ionicons name="heart" size={18} color="#F2616B" />
              <Text style={styles.actionText}>{post.likes}</Text>
            </View>
            <View style={styles.action}>
              <Ionicons name="bookmark-outline" size={18} color={AppColors.textMuted} />
              <Text style={styles.actionText}>Save</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* replies header */}
          <View style={styles.repliesHead}>
            <Text style={styles.repliesCount}>{post.replies.length} replies</Text>
            <Text style={styles.muted}>Oldest ▾</Text>
          </View>

          {/* replies */}
          <View style={{ gap: 16 }}>
            {post.replies.map((r) => (
              <View key={r.id} style={styles.reply}>
                <View style={[styles.replyAvatar, { backgroundColor: AppColors.talk + '22' }]}>
                  <Ionicons name="person" size={14} color={AppColors.talk} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.replyMeta}>
                    <Text style={styles.replyAuthor}>{r.author}</Text>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.muted}>{r.timeAgo}</Text>
                  </View>
                  <Text style={styles.replyBody}>{r.body}</Text>
                  <View style={styles.replyActions}>
                    <View style={styles.action}>
                      <Ionicons name="heart-outline" size={15} color={AppColors.textMuted} />
                      {r.likes > 0 && <Text style={styles.smallMuted}>{r.likes}</Text>}
                    </View>
                    <Text style={styles.replyLink}>Reply</Text>
                  </View>
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
          />
          <Pressable style={styles.send}>
            <Ionicons name="send" size={16} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.screen },
  band: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 8 },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  author: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  dot: { color: AppColors.textMuted, fontSize: 13 },
  muted: { color: AppColors.textMuted, fontSize: 13 },
  smallMuted: { color: AppColors.textMuted, fontSize: 12 },
  tag: { color: AppColors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
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
  replyActions: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 4 },
  replyLink: { color: AppColors.accent, fontSize: 13, fontWeight: '500' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  composerInput: {
    flex: 1,
    height: 44,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 22,
    paddingHorizontal: 16,
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
