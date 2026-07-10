import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { fetchReadLog } from '@/api/daily-reading';
import { DailyReadingModal } from '@/components/daily-reading-modal';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type Selected = { year: number; month: number; day: number };

export default function DailyReadingScreen() {
  const { user } = useAuth();
  const today = new Date();

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());  // 0-based
  const [readLog,   setReadLog]   = useState<Set<string>>(new Set());
  const [selected,  setSelected]  = useState<Selected | null>(null);

  function loadLog() {
    if (!user) return;
    fetchReadLog(user.id, viewYear).then(setReadLog);
  }

  useEffect(loadLog, [user, viewYear]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleModalClose() {
    setSelected(null);
    loadLog();
  }

  const grid = buildGrid(viewYear, viewMonth);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Page header */}
        <View style={s.pageHeader}>
          <View style={s.pageIcon}>
            <Ionicons name="book" size={22} color={AppColors.accent} />
          </View>
          <View>
            <Text style={s.pageTitle}>Daily Reading</Text>
            <Text style={s.pageSubtitle}>A Day at a Time — GA Blue Book</Text>
          </View>
        </View>

        {/* Today shortcut */}
        <Pressable
          onPress={() => setSelected({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() })}
          style={({ pressed }) => [s.todayCard, pressed && { opacity: 0.75 }]}>
          <Ionicons name="sunny-outline" size={18} color={AppColors.share} />
          <View style={{ flex: 1 }}>
            <Text style={s.todayLabel}>Read today's entry</Text>
            <Text style={s.todayDate}>{MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
        </Pressable>

        {/* Calendar card */}
        <View style={s.card}>

          {/* Month navigation */}
          <View style={s.nav}>
            <Pressable onPress={prevMonth} hitSlop={12} style={s.navBtn}>
              <Ionicons name="chevron-back" size={20} color={AppColors.text} />
            </Pressable>
            <Text style={s.navTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
            <Pressable onPress={nextMonth} hitSlop={12} style={s.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={AppColors.text} />
            </Pressable>
          </View>

          {/* Day-of-week headers */}
          <View style={s.row}>
            {DAY_LABELS.map(d => (
              <Text key={d} style={s.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={s.grid}>
            {grid.map((day, i) => {
              if (day === null) return <View key={i} style={s.cell} />;
              const logKey = `${viewMonth + 1}-${day}`;
              const isRead = readLog.has(logKey);
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;

              return (
                <Pressable
                  key={i}
                  onPress={() => setSelected({ year: viewYear, month: viewMonth + 1, day })}
                  style={({ pressed }) => [s.cell, pressed && { opacity: 0.55 }]}>
                  <View style={[s.dayCircle, isToday && s.dayCircleToday]}>
                    <Text style={[s.dayText, isToday && s.dayTextToday]}>{day}</Text>
                  </View>
                  {isRead
                    ? <View style={s.readDot} />
                    : <View style={s.dotGap} />
                  }
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={s.legend}>
          <View style={s.legendDot} />
          <Text style={s.legendText}>Read</Text>
          <View style={[s.legendRing]} />
          <Text style={s.legendText}>Today</Text>
        </View>

      </ScrollView>

      {selected && user && (
        <DailyReadingModal
          year={selected.year}
          month={selected.month}
          day={selected.day}
          userId={user.id}
          onClose={handleModalClose}
        />
      )}
    </SafeAreaView>
  );
}

const CELL = 44;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.screen },
  container: { padding: 20, paddingBottom: 40, gap: 16 },

  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pageIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: AppColors.accent + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { color: AppColors.text, fontSize: 20, fontWeight: '700' },
  pageSubtitle: { color: AppColors.textMuted, fontSize: 12, marginTop: 2 },

  todayCard: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.share + '50',
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  todayLabel: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  todayDate:  { color: AppColors.textMuted, fontSize: 12, marginTop: 2 },

  card: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16, padding: 16, gap: 10,
  },

  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { padding: 6 },
  navTitle: { color: AppColors.text, fontSize: 16, fontWeight: '700' },

  row: { flexDirection: 'row' },
  dayLabel: {
    width: CELL, textAlign: 'center',
    color: AppColors.textMuted, fontSize: 11, fontWeight: '600',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL, alignItems: 'center', paddingVertical: 3 },

  dayCircle: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  dayCircleToday: {
    borderWidth: 2, borderColor: AppColors.accent,
  },
  dayText: { color: AppColors.text, fontSize: 13 },
  dayTextToday: { color: AppColors.accent, fontWeight: '700' },

  readDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: AppColors.meetings,
    marginTop: 2,
  },
  dotGap: { width: 5, height: 5, marginTop: 2 },

  legend: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', opacity: 0.65,
  },
  legendDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: AppColors.meetings,
  },
  legendRing: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: AppColors.accent,
    marginLeft: 8,
  },
  legendText: { color: AppColors.textMuted, fontSize: 12, marginRight: 4 },
});
