import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPosts, type PostSummary } from '@/api/posts';
import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useDrawer } from '@/context/drawer';

const FILTERS = ['All', 'Discussion', 'Support', 'Milestones'] as const;

const CATEGORY_META = {
  discussion: { label: 'Discussion', color: AppColors.talk },
  support:    { label: 'Support',    color: '#34D399' },
  milestone:  { label: 'Milestone',  color: AppColors.share },
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

export default function TalkScreen() {
  const router = useRouter();
  const { open } = useDrawer();
  const [active, setActive] = useState<(typeof FILTERS)[number]>('All');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) => {
    if (active === 'All') return true;
    if (active === 'Discussion') return p.category === 'discussion';
    if (active === 'Support') return p.category === 'support';
    if (active === 'Milestones') return p.category === 'milestone';
    return true;
  });

  return (
    <View style={styles.root}>
      <DesertBackdrop variant="band" height={220} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={open} hitSlop={10}>
            <Ionicons name="menu" size={26} color={AppColors.text} />
          </Pressable>
          <Ionicons name="notifications-outline" size={24} color={AppColors.text} />
        </View>

        <Text style={styles.title}>Talk</Text>
        <Text style={styles.subtitle}>Connect with members, share and support each other.</Text>

        {/* filter tabs */}
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const isActive = f === active;
            return (
              <Pressable key={f} onPress={() => setActive(f)} style={styles.filterItem}>
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{f}</Text>
                {isActive && <View style={styles.filterUnderline} />}
              </Pressable>
            );
          })}
        </View>

        {/* post list */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={AppColors.accent} />
          </View>
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="chatbubbles-outline" size={36} color={AppColors.textMuted} />
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptyHint}>Be the first to post in this category</Text>
              </View>
            )}

            {filtered.map((post) => {
              const meta = CATEGORY_META[post.category];
              const replyCount = post.comments.length;
              return (
                <Pressable
                  key={post.id}
                  onPress={() => router.push({ pathname: '/post-detail', params: { id: post.id } })}
                  style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}>

                  {/* category badge */}
                  <View style={[styles.badge, { backgroundColor: meta.color + '22' }]}>
                    <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{post.title}</Text>
                  <Text style={styles.cardBody} numberOfLines={2}>{post.body}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.cardFooterLeft}>
                      <Ionicons name="person-circle-outline" size={14} color={AppColors.textMuted} />
                      <Text style={styles.cardMeta}>{post.profiles?.handle ?? 'Member'}</Text>
                      <Text style={styles.cardDot}>·</Text>
                      <Text style={styles.cardMeta}>{timeAgo(post.created_at)}</Text>
                    </View>
                    <View style={styles.cardFooterLeft}>
                      <Ionicons name="chatbubble-outline" size={13} color={AppColors.textMuted} />
                      <Text style={styles.cardMeta}>{replyCount}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* create post button */}
        <Pressable
          onPress={() => router.push('/compose')}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.ctaText}>Create a Post</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  title: { color: AppColors.text, fontSize: 26, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  subtitle: { color: AppColors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 4, paddingHorizontal: 24 },

  filters: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 18, marginBottom: 6 },
  filterItem: { alignItems: 'center', gap: 6 },
  filterText: { color: AppColors.textMuted, fontSize: 14 },
  filterTextActive: { color: AppColors.text, fontWeight: '600' },
  filterUnderline: { height: 2, width: 20, borderRadius: 1, backgroundColor: AppColors.accent },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1, marginTop: 12 },

  card: {
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  cardBody: { color: AppColors.textMuted, fontSize: 13, lineHeight: 19 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  cardFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardMeta: { color: AppColors.textMuted, fontSize: 12 },
  cardDot: { color: AppColors.textMuted, fontSize: 12 },

  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyText: { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  emptyHint: { color: AppColors.textMuted, fontSize: 13 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    marginVertical: 14,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
