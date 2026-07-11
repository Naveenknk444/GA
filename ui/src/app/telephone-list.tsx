import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Linking, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useDrawer } from '@/context/drawer';
import {
  fetchTelephoneList, daysCleanFromBirthday, formatCleanTime, phoneDigits,
  type TelephoneMember,
} from '@/api/telephone-list';

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

// Pick a consistent color per member based on their name
const AVATAR_COLORS = ['#3B82F6','#3FCF8E','#9B8CFF','#E0A53E','#F2616B','#4F8CFF','#A78BFA'];
function avatarColor(name: string): string {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) ?? 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function MemberCard({ member }: { member: TelephoneMember }) {
  const days  = daysCleanFromBirthday(member.ga_birthday);
  const color = avatarColor(member.name);

  function call() {
    Linking.openURL(`tel:${phoneDigits(member.phone)}`);
  }

  return (
    <View style={s.card}>
      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: color + '22' }]}>
        <Text style={[s.avatarText, { color }]}>{initials(member.name)}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={s.name}>{member.name}</Text>
        <View style={s.metaRow}>
          {days !== null && (
            <View style={s.badge}>
              <Ionicons name="leaf" size={10} color={AppColors.meetings} />
              <Text style={s.badgeText}>{formatCleanTime(days)}</Text>
            </View>
          )}
          {member.sponsor && (
            <View style={s.badge}>
              <Ionicons name="person" size={10} color={AppColors.textMuted} />
              <Text style={[s.badgeText, { color: AppColors.textMuted }]}>
                {member.sponsor}
              </Text>
            </View>
          )}
        </View>
        <Text style={s.phone}>{member.phone}</Text>
      </View>

      {/* Call button */}
      <Pressable onPress={call} style={s.callBtn} hitSlop={8}>
        <Ionicons name="call" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

export default function TelephoneListScreen() {
  const { open } = useDrawer();
  const [members, setMembers]   = useState<TelephoneMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query,   setQuery]     = useState('');

  useEffect(() => {
    fetchTelephoneList()
      .then(setMembers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = query.trim()
    ? members.filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
    : members;

  return (
    <View style={{ flex: 1 }}>
      <HomeBackdrop />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={open} hitSlop={10}>
          <Ionicons name="menu" size={26} color={AppColors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={s.title}>Telephone List</Text>
          <Text style={s.subtitle}>{members.length} members · tap to call</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={AppColors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name…"
          placeholderTextColor={AppColors.textMuted}
          style={s.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={AppColors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={AppColors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={m => m.id}
          renderItem={({ item }) => <MemberCard member={item} />}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.center}>
              <Ionicons name="people-outline" size={40} color={AppColors.textMuted} />
              <Text style={s.emptyText}>No members found.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

    </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  title:    { color: AppColors.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: AppColors.textMuted, fontSize: 12, marginTop: 1 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: {
    flex: 1, color: AppColors.text, fontSize: 14,
    outlineStyle: 'none' as any,
  },

  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 14, padding: 14,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700' },

  name:  { color: AppColors.text, fontSize: 15, fontWeight: '600' },
  phone: { color: AppColors.textMuted, fontSize: 12, marginTop: 2 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: AppColors.screen,
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeText: { color: AppColors.meetings, fontSize: 11, fontWeight: '500' },

  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: AppColors.meetings,
    alignItems: 'center', justifyContent: 'center',
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 60 },
  emptyText: { color: AppColors.textMuted, fontSize: 15 },
});
