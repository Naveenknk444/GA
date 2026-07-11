import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMeetings } from '@/api/meetings';
import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useDrawer } from '@/context/drawer';
import type { Meeting } from '@/data/meetings';

const CHIPS = ['All Meetings', 'Today', 'Online'] as const;

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function MeetingsScreen() {
  const router = useRouter();
  const { open } = useDrawer();
  const [chip, setChip] = useState<(typeof CHIPS)[number]>('All Meetings');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [source, setSource] = useState<'loading' | 'live' | 'sample'>('loading');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchMeetings().then((r) => {
      setMeetings(r.data);
      setSource(r.source);
    });
  }, []);

  const today = DAYS[new Date().getDay()];

  const filtered = meetings.filter((m) => {
    if (chip === 'Today' && m.day !== today) return false;
    if (chip === 'Online' && !m.online) return false;
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

        {/* filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ gap: 8 }}>
          {CHIPS.map((c) => {
            const on = c === chip;
            return (
              <Pressable key={c} onPress={() => setChip(c)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

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
  chips: { marginTop: 14, flexGrow: 0 },
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
