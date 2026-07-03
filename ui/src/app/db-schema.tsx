import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/appTheme';

const DOMAINS = [
  {
    label: 'Core & Auth',
    color: '#E0A53E',
    tables: [
      {
        name: 'profiles',
        desc: 'One row per anonymous member — the identity layer.',
        columns: ['id', 'handle', 'clean_date', 'recovery_phrase', 'gambling_types', 'quiz_score'],
        types:   ['uuid PK = auth user', 'text', 'date', 'text', 'text[]', 'int'],
        fks:     ['id → auth.users'],
      },
      {
        name: 'user_roles',
        desc: 'GA roles a member holds. "member" is auto-assigned on signup.',
        columns: ['user_id', 'role', 'created_at'],
        types:   ['uuid PK FK', 'text', 'timestamptz'],
        fks:     ['user_id → auth.users'],
        note:    'Roles: member · sponsor · sponsee · treasurer · secretary · newcomer · admin ...',
      },
    ],
  },
  {
    label: 'Community',
    color: '#38BDF8',
    tables: [
      {
        name: 'posts',
        desc: 'Every post in the Talk feed.',
        columns: ['id', 'author_id', 'category', 'title', 'body', 'created_at'],
        types:   ['uuid PK', 'uuid FK', 'enum', 'text', 'text', 'timestamptz'],
        fks:     ['author_id → profiles'],
        note:    'category: discussion · support · milestone',
      },
      {
        name: 'comments',
        desc: 'Replies to posts.',
        columns: ['id', 'post_id', 'author_id', 'body', 'created_at'],
        types:   ['uuid PK', 'uuid FK', 'uuid FK', 'text', 'timestamptz'],
        fks:     ['post_id → posts', 'author_id → profiles'],
      },
    ],
  },
  {
    label: 'Meetings & Resources',
    color: '#3FCF8E',
    tables: [
      {
        name: 'meetings',
        desc: '37 Phoenix GA meetings. Admin-seeded — members read only.',
        columns: ['id', 'name', 'day', 'start_time', 'format', 'location_name', 'address', 'city', 'zip', '+ more'],
        types:   ['uuid PK', 'text', 'text', 'text', 'enum', 'text', 'text', 'text', 'text', ''],
        fks:     [],
        note:    'format: in_person · online · hybrid · telephone',
      },
      {
        name: 'resources',
        desc: 'Recovery links in the Resources tab. Admin-seeded — members read only.',
        columns: ['id', 'category', 'title', 'summary', 'url', 'sort'],
        types:   ['uuid PK', 'text', 'text', 'text', 'text', 'int'],
        fks:     [],
        note:    'category: newcomer · literature · gamban · self_exclusion',
      },
    ],
  },
  {
    label: 'Achievements',
    color: '#A78BFA',
    tables: [
      {
        name: 'achievements',
        desc: 'Badge definitions. Admin-seeded — the catalogue of what can be earned.',
        columns: ['key', 'title', 'description', 'category', 'type', 'icon', 'color', 'sort'],
        types:   ['text PK', 'text', 'text', 'enum', 'enum', 'text', 'text', 'int'],
        fks:     [],
        note:    'category: milestone · activity  |  type: automatic · self_reported',
      },
      {
        name: 'user_achievements',
        desc: 'Which badges a member has earned and when.',
        columns: ['user_id', 'achievement_key', 'earned_at'],
        types:   ['uuid PK FK', 'text PK FK', 'timestamptz'],
        fks:     ['user_id → auth.users', 'achievement_key → achievements'],
      },
    ],
  },
  {
    label: 'Sponsorships',
    color: '#94A3B8',
    tables: [
      {
        name: 'sponsorships',
        desc: 'The relationship between a sponsor and a sponsee.',
        columns: ['sponsor_id', 'member_id', 'status', 'requested_at', 'started_at', 'ended_at'],
        types:   ['uuid PK FK', 'uuid PK FK', 'text', 'timestamptz', 'timestamptz', 'timestamptz'],
        fks:     ['sponsor_id → auth.users', 'member_id → auth.users'],
        note:    'status: pending → active → ended',
      },
    ],
  },
  {
    label: 'PRG Workbook',
    color: '#F59E0B',
    tables: [
      {
        name: 'pressure_relief_meetings',
        desc: 'Full PRG financial workbook. One row per saved session per member.',
        columns: ['id', 'user_id', 'member_name', 'meeting_date', 'income', 'expenses', 'creditors', 'total_income_monthly', 'total_expenses_monthly', 'available_for_debt', 'visible_to_sponsor'],
        types:   ['uuid PK', 'uuid FK', 'text', 'date', 'JSONB', 'JSONB', 'JSONB', 'numeric', 'numeric', 'numeric', 'boolean'],
        fks:     ['user_id → auth.users'],
        note:    'Sponsor can read this row ONLY if visible_to_sponsor=true AND active sponsorship exists',
      },
    ],
  },
  {
    label: 'Schedule',
    color: '#64748B',
    tables: [
      {
        name: 'schedule_blocks',
        desc: 'Recurring weekly schedule template — one block per time slot.',
        columns: ['id', 'user_id', 'day', 'start_time', 'end_time', 'task', 'priority', 'energy_level'],
        types:   ['uuid PK', 'uuid FK', 'text', 'time', 'time', 'text', 'text', 'text'],
        fks:     ['user_id → auth.users'],
      },
      {
        name: 'schedule_logs',
        desc: 'Per-date record of whether a block was completed.',
        columns: ['id', 'user_id', 'block_id', 'date', 'completed', 'reflection'],
        types:   ['uuid PK', 'uuid FK', 'uuid FK', 'date', 'boolean', 'text'],
        fks:     ['user_id → auth.users', 'block_id → schedule_blocks'],
      },
    ],
  },
];

