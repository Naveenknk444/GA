import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMeetings } from '@/api/meetings';
import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useDrawer } from '@/context/drawer';
import type { Meeting } from '@/data/meetings';

const FORMAT_CHIPS = ['All Meetings', 'Online'] as const;
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_OPTIONS = ['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MeetingsScreen() {
  const router = useRouter();
  const { open } = useDrawer();
  const [chip, setChip] = useState<(typeof FORMAT_CHIPS)[number]>('All Meetings');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [source, setSource] = useState<'loading' | 'live' | 'sample'>('loading');
  const [query, setQuery] = useState('');
  const today = DAYS[new Date().getDay()];
  const [dayFilter, setDayFilter] = useState(today);
  const [showDayPicker, setShowDayPicker] = useState(false);

  useEffect(() => {
    fetchMeetings().then((r) => {
      setMeetings(r.data);
      setSource(r.source);
    });
  }, []);

  const filtered = meetings.filter((m) => {
    if (chip === 'Online' && !m.online) return false;
    if (dayFilter !== 'All Days' && m.day !== dayFilter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        (m.city ?? '').toLowerCase().includes(q) ||
        (m.address ?? '').toLowerCase().includes(q) ||
        (m.zip ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={open} hitSlop={10}>
            <Ionicons name="menu" size={26} color={AppColors.text} />
          </Pressable>
          <Text style={styles.title}>Meetings</Text>
          <Ionicons name="location-outline" size={24} color={AppColors.text} />
        </View>
        <Text style={styles.subtitle}>Find GA meetings near you.</Text>

        {/* search */}
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={AppColors.textMuted} />
          <TextInput
            placeholder="Search by name, city or zip"
            placeholderTextColor={AppColors.textMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          <Ionicons name="options-outline" size={18} color={AppColors.textMuted} />
        </View>

        {/* filter chips + day picker */}
        <View style={styles.filtersRow}>
          {FORMAT_CHIPS.map((c) => {
            const on = c === chip;
            return (
              <Pressable key={c} onPress={() => setChip(c)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{c}</Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => setShowDayPicker(v => !v)}
            style={[styles.chip, styles.dayChip, showDayPicker && styles.chipOn]}
          >
            <Ionicons name="calendar-outline" size={13} color={showDayPicker ? '#fff' : AppColors.textMuted} />
            <Text style={[styles.chipText, showDayPicker && styles.chipTextOn]}>
              {dayFilter === 'All Days' ? 'All Days' : dayFilter}
            </Text>
            <Ionicons
              name={showDayPicker ? 'chevron-up' : 'chevron-down'}
              size={12}
              color={showDayPicker ? '#fff' : AppColors.textMuted}
            />
          </Pressable>
        </View>

        {/* Day dropdown — Modal so it always renders above everything */}
        <Modal
          visible={showDayPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDayPicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDayPicker(false)}>
            <View style={styles.dropdownCard} onStartShouldSetResponder={() => true}>

              {/* Header */}
              <View style={styles.dropdownHeader}>
                <Ionicons name="calendar-outline" size={18} color={AppColors.accent} />
                <Text style={styles.dropdownHeading}>Select a day</Text>
                <Pressable onPress={() => setShowDayPicker(false)} hitSlop={10}>
                  <Ionicons name="close-circle" size={22} color={AppColors.textMuted} />
                </Pressable>
              </View>

              {/* Options */}
              <View style={styles.dropdownList}>
                {DAY_OPTIONS.map((d, i) => {
                  const active  = d === dayFilter;
                  const isToday = d === today;
                  const isLast  = i === DAY_OPTIONS.length - 1;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => { setDayFilter(d); setShowDayPicker(false); }}
                      style={({ pressed }) => [
                        styles.dropdownOption,
                        active && styles.dropdownOptionActive,
                        pressed && { opacity: 0.7 },
                        !isLast && styles.dropdownOptionBorder,
                      ]}
                    >
                      {/* Left accent bar on active */}
                      {active && <View style={styles.dropdownAccentBar} />}

                      <View style={styles.dropdownOptionInner}>
                        <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionTextActive]}>
                          {d}
                        </Text>
                        {isToday && (
                          <View style={styles.todayBadge}>
                            <Text style={styles.todayBadgeText}>Today</Text>
                          </View>
                        )}
                      </View>

                      {active
                        ? <Ionicons name="checkmark-circle" size={20} color={AppColors.accent} />
                        : <View style={styles.dropdownCircle} />
                      }
                    </Pressable>
                  );
                })}
              </View>

            </View>
          </Pressable>
        </Modal>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {source === 'loading' ? 'Loading…' : `${filtered.length} meetings found`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {source === 'live' && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
            {source === 'sample' && <Text style={styles.sampleText}>Sample data</Text>}
          </View>
        </View>

        {/* list */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
          {filtered.length === 0 && source !== 'loading' && (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={36} color={AppColors.textMuted} />
              <Text style={styles.emptyText}>No meetings found</Text>
              <Text style={styles.emptyHint}>Try a different search or filter</Text>
            </View>
          )}
          {filtered.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => router.push({ pathname: '/meeting-detail', params: { id: m.id } })}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}>
              <View style={[styles.avatar, { backgroundColor: m.color + '22' }]}>
                <Ionicons name="people" size={20} color={m.color} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.cardName}>{m.name}</Text>
                <View style={styles.cardLine}>
                  <Ionicons name="time-outline" size={13} color={AppColors.textMuted} />
                  <Text style={styles.cardMuted}>
                    {m.day} {m.time}
                  </Text>
                </View>
                <View style={styles.cardLine}>
                  <Ionicons name="location-outline" size={13} color={AppColors.textMuted} />
                  <Text style={styles.cardMuted}>
                    {m.online ? 'Online meeting' : `${m.address}, ${m.city}, ${m.state} ${m.zip}`}
                  </Text>
                </View>
              </View>
              <Text style={[styles.distance, m.online && { color: AppColors.meetings }]}>
                {m.online ? 'Online' : m.distanceMi != null ? `${m.distanceMi} mi` : (m.typeCode ?? '')}
              </Text>
            </Pressable>
          ))}

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={18} color={AppColors.talk} />
            <Text style={styles.footerText}>
              All meetings are provided by members. Please verify times and details before attending.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  band: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  title: { color: AppColors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: AppColors.textMuted, fontSize: 14, marginTop: 2 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginTop: 16,
  },
  searchInput: { flex: 1, color: AppColors.text, fontSize: 14, outlineStyle: 'none' as any },
  filtersRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
  },
  chipOn: { backgroundColor: AppColors.accent, borderColor: AppColors.accent },
  chipText: { color: AppColors.textMuted, fontSize: 13 },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  dayChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: AppColors.screen,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.hairline,
    backgroundColor: AppColors.tile,
  },
  dropdownHeading: {
    flex: 1,
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownList: { paddingVertical: 6 },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    gap: 12,
  },
  dropdownOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.hairline,
  },
  dropdownOptionActive: { backgroundColor: AppColors.accent + '14' },
  dropdownAccentBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3,
    backgroundColor: AppColors.accent,
    borderRadius: 2,
  },
  dropdownOptionInner: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dropdownOptionText: { color: AppColors.text, fontSize: 15 },
  dropdownOptionTextActive: { color: AppColors.accent, fontWeight: '700' },
  dropdownCircle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: AppColors.tileBorder,
  },
  todayBadge: {
    backgroundColor: AppColors.accent + '22',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  todayBadgeText: { color: AppColors.accent, fontSize: 11, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 },
  metaText: { color: AppColors.textMuted, fontSize: 13 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(63,207,142,0.14)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: AppColors.meetings },
  liveText: { color: AppColors.meetings, fontSize: 11, fontWeight: '600' },
  sampleText: { color: AppColors.textMuted, fontSize: 11, fontStyle: 'italic' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 16,
    padding: 14,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardName: { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  cardLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMuted: { color: AppColors.textMuted, fontSize: 13 },
  distance: { color: AppColors.textMuted, fontSize: 13, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  footerText: { color: AppColors.textMuted, fontSize: 12, flex: 1, lineHeight: 17 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyText: { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  emptyHint: { color: AppColors.textMuted, fontSize: 13 },
});
