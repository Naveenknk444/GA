import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createPost } from '@/api/posts';
import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';

type Category = 'discussion' | 'support' | 'milestone';

const CATEGORIES: { key: Category; icon: string; color: string; title: string; blurb: string }[] = [
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
    blurb: "Reach out when you're struggling. The community is here for you.",
  },
  {
    key: 'milestone',
    icon: 'flag',
    color: AppColors.share,
    title: 'Share a Milestone',
    blurb: 'Celebrate your progress and inspire others on their journey.',
  },
];

const CATEGORY_LABEL: Record<Category, string> = {
  discussion: 'Discussion',
  support: 'Support',
  milestone: 'Milestone',
};

const DOLLAR_RE = /\$\s*\d/;
const GAMBLING_WORDS_RE = /\b(bets?|betting|wagered?|wagers?|jackpot)\b/i;

function contentError(text: string): string | null {
  if (DOLLAR_RE.test(text))         return "Please don't include specific dollar amounts — focus on feelings and recovery.";
  if (GAMBLING_WORDS_RE.test(text)) return 'Please avoid gambling-specific terms like "bet" or "wager" — focus on your journey.';
  return null;
}

export default function ComposeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<'pick' | 'write'>('pick');
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  function handlePickCategory(cat: Category) {
    setCategory(cat);
    setStep('write');
  }

  function handleBack() {
    if (step === 'write') {
      setStep('pick');
      setError('');
    } else {
      router.back();
    }
  }

  async function handlePost() {
    if (!user || !category || !title.trim() || !body.trim()) return;
    const err = contentError(title + ' ' + body);
    if (err) { setError(err); return; }
    setPosting(true);
    setError('');
    try {
      await createPost(user.id, category, title.trim(), body.trim());
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  }

  const canPost = title.trim().length > 0 && body.trim().length > 0 && !posting;

  return (
    <View style={styles.root}>
      <DesertBackdrop variant="band" height={200} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={AppColors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>New Post</Text>
          {step === 'write' ? (
            <Pressable
              onPress={handlePost}
              disabled={!canPost}
              style={[styles.postBtn, !canPost && { opacity: 0.4 }]}>
              {posting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.postBtnText}>Post</Text>}
            </Pressable>
          ) : (
            <View style={{ width: 52 }} />
          )}
        </View>

        {/* ── STEP 1: pick a category ── */}
        {step === 'pick' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.prompt}>What would you like to share?</Text>

            <View style={styles.anonPill}>
              <Ionicons name="lock-closed" size={12} color={AppColors.share} />
              <Text style={styles.anonText}>Your post is anonymous</Text>
            </View>

            <View style={styles.categoryList}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => handlePickCategory(c.key)}
                  style={({ pressed }) => [styles.categoryCard, pressed && { opacity: 0.7 }]}>
                  <View style={[styles.cardIcon, { backgroundColor: c.color + '22' }]}>
                    <Ionicons name={c.icon as any} size={24} color={c.color} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={styles.cardTitle}>{c.title}</Text>
                    <Text style={styles.cardBlurb}>{c.blurb}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
                </Pressable>
              ))}
            </View>

            <View style={styles.banner}>
              <Ionicons name="shield-checkmark" size={20} color={AppColors.talk} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Community Guidelines</Text>
                <Text style={styles.bannerText}>
                  Be respectful, focus on recovery, and protect your anonymity and others at all times.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* ── STEP 2: write the post ── */}
        {step === 'write' && category && (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

              {/* selected category badge */}
              <View style={styles.anonPill}>
                <Ionicons name="lock-closed" size={12} color={AppColors.share} />
                <Text style={styles.anonText}>Anonymous · {CATEGORY_LABEL[category]}</Text>
              </View>

              {/* title */}
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                placeholder="Give your post a title..."
                placeholderTextColor={AppColors.textMuted}
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                maxLength={120}
                autoFocus
              />

              {/* body */}
              <Text style={styles.fieldLabel}>Your message</Text>
              <TextInput
                placeholder="Share what's on your mind..."
                placeholderTextColor={AppColors.textMuted}
                style={styles.bodyInput}
                value={body}
                onChangeText={setBody}
                multiline
                textAlignVertical="top"
                maxLength={2000}
              />
              <Text style={styles.charCount}>{body.length} / 2000</Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#F2616B" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.guideline}>
                <Ionicons name="shield-checkmark-outline" size={14} color={AppColors.textMuted} />
                <Text style={styles.guidelineText}>
                  Do not share specific dollar amounts or betting details — focus on feelings and recovery.
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  safe: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 4,
  },
  headerTitle: { color: AppColors.text, fontSize: 18, fontWeight: '600' },
  postBtn: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 52,
    alignItems: 'center',
  },
  postBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  prompt: { color: AppColors.text, fontSize: 18, fontWeight: '600', textAlign: 'center', marginTop: 14 },
  anonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(224,165,62,0.12)',
  },
  anonText: { color: AppColors.share, fontSize: 12 },

  categoryList: { gap: 12 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 16,
    padding: 16,
  },
  cardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: AppColors.text, fontSize: 15, fontWeight: '600' },
  cardBlurb: { color: AppColors.textMuted, fontSize: 13, lineHeight: 18 },

  banner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  bannerTitle: { color: AppColors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  bannerText: { color: AppColors.textMuted, fontSize: 13, lineHeight: 18 },

  fieldLabel: { color: AppColors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginTop: 18 },
  titleInput: {
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: AppColors.text,
    fontSize: 16,
    outlineStyle: 'none' as any,
  },
  bodyInput: {
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: AppColors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 160,
    outlineStyle: 'none' as any,
  },
  charCount: { color: AppColors.textMuted, fontSize: 11, textAlign: 'right', marginTop: 6 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(242,97,107,0.10)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  errorText: { color: '#F2616B', fontSize: 13, flex: 1 },

  guideline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: AppColors.tile,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.tileBorder,
  },
  guidelineText: { color: AppColors.textMuted, fontSize: 12, lineHeight: 18, flex: 1 },
});
