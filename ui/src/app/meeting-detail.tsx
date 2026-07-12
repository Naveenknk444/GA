import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMeeting } from '@/api/meetings';
import { createBlock } from '@/api/schedule';
import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import type { Meeting } from '@/data/meetings';

function parseTo24h(timeStr: string): string {
  const [time, period] = timeStr.trim().split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function nextOccurrenceOf(dayName: string): string {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const target = DAYS.indexOf(dayName);
  const today = new Date();
  const diff = (target - today.getDay() + 7) % 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`;
}

export default function MeetingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined);
  const [addState, setAddState] = useState<'idle' | 'choosing' | 'adding' | 'added'>('idle');

  useEffect(() => {
    if (id) fetchMeeting(id).then(setMeeting);
  }, [id]);

  async function handleAddToCalendar(recurring: boolean) {
    if (!meeting || !user) return;
    setAddState('adding');
    try {
      const start = parseTo24h(meeting.time);
      const end = meeting.endTime ? parseTo24h(meeting.endTime) : addMinutes(start, 90);
      const location = meeting.online
        ? 'Online'
        : `${meeting.address}, ${meeting.city}, ${meeting.state}`.trim().replace(/,\s*$/, '');
      await createBlock(user.id, {
        day: meeting.day,
        start_time: start,
        end_time: end,
        task: meeting.name,
        color: meeting.color,
        priority: 'medium',
        location,
        reminder_minutes: null,
        energy_level: null,
        recurring,
        specific_date: recurring ? null : nextOccurrenceOf(meeting.day),
      });
      setAddState('added');
    } catch {
      setAddState('choosing');
    }
  }

  if (meeting === undefined) {
    return (
      <View style={styles.center}>
        <Text style={{ color: AppColors.textMuted }}>Loading…</Text>
      </View>
    );
  }

  if (meeting === null) {
    return (
      <View style={styles.center}>
        <Text style={{ color: AppColors.text }}>Meeting not found.</Text>
      </View>
    );
  }

  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const isToday = meeting.day === DAYS[new Date().getDay()];

  const rows = [
    { icon: 'calendar-outline', label: 'Day & Time', value: `${meeting.day} at ${meeting.time}` },
    {
      icon: 'location-outline',
      label: 'Address',
      value: meeting.online ? 'Online meeting' : `${meeting.address}, ${meeting.city}, ${meeting.state} ${meeting.zip}`,
    },
    { icon: 'globe-outline', label: 'Meeting Format', value: meeting.format },
    { icon: 'people-outline', label: 'Meeting Type', value: meeting.type },
  ] as const;

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={AppColors.text} />
          </Pressable>
          <Pressable
            hitSlop={10}
            onPress={() => Share.share({
              title: meeting.name,
              message: `${meeting.name} — ${meeting.day} at ${meeting.time}\n${meeting.online ? 'Online meeting' : `${meeting.address}, ${meeting.city}, ${meeting.state} ${meeting.zip}`}`,
            })}>
            <Ionicons name="share-outline" size={22} color={AppColors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 14 }}>
          {/* title block */}
          <View style={styles.titleBlock}>
            <View style={[styles.avatar, { backgroundColor: meeting.color + '22' }]}>
              <Ionicons name="people" size={26} color={meeting.color} />
            </View>
            <Text style={styles.name}>{meeting.name}</Text>
            <Text style={styles.type}>{meeting.type}</Text>
            <View style={styles.happening}>
              <View style={[styles.dot, !isToday && { backgroundColor: AppColors.textMuted }]} />
              <Text style={[styles.happeningText, !isToday && { color: AppColors.textMuted }]}>
                {isToday ? 'Happening today' : meeting.day} · {meeting.time}
              </Text>
            </View>
          </View>

          {/* info rows */}
          <View style={{ gap: 10 }}>
            {rows.map((r) => (
              <View key={r.label} style={styles.infoRow}>
                <Ionicons name={r.icon as any} size={18} color={AppColors.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{r.label}</Text>
                  <Text style={styles.infoValue}>{r.value}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
              </View>
            ))}
          </View>

          {/* action buttons */}
          {!meeting.online && (
            <Pressable
              style={[styles.actionBtn, { borderColor: AppColors.accent }]}
              onPress={() => {
                const addr = encodeURIComponent(`${meeting.address}, ${meeting.city}, ${meeting.state} ${meeting.zip}`);
                Linking.openURL(`https://maps.google.com/?q=${addr}`);
              }}>
              <Ionicons name="navigate" size={18} color={AppColors.accent} />
              <Text style={[styles.actionText, { color: AppColors.accent }]}>Get Directions</Text>
            </Pressable>
          )}

          {/* Add to calendar */}
          {addState === 'added' ? (
            <View style={styles.addedRow}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.meetings} />
              <Text style={styles.addedText}>Added to your schedule</Text>
            </View>
          ) : addState === 'choosing' ? (
            <View style={styles.choiceBox}>
              <Text style={styles.choiceLabel}>Add this meeting to your schedule:</Text>
              <View style={styles.choiceRow}>
                <Pressable style={styles.choiceBtn} onPress={() => handleAddToCalendar(false)}>
                  <Text style={styles.choiceBtnText}>This week only</Text>
                </Pressable>
                <Pressable style={[styles.choiceBtn, styles.choiceBtnPrimary]} onPress={() => handleAddToCalendar(true)}>
                  <Text style={[styles.choiceBtnText, { color: '#fff' }]}>Every week</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => setAddState('idle')}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          ) : addState === 'adding' ? (
            <View style={[styles.actionBtn, { borderColor: AppColors.meetings, justifyContent: 'center' }]}>
              <ActivityIndicator size="small" color={AppColors.meetings} />
            </View>
          ) : (
            <Pressable
              style={[styles.actionBtn, { borderColor: AppColors.meetings }]}
              onPress={() => setAddState('choosing')}>
              <Ionicons name="calendar-outline" size={18} color={AppColors.meetings} />
              <Text style={[styles.actionText, { color: AppColors.meetings }]}>Add to my calendar</Text>
            </Pressable>
          )}

          {/* about */}
          <View style={{ gap: 6 }}>
            <Text style={styles.aboutTitle}>About this meeting</Text>
            <Text style={styles.aboutText}>{meeting.about}</Text>
          </View>

          {/* anonymity note */}
          <View style={styles.note}>
            <Ionicons name="shield-checkmark" size={18} color={AppColors.talk} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>Respect anonymity and the GA tradition.</Text>
              <Text style={styles.noteText}>No real names or outside issues.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 6 },
  titleBlock: { alignItems: 'center', gap: 6, marginTop: 6 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  name: { color: AppColors.text, fontSize: 22, fontWeight: '700' },
  type: { color: AppColors.textMuted, fontSize: 14 },
  happening: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.meetings },
  happeningText: { color: AppColors.meetings, fontSize: 13, fontWeight: '500' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 14,
    padding: 14,
  },
  infoLabel: { color: AppColors.textMuted, fontSize: 12 },
  infoValue: { color: AppColors.text, fontSize: 15, marginTop: 2 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
  },
  actionText: { fontSize: 14, fontWeight: '500' },
  aboutTitle: { color: AppColors.text, fontSize: 16, fontWeight: '600', marginTop: 4 },
  aboutText: { color: AppColors.textMuted, fontSize: 14, lineHeight: 20 },
  note: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 14,
    padding: 14,
  },
  noteTitle: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  noteText: { color: AppColors.textMuted, fontSize: 13, marginTop: 2 },

  addedRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13,
    backgroundColor: AppColors.meetings + '18',
    borderRadius: 12, borderWidth: 1, borderColor: AppColors.meetings + '44',
  },
  addedText: { color: AppColors.meetings, fontSize: 14, fontWeight: '600' },

  choiceBox: {
    backgroundColor: AppColors.tile, borderRadius: 14,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    padding: 16, gap: 12,
  },
  choiceLabel: { color: AppColors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  choiceRow: { flexDirection: 'row', gap: 10 },
  choiceBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    alignItems: 'center',
  },
  choiceBtnPrimary: { backgroundColor: AppColors.meetings, borderColor: AppColors.meetings },
  choiceBtnText: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  cancelText: { color: AppColors.textMuted, fontSize: 13, textAlign: 'center' },
});
