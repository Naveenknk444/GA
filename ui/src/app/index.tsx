import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home-backdrop';
import { DailyReadingModal } from '@/components/daily-reading-modal';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { useDrawer } from '@/context/drawer';
import { fetchDayBlocks, todayDate, todayName, type BlockWithLog } from '@/api/schedule';
import { fetchCheckins, fetchChecklistTasks } from '@/api/checklist';
import { fetchUserTasks, fetchUserTaskCheckins } from '@/api/user-tasks';
import { fetchDailyReading, type ReadingContent } from '@/api/daily-reading';
import { fetchProfile } from '@/api/profile';

const TILES = [
  { key: 'talk',     label: 'Talk',     icon: 'chatbubbles', color: AppColors.talk,     route: '/talk' },
  { key: 'meetings', label: 'Meetings', icon: 'calendar',    color: AppColors.meetings, route: '/meetings' },
  { key: 'recovery', label: 'Recovery', icon: 'leaf',        color: AppColors.recovery, route: '/recovery' },
  { key: 'share',    label: 'Share',    icon: 'paper-plane', color: AppColors.share,    route: '/compose' },
] as const;

function cleanDaysFrom(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  return ms < 0 ? null : Math.floor(ms / 86_400_000);
}

export default function HomeScreen() {
  const router   = useRouter();
  const { open } = useDrawer();
  const { user } = useAuth();

  const [todayBlocks, setTodayBlocks] = useState<BlockWithLog[]>([]);
  const [dailyDone,   setDailyDone]   = useState(0);
  const [dailyTotal,  setDailyTotal]  = useState(0);
  const [cleanDays,   setCleanDays]   = useState<number | null>(null);
  const [reading,     setReading]     = useState<ReadingContent | null>(null);
  const [showReading, setShowReading] = useState(false);

  const now       = new Date();
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  useEffect(() => {
    if (!user) return;
    const m = now.getMonth() + 1;
    const d = now.getDate();

    fetchDayBlocks(user.id, todayName(), todayDate()).then(setTodayBlocks);

    Promise.all([fetchChecklistTasks(), fetchUserTasks(user.id)]).then(async ([g, ug]) => {
      const [sysCheckins, userCheckins] = await Promise.all([
        fetchCheckins(user.id, g),
        fetchUserTaskCheckins(user.id, ug.daily),
      ]);
      const sysDone  = g.daily.filter(t => sysCheckins.daily.has(t.key)).length;
      const userDone = ug.daily.filter(t => userCheckins.has(t.id)).length;
      setDailyTotal(g.daily.length + ug.daily.length);
      setDailyDone(sysDone + userDone);
    });

    fetchDailyReading(m, d).then(r => { if (r) setReading(r.content); });

    fetchProfile(user.id).then(p => setCleanDays(cleanDaysFrom(p?.clean_date ?? null)));
  }, [user]);

  const remaining = todayBlocks.filter(b => !b.log?.completed).length;
  const progress  = dailyTotal > 0 ? dailyDone / dailyTotal : 0;

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header row */}
        <View style={styles.header}>
          <Pressable onPress={open} hitSlop={10}>
            <Ionicons name="menu" size={26} color={AppColors.text} />
          </Pressable>
          <Text style={styles.dateText}>{dateLabel}</Text>
          {cleanDays !== null ? (
            <View style={styles.cleanPill}>
              <Text style={styles.cleanText}>🌿 {cleanDays}d</Text>
            </View>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Today's Reading hero card */}
          <Pressable
            style={({ pressed }) => [styles.readingCard, pressed && styles.tilePressed]}
            onPress={() => setShowReading(true)}
          >
            <View style={styles.readingTop}>
              <Ionicons name="book-outline" size={14} color={AppColors.accent} />
              <Text style={styles.readingLabel}>Today's Reading</Text>
            </View>
            <Text style={styles.readingSnippet} numberOfLines={4}>
              {reading?.reflection ?? 'Tap to open your daily reflection…'}
            </Text>
            <View style={styles.readingCta}>
              <Text style={styles.readingCtaText}>Open Reading</Text>
              <Ionicons name="chevron-forward" size={14} color={AppColors.accent} />
            </View>
          </Pressable>

          {/* 2×2 tile grid */}
          <View style={styles.grid}>
            {TILES.map(t => (
              <Pressable
                key={t.key}
                style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
                onPress={() => router.push(t.route)}
              >
                <View style={[styles.iconBadge, { backgroundColor: t.color + '22' }]}>
                  <Ionicons name={t.icon as any} size={26} color={t.color} />
                </View>
                <Text style={styles.tileLabel}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Combined status card — Schedule + Checklist */}
          <View style={styles.statusCard}>
            <Pressable style={styles.statusRow} onPress={() => router.push('/schedule')}>
              <View style={[styles.iconBadge, { backgroundColor: AppColors.accent + '22' }]}>
                <Ionicons name="calendar-number" size={22} color={AppColors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Schedule</Text>
                <Text style={styles.statusSub}>{remaining} remaining today</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
            </Pressable>

            <View style={styles.statusDivider} />

            <Pressable style={styles.statusRow} onPress={() => router.push('/checklist')}>
              <View style={[styles.iconBadge, { backgroundColor: AppColors.meetings + '22' }]}>
                <Ionicons name="checkbox-outline" size={22} color={AppColors.meetings} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Daily Checklist</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
                </View>
                <Text style={styles.statusSub}>{dailyDone} of {dailyTotal} done today</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {showReading && (
        <DailyReadingModal
          year={now.getFullYear()}
          month={now.getMonth() + 1}
          day={now.getDate()}
          userId={user!.id}
          onClose={() => setShowReading(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  dateText: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  cleanPill: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  cleanText: { color: AppColors.accent, fontSize: 12, fontWeight: '600' },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },

  // Reading hero card
  readingCard: {
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  readingTop:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readingLabel:   { color: AppColors.accent, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  readingSnippet: {
    color: AppColors.text,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  readingCta:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readingCtaText: { color: AppColors.accent, fontSize: 13, fontWeight: '600' },

  // 2×2 grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    height: 110,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    justifyContent: 'space-between',
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
  },
  tilePressed: { opacity: 0.7 },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { color: AppColors.text, fontSize: 15, fontWeight: '600' },

  // Combined status card
  statusCard: {
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 18,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  statusDivider: {
    height: 1,
    backgroundColor: AppColors.tileBorder,
    marginHorizontal: 16,
  },
  statusTitle: { color: AppColors.text, fontSize: 15, fontWeight: '600' },
  statusSub:   { color: AppColors.textMuted, fontSize: 12, marginTop: 2 },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: AppColors.meetings,
    borderRadius: 2,
  },
});
