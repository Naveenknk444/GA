import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { useDrawer } from '@/context/drawer';
import { fetchDayBlocks, todayDate, todayName, type BlockWithLog } from '@/api/schedule';

const TILES = [
  { key: 'talk',     label: 'Talk',     icon: 'chatbubbles', color: AppColors.talk,     route: '/talk' },
  { key: 'meetings', label: 'Meetings', icon: 'people',      color: AppColors.meetings, route: '/meetings' },
  { key: 'recovery', label: 'Recovery', icon: 'leaf',        color: AppColors.recovery, route: '/recovery' },
  { key: 'share',    label: 'Share',    icon: 'paper-plane', color: AppColors.share,    route: '/compose' },
] as const;

// Authentic GA program phrases and principles.
const QUOTES = [
  { text: 'Our primary purpose is to stop gambling and to help other compulsive gamblers do the same.', source: 'GA Preamble' },
  { text: 'Once a compulsive gambler, always a compulsive gambler — but we never have to gamble again.', source: 'GA Program' },
  { text: 'Sharing our experience, strength, and hope with each other is what keeps us well.', source: 'GA Fellowship' },
  { text: 'Recovery is not a destination. It is a way of living, one day at a time.', source: 'GA Principle' },
  { text: 'Progress, not perfection. Each day without gambling is a victory worth celebrating.', source: 'GA Tradition' },
  { text: 'We admitted we were powerless over gambling — that our lives had become unmanageable.', source: 'GA Step One' },
  { text: 'No matter how far down the scale we have gone, we can find others who have been lower.', source: 'GA Literature' },
  { text: 'Easy does it. First things first. One day at a time.', source: 'GA Slogans' },
];

function fmt(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { open } = useDrawer();
  const { user } = useAuth();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [todayBlocks, setTodayBlocks] = useState<BlockWithLog[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchDayBlocks(user.id, todayName(), todayDate()).then(setTodayBlocks);
  }, [user]);

  // Rotate quotes every 6 seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % QUOTES.length);
        setFading(false);
      }, 400);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[quoteIndex];

  return (
    <View style={styles.root}>
      <DesertBackdrop variant="full" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top bar */}
        <View style={styles.header}>
          <Pressable onPress={open} hitSlop={10}>
            <Ionicons name="menu" size={26} color={AppColors.text} />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero — centered logo + rotating quote */}
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <Ionicons name="triangle-outline" size={36} color={AppColors.accent} />
          </View>
          <Text style={styles.title}>Recovery Community</Text>
          <View style={styles.divider} />

          {/* Quote card */}
          <View style={[styles.quoteCard, fading && styles.quoteFading]}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={AppColors.accent} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>{quote.text}</Text>
            <Text style={styles.quoteSource}>— {quote.source}</Text>
          </View>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {QUOTES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === quoteIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* 2×2 tile grid */}
        <View style={styles.grid}>
          {TILES.map((t) => (
            <Pressable
              key={t.key}
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
              onPress={() => router.push(t.route)}>
              <View style={[styles.iconBadge, { backgroundColor: t.color + '22' }]}>
                <Ionicons name={t.icon as any} size={26} color={t.color} />
              </View>
              <Text style={styles.tileLabel}>{t.label}</Text>
            </Pressable>
          ))}

          {/* 5th tile — full width */}
          <Pressable
            style={({ pressed }) => [styles.tile, styles.tileFull, pressed && styles.tilePressed]}
            onPress={() => router.push('/schedule')}>
            <View style={[styles.iconBadge, { backgroundColor: AppColors.accent + '22' }]}>
              <Ionicons name="calendar-number" size={26} color={AppColors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tileLabel}>Schedule</Text>
              {todayBlocks.length > 0 && (
                <Text style={styles.tileSub} numberOfLines={1}>
                  {todayBlocks.filter(b => !b.log?.completed).length} remaining today
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  safe: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  logoRing: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: AppColors.accent + '15',
    borderWidth: 1, borderColor: AppColors.accent + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    color: AppColors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  divider: { width: 36, height: 3, borderRadius: 2, backgroundColor: AppColors.accent },

  quoteCard: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16, padding: 18,
    gap: 8, width: '100%',
    opacity: 1,
  },
  quoteFading: { opacity: 0 },
  quoteIcon: { opacity: 0.6 },
  quoteText: {
    color: AppColors.text,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quoteSource: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: AppColors.textMuted },
  dotActive: { width: 14, backgroundColor: AppColors.accent },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  tile: {
    width: '48%', height: 110,
    borderRadius: 18, padding: 16,
    marginBottom: 14,
    justifyContent: 'space-between',
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
  },
  tilePressed: { opacity: 0.7 },
  iconBadge: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  tileLabel: { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  tileFull: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 14, height: 72 },
  tileSub:  { color: AppColors.textMuted, fontSize: 12, marginTop: 2 },
});
