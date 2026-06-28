import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMeeting } from '@/api/meetings';
import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';
import type { Meeting } from '@/data/meetings';

export default function MeetingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined);

  useEffect(() => {
    if (id) fetchMeeting(id).then(setMeeting);
  }, [id]);

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
      <DesertBackdrop variant="band" height={200} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={AppColors.text} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Ionicons name="bookmark-outline" size={22} color={AppColors.text} />
            <Ionicons name="ellipsis-horizontal" size={22} color={AppColors.text} />
          </View>
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
          <View style={styles.actionRow}>
            <View style={[styles.actionBtn, { borderColor: AppColors.accent }]}>
              <Ionicons name="navigate" size={18} color={AppColors.accent} />
              <Text style={[styles.actionText, { color: AppColors.accent }]}>Directions</Text>
            </View>
            <View style={[styles.actionBtn, { borderColor: AppColors.meetings }]}>
              <Ionicons name="call" size={18} color={AppColors.meetings} />
              <Text style={[styles.actionText, { color: AppColors.meetings }]}>Call Location</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <View style={styles.actionBtnGhost}>
              <Ionicons name="calendar-outline" size={18} color={AppColors.text} />
              <Text style={[styles.actionText, { color: AppColors.text }]}>Add to Calendar</Text>
            </View>
            <View style={styles.actionBtnGhost}>
              <Ionicons name="share-outline" size={18} color={AppColors.text} />
              <Text style={[styles.actionText, { color: AppColors.text }]}>Share Meeting</Text>
            </View>
          </View>

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
  root: { flex: 1, backgroundColor: AppColors.screen },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.screen },
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
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionBtnGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    backgroundColor: AppColors.tile,
    borderRadius: 12,
    paddingVertical: 12,
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
});
