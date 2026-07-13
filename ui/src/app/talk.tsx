import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPosts, reportPost, type PostSummary } from '@/api/posts';
import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { useDrawer } from '@/context/drawer';

const FILTERS = [
  { label: 'All',        icon: 'grid-outline'        },
  { label: 'Discussion', icon: 'chatbubbles-outline'  },
  { label: 'Support',    icon: 'heart-outline'        },
  { label: 'Milestones', icon: 'trophy-outline'       },
] as const;
type Filter = (typeof FILTERS)[number]['label'];

const CATEGORY_META = {
  discussion: { label: 'Discussion', color: AppColors.talk    },
  support:    { label: 'Support',    color: '#34D399'         },
  milestone:  { label: 'Milestone',  color: AppColors.share   },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PostCard({
  post,
  onPress,
  onReport,
}: {
  post:     PostSummary;
  onPress:  () => void;
  onReport: () => void;
}) {
  const meta       = CATEGORY_META[post.category];
  const replyCount = post.comments.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.75 }]}
    >
      <View style={[s.stripe, { backgroundColor: meta.color }]} />

      <View style={s.cardInner}>
        {/* Top row */}
        <View style={s.cardTop}>
          <View style={[s.badge, { backgroundColor: meta.color + '22' }]}>
            <Text style={[s.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={s.cardTime}>{timeAgo(post.created_at)}</Text>
          <Pressable onPress={onReport} hitSlop={10}>
            <Ionicons name="ellipsis-horizontal" size={14} color={AppColors.textMuted} />
          </Pressable>
        </View>

        {/* Title */}
        <Text style={s.cardTitle} numberOfLines={2}>{post.title}</Text>

        {/* Body preview */}
        <Text style={s.cardBody} numberOfLines={2}>{post.body}</Text>

        {/* Footer */}
        <View style={s.cardFooter}>
          <View style={s.authorRow}>
            <View style={[s.authorAvatar, { backgroundColor: meta.color + '20' }]}>
              <Ionicons name="person" size={9} color={meta.color} />
            </View>
            <Text style={s.authorName}>{post.profiles?.handle ?? 'Member'}</Text>
          </View>
          <View style={s.replyRow}>
            <Ionicons name="chatbubble-outline" size={11} color={AppColors.textMuted} />
            <Text style={s.replyCount}>{replyCount}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function TalkScreen() {
  const router   = useRouter();
  const { open } = useDrawer();
  const { user } = useAuth();

  const [active,  setActive]  = useState<Filter>('All');
  const [posts,   setPosts]   = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleReport(postId: string) {
    if (!user) return;
    if (!window.confirm('Report this post as inappropriate?')) return;
    try {
      await reportPost(postId, user.id);
      window.alert('Reported. Our team will review this post.');
    } catch {
      window.alert('Could not submit report. Please try again.');
    }
  }

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    if (active === 'All')        return true;
    if (active === 'Discussion') return p.category === 'discussion';
    if (active === 'Support')    return p.category === 'support';
    if (active === 'Milestones') return p.category === 'milestone';
    return true;
  });

  return (
    <View style={s.root}>
      <HomeBackdrop />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={open} hitSlop={10}>
            <Ionicons name="menu" size={22} color={AppColors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Talk</Text>
            <Text style={s.subtitle}>Connect · Share · Support</Text>
          </View>
          <Pressable
            onPress={() => router.push('/compose')}
            hitSlop={8}
            style={s.composeBtn}
          >
            <Ionicons name="create-outline" size={17} color={AppColors.accent} />
          </Pressable>
        </View>

        {/* Filter chips */}
        <View style={s.filters}>
          {FILTERS.map(f => {
            const isActive = f.label === active;
            return (
              <Pressable
                key={f.label}
                onPress={() => setActive(f.label)}
                style={[s.chip, isActive && s.chipActive]}
              >
                <Ionicons
                  name={f.icon as any}
                  size={13}
                  color={isActive ? '#fff' : AppColors.textMuted}
                />
                <Text style={[s.chipText, isActive && s.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Post list */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color={AppColors.accent} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="chatbubbles-outline" size={34} color={AppColors.textMuted} />
            <Text style={s.emptyText}>
              {posts.length === 0 ? 'No posts yet' : `No ${active === 'All' ? '' : active.toLowerCase() + ' '}posts`}
            </Text>
            <Text style={s.emptyHint}>
              {posts.length === 0 ? 'Be the first to share something' : 'Try a different filter'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={s.list}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onPress={() => router.push({ pathname: '/post-detail', params: { id: post.id } })}
                onReport={() => handleReport(post.id)}
              />
            ))}
          </ScrollView>
        )}

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  title:    { color: AppColors.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: AppColors.textMuted, fontSize: 12, marginTop: 1 },
  composeBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: AppColors.accent + '18',
    alignItems: 'center', justifyContent: 'center',
  },

  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
  },
  chipActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  chipText:       { color: AppColors.textMuted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { color: AppColors.text, fontSize: 15, fontWeight: '600' },
  emptyHint: { color: AppColors.textMuted, fontSize: 13 },

  list:        { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },

  card: {
    flexDirection: 'row',
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16,
    overflow: 'hidden',
  },
  stripe:    { width: 3 },
  cardInner: { flex: 1, padding: 14, gap: 7 },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTime:  { flex: 1, color: AppColors.textMuted, fontSize: 11 },

  cardTitle: { color: AppColors.text, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  cardBody:  { color: AppColors.textMuted, fontSize: 13, lineHeight: 18 },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorAvatar: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  authorName:  { color: AppColors.textMuted, fontSize: 12, fontWeight: '500' },
  replyRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replyCount:  { color: AppColors.textMuted, fontSize: 12 },
});
