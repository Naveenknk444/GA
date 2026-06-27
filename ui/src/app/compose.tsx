import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';

// The four post types from the mockup.
const OPTIONS = [
  {
    key: 'discussion',
    icon: 'chatbubble-ellipses',
    color: AppColors.talk,
    title: 'Start a Discussion',
    blurb: 'Share your thoughts, experiences, or ask a question.',
  },
  {
    key: 'support',
    icon: 'heart',
    color: '#34D399',
    title: 'Ask for Support',
    blurb: "Reach out for support or talk about something you're struggling with.",
  },
  {
    key: 'milestone',
    icon: 'flag',
    color: AppColors.share,
    title: 'Share a Milestone',
    blurb: 'Celebrate your progress and inspire others on their journey.',
  },
  {
    key: 'experience',
    icon: 'people',
    color: AppColors.recovery,
    title: 'Share an Experience',
    blurb: 'Share your experience to help and give hope to others.',
  },
] as const;

export default function ComposeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <DesertBackdrop variant="band" height={200} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* header with back */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={AppColors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.prompt}>What would you like to do?</Text>
          <View style={styles.anonPill}>
            <Ionicons name="lock-closed" size={12} color={AppColors.share} />
            <Text style={styles.anonText}>Your post is anonymous</Text>
          </View>

          {/* 2x2 grid of post types */}
          <View style={styles.grid}>
            {OPTIONS.map((o) => (
              <Pressable key={o.key} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={[styles.cardIcon, { backgroundColor: o.color + '22' }]}>
                  <Ionicons name={o.icon as any} size={22} color={o.color} />
                </View>
                <Text style={styles.cardTitle}>{o.title}</Text>
                <Text style={styles.cardBlurb}>{o.blurb}</Text>
              </Pressable>
            ))}
          </View>

          {/* guidelines banner */}
          <View style={styles.banner}>
            <Ionicons name="shield-checkmark" size={20} color={AppColors.talk} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Community Guidelines</Text>
              <Text style={styles.bannerText}>
                Be respectful, focus on recovery, and protect your anonymity and others at all times.
              </Text>
              <Text style={styles.bannerLink}>Read full guidelines</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  band: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  headerTitle: { color: AppColors.text, fontSize: 18, fontWeight: '600' },
  prompt: { color: AppColors.text, fontSize: 18, fontWeight: '600', textAlign: 'center', marginTop: 10 },
  anonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(224,165,62,0.12)',
  },
  anonText: { color: AppColors.share, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    minHeight: 150,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    gap: 10,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
  },
  pressed: { opacity: 0.7 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: AppColors.text, fontSize: 15, fontWeight: '600' },
  cardBlurb: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },
  banner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  bannerTitle: { color: AppColors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  bannerText: { color: AppColors.textMuted, fontSize: 13, lineHeight: 18 },
  bannerLink: { color: AppColors.accent, fontSize: 13, marginTop: 8, fontWeight: '500' },
});
