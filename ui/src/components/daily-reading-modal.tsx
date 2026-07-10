import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/appTheme';
import { fetchDailyReading, markAsRead, type DailyReading } from '@/api/daily-reading';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface Props {
  year: number;
  month: number;  // 1-based
  day: number;
  userId: string;
  onClose: () => void;
}

export function DailyReadingModal({ year, month, day, userId, onClose }: Props) {
  const [reading, setReading] = useState<DailyReading | null>(null);
  const [loading, setLoading]  = useState(true);

  const today = new Date();
  const isToday =
    year === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    day === today.getDate();

  useEffect(() => {
    setLoading(true);
    fetchDailyReading(month, day)
      .then(setReading)
      .finally(() => setLoading(false));
  }, [month, day]);

  async function handleClose() {
    if (isToday) {
      await markAsRead(userId, year, month, day);
    }
    onClose();
  }

  const dateLabel = `${MONTHS[month - 1]} ${day}, ${year}`;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerIcon}>
              <Ionicons name="book" size={18} color={AppColors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>A Day at a Time</Text>
              <Text style={s.subtitle}>{dateLabel}</Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={12} style={s.xBtn}>
              <Ionicons name="close" size={20} color={AppColors.text} />
            </Pressable>
          </View>

          <View style={s.divider} />

          {/* Body */}
          <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false}>
            {loading && (
              <View style={s.center}>
                <ActivityIndicator color={AppColors.accent} size="large" />
              </View>
            )}

            {!loading && !reading && (
              <View style={s.center}>
                <Ionicons name="book-outline" size={44} color={AppColors.textMuted} />
                <Text style={s.emptyText}>No reading for {MONTHS[month - 1]} {day}.</Text>
                <Text style={s.emptyHint}>More readings are being added soon.</Text>
              </View>
            )}

            {!loading && reading && (
              <>
                <View style={s.section}>
                  <Text style={s.sectionLabel}>Reflection</Text>
                  <Text style={s.reflectionText}>{reading.content.reflection}</Text>
                </View>

                <View style={[s.section, s.prayerCard]}>
                  <Text style={s.sectionLabel}>Prayer</Text>
                  <Text style={s.prayerText}>{reading.content.prayer}</Text>
                </View>

                <View style={[s.section, s.rememberCard]}>
                  <Text style={s.sectionLabel}>Remember</Text>
                  <Text style={s.rememberText}>{reading.content.remember}</Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer close button */}
          <View style={s.divider} />
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [s.footer, pressed && { opacity: 0.7 }]}>
            <Ionicons
              name={isToday ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={20}
              color={AppColors.accent}
            />
            <Text style={s.footerText}>
              {isToday ? 'Done — mark today as read' : 'Close'}
            </Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#101521',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderBottomWidth: 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    gap: 12,
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppColors.accent + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: AppColors.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: AppColors.accent, fontSize: 12, fontWeight: '600', marginTop: 1 },
  xBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: AppColors.screen,
    alignItems: 'center', justifyContent: 'center',
  },

  divider: { height: 1, backgroundColor: AppColors.hairline },

  body: { flexShrink: 1 },
  bodyContent: { padding: 20, gap: 20 },

  center: {
    alignItems: 'center', paddingVertical: 40, gap: 10,
  },
  emptyText: { color: AppColors.text, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  emptyHint: { color: AppColors.textMuted, fontSize: 13, textAlign: 'center' },

  section: { gap: 8 },
  sectionLabel: {
    color: AppColors.accent, fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1.4,
  },

  reflectionText: { color: AppColors.text, fontSize: 15, lineHeight: 25 },

  prayerCard: {
    backgroundColor: AppColors.screen,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: AppColors.tileBorder,
  },
  prayerText: { color: AppColors.text, fontSize: 14, lineHeight: 23, fontStyle: 'italic' },

  rememberCard: {
    backgroundColor: AppColors.accent + '15',
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: AppColors.accent + '35',
  },
  rememberText: { color: AppColors.text, fontSize: 14, lineHeight: 23, fontWeight: '600' },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16,
  },
  footerText: { color: AppColors.accent, fontSize: 15, fontWeight: '600' },
});
