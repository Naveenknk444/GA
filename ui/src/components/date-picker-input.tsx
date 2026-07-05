import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/appTheme';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function parseYMD(str: string): { year: number; month: number; day: number } | null {
  const parts = str.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { year: parts[0], month: parts[1] - 1, day: parts[2] };
}

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay();   // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DatePickerInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parseYMD(value);
  const today  = new Date();

  const [open,       setOpen]       = useState(false);
  const [viewYear,   setViewYear]   = useState(parsed?.year  ?? today.getFullYear());
  const [viewMonth,  setViewMonth]  = useState(parsed?.month ?? today.getMonth());

  const displayText = parsed
    ? new Date(parsed.year, parsed.month, parsed.day)
        .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Select a date';

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day: number) {
    onChange(toYMD(viewYear, viewMonth, day));
    setOpen(false);
  }

  const grid = buildGrid(viewYear, viewMonth);

  return (
    <View>
      {/* Trigger button */}
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={[s.trigger, open && s.triggerOpen]}>
        <Ionicons name="calendar-outline" size={18} color={AppColors.accent} />
        <Text style={[s.triggerText, !parsed && s.triggerPlaceholder]}>
          {displayText}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={AppColors.textMuted}
        />
      </Pressable>

      {/* Calendar dropdown */}
      {open && (
        <View style={s.calendar}>

          {/* Month / year navigation */}
          <View style={s.nav}>
            <Pressable onPress={prevMonth} hitSlop={10} style={s.navBtn}>
              <Ionicons name="chevron-back" size={18} color={AppColors.text} />
            </Pressable>
            <Text style={s.navTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
            <Pressable onPress={nextMonth} hitSlop={10} style={s.navBtn}>
              <Ionicons name="chevron-forward" size={18} color={AppColors.text} />
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
              const isSelected =
                parsed?.year === viewYear &&
                parsed?.month === viewMonth &&
                parsed?.day === day;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;
              return (
                <Pressable
                  key={i}
                  onPress={() => selectDay(day)}
                  style={[s.cell, isSelected && s.cellSelected]}>
                  <Text style={[
                    s.dayText,
                    isToday && s.dayToday,
                    isSelected && s.daySelectedText,
                  ]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

        </View>
      )}
    </View>
  );
}

const CELL = 36;

const s = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppColors.screen,
    borderWidth: 1,
    borderColor: AppColors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerOpen: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  triggerText: { flex: 1, color: AppColors.text, fontSize: 15 },
  triggerPlaceholder: { color: AppColors.textMuted },

  calendar: {
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: AppColors.accent,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 12,
    gap: 8,
  },

  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { padding: 4 },
  navTitle: { color: AppColors.text, fontSize: 15, fontWeight: '700' },

  row: { flexDirection: 'row' },
  dayLabel: {
    width: CELL, textAlign: 'center',
    color: AppColors.textMuted, fontSize: 11, fontWeight: '600',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: CELL, height: CELL,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: CELL / 2,
  },
  cellSelected: { backgroundColor: AppColors.accent },

  dayText: { color: AppColors.text, fontSize: 13 },
  dayToday: { color: AppColors.accent, fontWeight: '700' },
  daySelectedText: { color: '#fff', fontWeight: '700' },
});