export default function DbSchemaScreen() {
  const router = useRouter();

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={AppColors.text} />
          </Pressable>
          <Text style={s.title}>Database Schema</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Auth root */}
          <View style={s.authCard}>
            <View style={s.authTop}>
              <Ionicons name="server-outline" size={16} color="#6B7280" />
              <Text style={s.authLabel}>auth.users</Text>
              <View style={s.authBadge}><Text style={s.authBadgeText}>Supabase managed</Text></View>
            </View>
            <Text style={s.authDesc}>
              Every user has exactly one row here — created automatically on sign-in. All other tables link back to this via <Text style={s.code}>auth.uid()</Text>.
            </Text>
          </View>

          <View style={s.rootLine} />

          {/* Domain sections */}
          {DOMAINS.map(domain => (
            <View key={domain.label} style={s.domain}>
              <View style={[s.domainHeader, { borderLeftColor: domain.color }]}>
                <View style={[s.domainDot, { backgroundColor: domain.color }]} />
                <Text style={s.domainLabel}>{domain.label}</Text>
              </View>

              {domain.tables.map(table => (
                <View key={table.name} style={[s.tableCard, { borderTopColor: domain.color }]}>
                  {/* Table name */}
                  <Text style={[s.tableName, { color: domain.color }]}>{table.name}</Text>
                  <Text style={s.tableDesc}>{table.desc}</Text>

                  {/* Columns */}
                  <View style={s.columnList}>
                    {table.columns.map((col, i) => (
                      <View key={col} style={s.columnRow}>
                        <Text style={s.colName}>{col}</Text>
                        {table.types[i] ? (
                          <Text style={[
                            s.colType,
                            table.types[i].includes('FK') && { color: domain.color + 'CC' },
                            table.types[i].includes('PK') && { color: AppColors.text },
                            table.types[i].includes('JSONB') && { color: '#F59E0B99' },
                          ]}>
                            {table.types[i]}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>

                  {/* FK relationships */}
                  {table.fks.length > 0 && (
                    <View style={s.fkBlock}>
                      {table.fks.map(fk => (
                        <View key={fk} style={s.fkRow}>
                          <Ionicons name="arrow-up" size={10} color={domain.color} />
                          <Text style={[s.fkText, { color: domain.color }]}>{fk}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Note */}
                  {table.note && (
                    <Text style={s.note}>{table.note}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          {/* RLS footer */}
          <View style={s.rlsCard}>
            <Ionicons name="shield-checkmark" size={18} color={AppColors.meetings} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.rlsTitle}>Row Level Security on every table</Text>
              <Text style={s.rlsText}>
                Supabase enforces at the database level that you can only read or write your own data — even if there were a bug in the app code.
              </Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: AppColors.hairline,
  },
  title: { color: AppColors.text, fontSize: 17, fontWeight: '700' },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 0 },

  // Auth root card
  authCard: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: '#6B728040',
    borderRadius: 12, padding: 14, gap: 8,
  },
  authTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authLabel: { color: AppColors.text, fontSize: 14, fontWeight: '700', flex: 1 },
  authBadge: {
    backgroundColor: '#6B728022', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  authBadgeText: { color: '#9CA3AF', fontSize: 10, fontWeight: '600' },
  authDesc: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },
  code: { color: AppColors.text, fontWeight: '600' },

  rootLine: {
    width: 2, height: 20, backgroundColor: AppColors.hairline,
    alignSelf: 'center', marginVertical: 4,
  },

  // Domain section
  domain: { marginBottom: 20 },
  domainHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderLeftWidth: 3, paddingLeft: 10, marginBottom: 8,
  },
  domainDot: { width: 7, height: 7, borderRadius: 4 },
  domainLabel: {
    color: AppColors.textMuted, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },

  // Table card
  tableCard: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderTopWidth: 2,
    borderRadius: 12, padding: 14,
    marginBottom: 10, gap: 8,
  },
  tableName: { fontSize: 14, fontWeight: '700' },
  tableDesc: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },

  // Columns
  columnList: {
    borderTopWidth: 1, borderTopColor: AppColors.hairline,
    paddingTop: 8, gap: 4,
  },
  columnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  colName: { color: AppColors.text, fontSize: 12, fontWeight: '500' },
  colType: { color: AppColors.textMuted, fontSize: 11 },

  // FK block
  fkBlock: {
    borderTopWidth: 1, borderTopColor: AppColors.hairline,
    paddingTop: 7, gap: 3,
  },
  fkRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  fkText: { fontSize: 11, fontWeight: '500' },

  // Note
  note: {
    color: AppColors.textMuted, fontSize: 11, lineHeight: 16,
    borderTopWidth: 1, borderTopColor: AppColors.hairline,
    paddingTop: 7, fontStyle: 'italic',
  },

  // RLS footer
  rlsCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: AppColors.meetings + '12',
    borderWidth: 1, borderColor: AppColors.meetings + '33',
    borderRadius: 12, padding: 14, marginTop: 4,
  },
  rlsTitle: { color: AppColors.text, fontSize: 13, fontWeight: '600' },
  rlsText: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },
});
