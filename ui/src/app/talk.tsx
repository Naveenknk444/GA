import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';

const FILTERS = ['All', 'Discussion', 'Support', 'Milestones'] as const;

// The menu rows from the mockup. Each has an icon, accent color, blurb, and destination.
const ROWS = [
  {
    key: 'discussion',
    icon: 'chatbubble-ellipses',
    color: AppColors.talk,
    title: 'Discussion',
    blurb: 'Start or join conversations about recovery and life.',
    route: '/post-detail?id=rough-night',
  },
  {
    key: 'support',
    icon: 'people',
    color: '#34D399',
    title: 'Support',
    blurb: 'Get support, share struggles, and help others.',
    route: '/post-detail?id=rough-night',
  },
  {
    key: 'milestones',
    icon: 'flag',
    color: AppColors.share,
    title: 'Milestones',
    blurb: 'Celebrate progress and encourage others.',
    route: '/post-detail?id=rough-night',
  },
  {
    key: 'guidelines',
    icon: 'shield-checkmark',
    color: AppColors.talk,
    title: 'Community Guidelines',
    blurb: 'Read our guidelines and keep our community safe.',
    route: '/compose',
  },
] as const;

export default function TalkScreen() {
  const router = useRouter();
  const [active, setActive] = useState<(typeof FILTERS)[number]>('All');

  return (
    <View style={styles.root}>
      {/* desert photo band behind the title */}
      <DesertBackdrop variant="band" height={220} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
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

        {/* menu rows */}
        <ScrollView style={styles.list} contentContainerStyle={{ gap: 12 }}>
          {ROWS.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => router.push(r.route)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <View style={[styles.rowIcon, { backgroundColor: r.color + '22' }]}>
                <Ionicons name={r.icon as any} size={22} color={r.color} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{r.title}</Text>
                <Text style={styles.rowBlurb}>{r.blurb}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
            </Pressable>
          ))}
        </ScrollView>

        {/* primary action */}
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
  band: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  title: { color: AppColors.text, fontSize: 26, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  subtitle: { color: AppColors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 4, paddingHorizontal: 24 },
  filters: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 18, marginBottom: 6 },
  filterItem: { alignItems: 'center', gap: 6 },
  filterText: { color: AppColors.textMuted, fontSize: 14 },
  filterTextActive: { color: AppColors.text, fontWeight: '600' },
  filterUnderline: { height: 2, width: 20, borderRadius: 1, backgroundColor: AppColors.accent },
  list: { flex: 1, marginTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 16,
    padding: 14,
  },
  rowPressed: { opacity: 0.7 },
  rowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  rowBlurb: { color: AppColors.textMuted, fontSize: 13 },
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
