import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { useDrawer } from '@/context/drawer';
import {
  checkIn, unCheckIn, fetchCheckins,
  DAILY_TASKS, WEEKLY_TASKS, ONETIME_TASKS,
  getMondayStr, type Task, type CheckinState,
} from '@/api/checklist';

type Tab = 'daily' | 'weekly' | 'onetime';

const TABS: { key: Tab; label: string }[] = [
  { key: 'daily',   label: 'Daily'    },
  { key: 'weekly',  label: 'Weekly'   },
  { key: 'onetime', label: 'One-time' },
];

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function dateLabel(type: Tab): string {
  const now = new Date();
  if (type === 'daily') {
    return `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  }
  if (type === 'weekly') {
    const mon = new Date(getMondayStr(now));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return `${MONTHS[mon.getMonth()]} ${mon.getDate()} – ${MONTHS[sun.getMonth()]} ${sun.getDate()}`;
  }
  return 'Completed for good';
}

function resetLabel(type: Tab): string {
  if (type === 'daily')  return 'Resets at midnight every day';
  if (type === 'weekly') return 'Resets every Monday';
  return 'These are done once and stay done';
}

function TaskRow({
  task, done, onToggle,
}: { task: Task; done: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [s.taskRow, pressed && { opacity: 0.65 }]}>
      <View style={[s.check, done && s.checkDone]}>
        {done && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[s.taskLabel, done && s.taskLabelDone]}>{task.label}</Text>
        {task.sublabel && <Text style={s.taskSub}>{task.sublabel}</Text>}
      </View>
    </Pressable>
  );
}

export default function ChecklistScreen() {
  const { user }  = useAuth();
  const { open }  = useDrawer();
  const [tab,     setTab]     = useState<Tab>('daily');
  const [state,   setState]   = useState<CheckinState>({ daily: new Set(), weekly: new Set(), onetime: new Set() });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCheckins(user.id).then(s => { setState(s); setLoading(false); });
  }, [user]);

  async function toggle(task: Task) {
    if (!user) return;
    const set = state[task.type];
    const done = set.has(task.key);

    // Optimistic update
    const next = new Set(set);
    done ? next.delete(task.key) : next.add(task.key);
    setState(prev => ({ ...prev, [task.type]: next }));

    if (done) await unCheckIn(user.id, task);
    else      await checkIn(user.id, task);
  }

  const tasks =
    tab === 'daily'   ? DAILY_TASKS :
    tab === 'weekly'  ? WEEKLY_TASKS :
    ONETIME_TASKS;

  const doneSet = state[tab];
  const doneCount = tasks.filter(t => doneSet.has(t.key)).length;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={open} hitSlop={10}>
          <Ionicons name="menu" size={26} color={AppColors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={s.title}>Daily Checklist</Text>
          <Text style={s.subtitle}>GA Program · Page 17</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} onPress={() => setTab(t.key)}
              style={[s.tabItem, active && s.tabItemActive]}>
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={AppColors.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

          {/* Date / period label */}
          <View style={s.periodRow}>
            <Ionicons
              name={tab === 'daily' ? 'sunny-outline' : tab === 'weekly' ? 'calendar-outline' : 'ribbon-outline'}
              size={14}
              color={AppColors.accent}
            />
            <Text style={s.periodText}>{dateLabel(tab)}</Text>
          </View>

          {/* Progress (not for one-time) */}
          {tab !== 'onetime' && (
            <View style={s.progressCard}>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${(doneCount / tasks.length) * 100}%` as any }]} />
              </View>
              <Text style={s.progressLabel}>{doneCount} of {tasks.length} completed</Text>
            </View>
          )}

          {/* Tasks */}
          <View style={s.card}>
            {tasks.map((task, i) => (
              <View key={task.key}>
                {i > 0 && <View style={s.divider} />}
                <TaskRow
                  task={task}
                  done={doneSet.has(task.key)}
                  onToggle={() => toggle(task)}
                />
              </View>
            ))}
          </View>

          {/* Reset note */}
          <Text style={s.resetNote}>{resetLabel(tab)}</Text>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: AppColors.screen },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10,
  },
  title:    { color: AppColors.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: AppColors.textMuted, fontSize: 12, marginTop: 1 },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: AppColors.tile,
    borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: AppColors.tileBorder,
  },
  tabItem:       { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabItemActive: { backgroundColor: AppColors.accent },
  tabLabel:      { color: AppColors.textMuted, fontSize: 13, fontWeight: '500' },
  tabLabelActive:{ color: '#fff', fontWeight: '700' },

  body: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },

  periodRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  periodText: { color: AppColors.accent, fontSize: 13, fontWeight: '600' },

  progressCard: { gap: 6 },
  progressBar: {
    height: 6, backgroundColor: AppColors.hairline,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: 6, backgroundColor: AppColors.meetings, borderRadius: 3 },
  progressLabel: { color: AppColors.textMuted, fontSize: 12 },

  card: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: AppColors.hairline },

  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16,
  },
  check: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: AppColors.hairline,
    alignItems: 'center', justifyContent: 'center',
  },
  checkDone: { backgroundColor: AppColors.meetings, borderColor: AppColors.meetings },
  taskLabel:     { color: AppColors.text, fontSize: 15, fontWeight: '500' },
  taskLabelDone: { color: AppColors.textMuted, textDecorationLine: 'line-through' },
  taskSub:       { color: AppColors.textMuted, fontSize: 12 },

  resetNote: {
    color: AppColors.textMuted, fontSize: 12,
    textAlign: 'center', fontStyle: 'italic',
  },
});
