import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform,
  Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createBlock, deleteBlock, fetchDayBlocks, todayDate, todayName,
  updateBlock, upsertLog, type BlockDraft, type BlockWithLog,
} from '@/api/schedule';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const PRIORITIES = ['low','medium','high'] as const;
const ENERGIES   = ['low','medium','high'] as const;

const TASK_COLORS: Record<string, string> = {
  Work:             '#4F8CFF',
  GA:               '#3FCF8E',
  Gym:              '#E0A53E',
  LinkedIn:         '#9B8CFF',
  '12-step':        '#F97316',
  Cleaning:         '#9AA4B2',
  'Free time':      '#3FCF8E',
  'App development':'#4F8CFF',
  'Office work':    '#4F8CFF',
  'Idea Talk':      '#E0A53E',
};

function defaultColor(task: string): string {
  return TASK_COLORS[task] ?? '#4F8CFF';
}

function fmt(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const hr   = h % 12 || 12;
  return `${hr}:${String(m).padStart(2,'0')} ${ampm}`;
}

function durationLabel(start: string, end: string): string {
  const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const mins = toMins(end) - toMins(start);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function isValidTime(t: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(t)) return false;
  const [h, m] = t.split(':').map(Number);
  return h < 24 && m < 60;
}

// ── Block detail / edit modal ────────────────────────────────────────────────
function BlockModal({
  block, date, userId, onClose, onSaved, onDeleted,
}: {
  block: BlockWithLog | null;
  date: string;
  userId: string;
  onClose: () => void;
  onSaved: (b: BlockWithLog) => void;
  onDeleted: (id: string) => void;
}) {
  const isNew = !block;

  const [task,       setTask]       = useState(block?.task ?? '');
  const [day,        setDay]        = useState(block?.day ?? DAYS[0]);
  const [startTime,  setStartTime]  = useState(block?.start_time?.slice(0,5) ?? '09:00');
  const [endTime,    setEndTime]    = useState(block?.end_time?.slice(0,5) ?? '10:00');
  const [priority,   setPriority]   = useState<'low'|'medium'|'high'>(block?.priority ?? 'medium');
  const [location,   setLocation]   = useState(block?.location ?? '');
  const [energy,     setEnergy]     = useState<'low'|'medium'|'high'|null>(block?.energy_level ?? null);
  const [reminder,   setReminder]   = useState(block?.reminder_minutes?.toString() ?? '');
  const [completed,  setCompleted]  = useState(block?.log?.completed ?? false);
  const [reflection, setReflection] = useState(block?.log?.reflection ?? '');
  const [notes,      setNotes]      = useState(block?.log?.notes ?? '');
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  async function handleSave() {
    if (!task.trim()) return;
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      Alert.alert('Invalid time', 'Use HH:MM format (e.g. 09:00, 14:30)');
      return;
    }
    if (startTime >= endTime) {
      Alert.alert('Invalid time', 'End time must be after start time');
      return;
    }
    setSaving(true);
    try {
      const draft: BlockDraft = {
        day, start_time: startTime, end_time: endTime,
        task: task.trim(), color: defaultColor(task.trim()),
        priority, location: location.trim() || null,
        reminder_minutes: reminder ? parseInt(reminder) : null,
        energy_level: energy,
      };

      let saved: BlockWithLog;
      if (isNew) {
        const b = await createBlock(userId, draft);
        if (!b) return;
        saved = { ...b, log: null };
      } else {
        const b = await updateBlock(block!.id, draft);
        if (!b) return;
        const log = await upsertLog(userId, b.id, date, {
          completed,
          reflection: reflection.trim() || null,
          notes: notes.trim() || null,
        });
        saved = { ...b, log };
      }

      onSaved(saved);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!block) return;
    Alert.alert('Delete Block', `Delete "${block.task}"? This removes it from your entire weekly schedule.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteBlock(block.id);
            onDeleted(block.id);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  const priorityColor = { low: '#9AA4B2', medium: AppColors.share, high: '#F97316' };
  const energyColor   = { low: '#9AA4B2', medium: AppColors.share, high: '#F97316' };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={m.overlay}>
        <Pressable style={m.backdrop} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
        <View style={m.sheet}>

          {/* drag handle */}
          <View style={m.handle} />

          {/* header */}
          <View style={m.header}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={AppColors.text} />
            </Pressable>
            <Text style={m.headerTitle}>{isNew ? 'New Block' : 'Edit Block'}</Text>
            {!isNew ? (
              <Pressable onPress={handleDelete} hitSlop={10} disabled={deleting}>
                <Ionicons name="trash-outline" size={20} color="#F2616B" />
              </Pressable>
            ) : <View style={{ width: 24 }} />}
          </View>

        <ScrollView contentContainerStyle={m.scroll} showsVerticalScrollIndicator={false}>

          {/* Task name */}
          <Text style={m.label}>TASK</Text>
          <TextInput
            value={task} onChangeText={setTask}
            placeholder="e.g. Gym, GA, Work…"
            placeholderTextColor={AppColors.textMuted}
            style={m.input} autoCorrect={false}
          />

          {/* Day */}
          <Text style={m.label}>DAY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {DAYS.map(d => (
              <Pressable key={d} onPress={() => setDay(d)}
                style={[m.chip, day === d && { backgroundColor: AppColors.accent, borderColor: AppColors.accent }]}>
                <Text style={[m.chipText, day === d && { color: '#fff', fontWeight: '700' }]}>{d.slice(0,3)}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Times */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={m.label}>START TIME</Text>
              <TextInput value={startTime} onChangeText={setStartTime}
                placeholder="09:00" placeholderTextColor={AppColors.textMuted}
                style={m.input} autoCorrect={false} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={m.label}>END TIME</Text>
              <TextInput value={endTime} onChangeText={setEndTime}
                placeholder="10:00" placeholderTextColor={AppColors.textMuted}
                style={m.input} autoCorrect={false} />
            </View>
          </View>

          {/* Priority */}
          <Text style={m.label}>PRIORITY</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {PRIORITIES.map(p => (
              <Pressable key={p} onPress={() => setPriority(p)}
                style={[m.chip, { flex: 1, justifyContent: 'center' },
                  priority === p && { backgroundColor: priorityColor[p] + '33', borderColor: priorityColor[p] }]}>
                <Text style={[m.chipText, { textAlign: 'center', textTransform: 'capitalize' },
                  priority === p && { color: priorityColor[p], fontWeight: '700' }]}>{p}</Text>
              </Pressable>
            ))}
          </View>

          {/* Energy */}
          <Text style={m.label}>ENERGY NEEDED</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {ENERGIES.map(e => (
              <Pressable key={e} onPress={() => setEnergy(energy === e ? null : e)}
                style={[m.chip, { flex: 1, justifyContent: 'center' },
                  energy === e && { backgroundColor: energyColor[e] + '33', borderColor: energyColor[e] }]}>
                <Text style={[m.chipText, { textAlign: 'center', textTransform: 'capitalize' },
                  energy === e && { color: energyColor[e], fontWeight: '700' }]}>{e}</Text>
              </Pressable>
            ))}
          </View>

          {/* Location */}
          <Text style={m.label}>LOCATION</Text>
          <TextInput value={location} onChangeText={setLocation}
            placeholder="e.g. Planet Fitness, St. Mary's Church"
            placeholderTextColor={AppColors.textMuted}
            style={m.input} autoCorrect={false} />

          {/* Reminder */}
          <Text style={m.label}>REMINDER (minutes before)</Text>
          <TextInput value={reminder} onChangeText={setReminder}
            placeholder="e.g. 15"
            placeholderTextColor={AppColors.textMuted}
            style={m.input} keyboardType="numeric" />

          {/* ── completion (only for existing blocks) ── */}
          {!isNew && (
            <>
              <View style={m.divider} />
              <Text style={[m.label, { color: AppColors.meetings }]}>TODAY'S LOG</Text>

              <View style={m.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={m.toggleLabel}>Mark as completed</Text>
                  <Text style={m.toggleSub}>Did you complete this today?</Text>
                </View>
                <Switch
                  value={completed} onValueChange={setCompleted}
                  trackColor={{ false: AppColors.hairline, true: AppColors.meetings }}
                  thumbColor="#fff"
                />
              </View>

              <Text style={m.label}>NOTES</Text>
              <TextInput value={notes} onChangeText={setNotes}
                placeholder="Any notes for today…"
                placeholderTextColor={AppColors.textMuted}
                style={[m.input, m.multiline]} multiline textAlignVertical="top" />

              <Text style={m.label}>REFLECTION</Text>
              <TextInput value={reflection} onChangeText={setReflection}
                placeholder="How did it go?"
                placeholderTextColor={AppColors.textMuted}
                style={[m.input, m.multiline]} multiline textAlignVertical="top" />
            </>
          )}

          {/* Save */}
          <Pressable onPress={handleSave} disabled={saving || !task.trim()}
            style={[m.saveBtn, (saving || !task.trim()) && { opacity: 0.5 }]}>
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={m.saveBtnText}>{isNew ? 'Add Block' : 'Save Changes'}</Text>}
          </Pressable>

        </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function ScheduleScreen() {
  const router        = useRouter();
  const { user }      = useAuth();
  const scrollRef     = useRef<ScrollView>(null);

  const [activeDay,  setActiveDay]  = useState(todayName());
  const [activeDate, setActiveDate] = useState(todayDate());
  const [blocks,     setBlocks]     = useState<BlockWithLog[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<BlockWithLog | null | 'new'>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchDayBlocks(user.id, activeDay, activeDate)
      .then(setBlocks)
      .finally(() => setLoading(false));
  }, [user, activeDay, activeDate]);

  function handleDayPress(day: string, idx: number) {
    setActiveDay(day);
    // compute the date for this day in the current week
    const today = new Date();
    const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const diff = idx - todayIdx;
    const d = new Date(today);
    d.setDate(d.getDate() + diff);
    setActiveDate(d.toISOString().slice(0, 10));
  }

  function handleSaved(b: BlockWithLog) {
    setBlocks(prev => {
      const idx = prev.findIndex(x => x.id === b.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = b; return next; }
      return [...prev, b].sort((a, z) => a.start_time.localeCompare(z.start_time));
    });
    setSelected(null);
  }

  function handleDeleted(id: string) {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelected(null);
  }

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={AppColors.text} />
          </Pressable>
          <Text style={s.title}>My Schedule</Text>
          <Pressable onPress={() => setSelected('new')} hitSlop={12}>
            <Ionicons name="add-circle-outline" size={26} color={AppColors.accent} />
          </Pressable>
        </View>

        {/* day tabs */}
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.dayTabs} style={{ flexGrow: 0 }}>
          {DAYS.map((day, idx) => {
            const active  = day === activeDay;
            const isToday = idx === todayIdx;
            return (
              <Pressable key={day} onPress={() => handleDayPress(day, idx)}
                style={[s.dayTab, active && s.dayTabActive]}>
                <Text style={[s.dayShort, active && s.dayShortActive]}>{DAY_SHORT[idx]}</Text>
                {isToday && <View style={[s.todayDot, active && { backgroundColor: '#fff' }]} />}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* block list */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color={AppColors.accent} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
            {blocks.length === 0 && (
              <View style={s.empty}>
                <Ionicons name="calendar-outline" size={36} color={AppColors.textMuted} />
                <Text style={s.emptyText}>No blocks for {activeDay}</Text>
                <Text style={s.emptyHint}>Tap + to add one</Text>
              </View>
            )}
            {blocks.map(block => {
              const color = block.color ?? defaultColor(block.task);
              const dur   = durationLabel(block.start_time, block.end_time);
              const done  = block.log?.completed ?? false;
              const priorityColor = { low: '#9AA4B2', medium: AppColors.share, high: '#F97316' };
              return (
                <Pressable key={block.id} onPress={() => setSelected(block)}
                  style={({ pressed }) => [s.block, pressed && { opacity: 0.7 }]}>
                  {/* color bar */}
                  <View style={[s.colorBar, { backgroundColor: color }]} />

                  <View style={s.blockBody}>
                    <View style={s.blockTop}>
                      <Text style={[s.blockTask, done && s.blockTaskDone]}>{block.task}</Text>
                      {done && <Ionicons name="checkmark-circle" size={18} color={AppColors.meetings} />}
                    </View>

                    <View style={s.blockMeta}>
                      <Ionicons name="time-outline" size={13} color={AppColors.textMuted} />
                      <Text style={s.blockMetaText}>
                        {fmt(block.start_time)} – {fmt(block.end_time)}{dur ? ` · ${dur}` : ''}
                      </Text>
                    </View>

                    {block.location && (
                      <View style={s.blockMeta}>
                        <Ionicons name="location-outline" size={13} color={AppColors.textMuted} />
                        <Text style={s.blockMetaText}>{block.location}</Text>
                      </View>
                    )}

                    <View style={s.blockFooter}>
                      <View style={[s.priorityPill, { borderColor: priorityColor[block.priority] }]}>
                        <Text style={[s.priorityText, { color: priorityColor[block.priority] }]}>
                          {block.priority}
                        </Text>
                      </View>
                      {block.energy_level && (
                        <View style={s.energyPill}>
                          <Ionicons name="flash-outline" size={11} color={AppColors.textMuted} />
                          <Text style={s.energyText}>{block.energy_level} energy</Text>
                        </View>
                      )}
                      {block.log?.reflection && (
                        <Ionicons name="chatbubble-outline" size={13} color={AppColors.textMuted} />
                      )}
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* block modal */}
      {selected !== null && (
        <BlockModal
          block={selected === 'new' ? null : selected}
          date={activeDate}
          userId={user?.id ?? ''}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </View>
  );
}

// ── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, marginBottom: 12,
  },
  title: { color: AppColors.text, fontSize: 20, fontWeight: '700' },

  dayTabs: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  dayTab: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center', gap: 4,
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
  },
  dayTabActive: { backgroundColor: AppColors.accent, borderColor: AppColors.accent },
  dayShort: { color: AppColors.textMuted, fontSize: 13, fontWeight: '600' },
  dayShortActive: { color: '#fff' },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: AppColors.accent },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },

  empty: { alignItems: 'center', gap: 10, paddingVertical: 60 },
  emptyText: { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  emptyHint: { color: AppColors.textMuted, fontSize: 13 },

  block: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16, overflow: 'hidden', gap: 14,
  },
  colorBar: { width: 5, alignSelf: 'stretch' },
  blockBody: { flex: 1, paddingVertical: 14, gap: 5 },
  blockTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockTask: { color: AppColors.text, fontSize: 16, fontWeight: '600', flex: 1 },
  blockTaskDone: { textDecorationLine: 'line-through', color: AppColors.textMuted },
  blockMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  blockMetaText: { color: AppColors.textMuted, fontSize: 12 },
  blockFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  priorityPill: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  priorityText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  energyPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  energyText: { color: AppColors.textMuted, fontSize: 11 },
});

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: AppColors.screen,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: AppColors.hairline,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: AppColors.hairline,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: AppColors.hairline,
  },
  headerTitle: { color: AppColors.text, fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, gap: 14, paddingBottom: 48 },

  label: {
    color: AppColors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: -6,
  },
  input: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: AppColors.text, fontSize: 15,
    outlineStyle: 'none' as any,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },

  chip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10, borderWidth: 1, borderColor: AppColors.tileBorder,
    backgroundColor: AppColors.tile,
  },
  chipText: { color: AppColors.textMuted, fontSize: 13 },

  divider: { height: 1, backgroundColor: AppColors.hairline, marginVertical: 4 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { color: AppColors.text, fontSize: 15, fontWeight: '500' },
  toggleSub: { color: AppColors.textMuted, fontSize: 12, marginTop: 2 },

  saveBtn: {
    backgroundColor: AppColors.accent,
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
