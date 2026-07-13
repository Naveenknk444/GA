import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import {
  fetchExercises, fetchQuestions, fetchResponses,
  fetchStepProgress, fetchSteps, saveResponse,
  type Step, type StepExercise, type StepProgress,
  type StepQuestion, type StepResponse,
} from '@/api/twelve-step';

const ACCENT = AppColors.recovery;

type ViewName = 'steps' | 'exercises' | 'questions';

export default function TwelveStepScreen() {
  const router  = useRouter();
  const { user } = useAuth();

  // ── View state ────────────────────────────────────────────────────
  const [view,             setView]             = useState<ViewName>('steps');
  const [selectedStep,     setSelectedStep]     = useState<Step | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<StepExercise | null>(null);

  // ── Steps view ────────────────────────────────────────────────────
  const [steps,        setSteps]        = useState<Step[]>([]);
  const [stepProgress, setStepProgress] = useState<Record<string, StepProgress>>({});
  const [stepsLoading, setStepsLoading] = useState(true);

  // ── Exercises view ────────────────────────────────────────────────
  const [exercises,        setExercises]        = useState<StepExercise[]>([]);
  const [exProgress,       setExProgress]       = useState<Record<string, { answered: number; total: number }>>({});
  const [exercisesLoading, setExercisesLoading] = useState(false);

  // ── Questions view ────────────────────────────────────────────────
  const [questions,       setQuestions]       = useState<StepQuestion[]>([]);
  const [responses,       setResponses]       = useState<Record<string, StepResponse>>({});
  const [drafts,          setDrafts]          = useState<Record<string, string>>({});
  const [savedId,         setSavedId]         = useState<string | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // ── Load steps + progress on mount ───────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchSteps().then(async (s) => {
      setSteps(s);
      const prog = await fetchStepProgress(user.id, s.map(x => x.id));
      setStepProgress(prog);
      setStepsLoading(false);
    });
  }, [user]);

  // ── Open a step ───────────────────────────────────────────────────
  async function openStep(step: Step) {
    if (!user) return;
    setSelectedStep(step);
    setView('exercises');
    setExercisesLoading(true);

    const exs = await fetchExercises(step.id);
    setExercises(exs);

    if (exs.length > 0) {
      const [allQs, allRs] = await Promise.all([
        Promise.all(exs.map(e => fetchQuestions(e.id))),
        Promise.all(exs.map(e => fetchResponses(user.id, e.id))),
      ]);
      const ep: Record<string, { answered: number; total: number }> = {};
      exs.forEach((e, i) => {
        const qs = allQs[i];
        const rs = allRs[i];
        ep[e.id] = {
          total:    qs.length,
          answered: qs.filter(q => (rs[q.id]?.response_text ?? '').trim().length > 0).length,
        };
      });
      setExProgress(ep);
    }
    setExercisesLoading(false);
  }

  // ── Open an exercise ──────────────────────────────────────────────
  async function openExercise(exercise: StepExercise) {
    if (!user) return;
    setSelectedExercise(exercise);
    setView('questions');
    setQuestionsLoading(true);

    const [qs, rs] = await Promise.all([
      fetchQuestions(exercise.id),
      fetchResponses(user.id, exercise.id),
    ]);
    setQuestions(qs);
    setResponses(rs);

    const d: Record<string, string> = {};
    for (const q of qs) d[q.id] = rs[q.id]?.response_text ?? '';
    setDrafts(d);
    setQuestionsLoading(false);
  }

  // ── Auto-save on blur ─────────────────────────────────────────────
  async function handleBlur(questionId: string) {
    if (!user) return;
    const text     = drafts[questionId] ?? '';
    const existing = responses[questionId]?.response_text ?? '';
    if (text === existing) return;

    await saveResponse(user.id, questionId, text);
    setSavedId(questionId);
    setTimeout(() => setSavedId(id => (id === questionId ? null : id)), 2000);

    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { id: '', user_id: user.id, question_id: questionId }),
        response_text: text,
        updated_at:    new Date().toISOString(),
      } as StepResponse,
    }));
  }

  // ── Back ──────────────────────────────────────────────────────────
  function goBack() {
    if (view === 'questions') { setView('exercises'); setSelectedExercise(null); }
    else if (view === 'exercises') { setView('steps'); setSelectedStep(null); }
    else router.back();
  }

  function headerTitle() {
    if (view === 'questions' && selectedExercise) return selectedExercise.title;
    if (view === 'exercises' && selectedStep)     return selectedStep.title;
    return '12 Step Program';
  }

  // ─────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <HomeBackdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={goBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={AppColors.text} />
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>{headerTitle()}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ── STEP LIST ── */}
        {view === 'steps' && (
          stepsLoading ? <Loader /> : (
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
              <View style={s.introCard}>
                <View style={s.introRow}>
                  <Ionicons name="book-outline" size={18} color={ACCENT} />
                  <Text style={[s.introLabel, { color: ACCENT }]}>GA 12 Steps</Text>
                </View>
                <Text style={s.introText}>
                  Work through each step at your own pace with your sponsor. Tap a step to open its exercises.
                </Text>
              </View>

              {steps.map(step => {
                const prog = stepProgress[step.id] ?? { answered: 0, total: 0 };
                const done = prog.total > 0 && prog.answered === prog.total;
                return (
                  <Pressable
                    key={step.id}
                    style={({ pressed }) => [s.card, pressed && { opacity: 0.7 }]}
                    onPress={() => openStep(step)}
                  >
                    <StepBadge n={step.step_number} done={done} />
                    <View style={s.cardBody}>
                      <Text style={s.cardTitle}>{step.title}</Text>
                      {prog.total > 0 && (
                        <ProgressRow answered={prog.answered} total={prog.total} />
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
                  </Pressable>
                );
              })}
            </ScrollView>
          )
        )}

        {/* ── EXERCISE LIST ── */}
        {view === 'exercises' && (
          exercisesLoading ? <Loader /> : (
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
              {exercises.map(ex => {
                const prog = exProgress[ex.id] ?? { answered: 0, total: 0 };
                const done = prog.total > 0 && prog.answered === prog.total;
                const label = ex.exercise_number === 0 ? 'P' : String(ex.exercise_number);
                return (
                  <Pressable
                    key={ex.id}
                    style={({ pressed }) => [s.card, pressed && { opacity: 0.7 }]}
                    onPress={() => openExercise(ex)}
                  >
                    <StepBadge label={label} done={done} />
                    <View style={s.cardBody}>
                      <Text style={s.cardTitle}>{ex.title}</Text>
                      {prog.total > 0 && (
                        <ProgressRow answered={prog.answered} total={prog.total} />
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
                  </Pressable>
                );
              })}
            </ScrollView>
          )
        )}

        {/* ── QUESTIONS ── */}
        {view === 'questions' && (
          questionsLoading ? <Loader /> : (
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

              {selectedExercise?.intro_text ? (
                <View style={s.introCard}>
                  <Text style={s.introText}>{selectedExercise.intro_text}</Text>
                </View>
              ) : null}

              {questions.map((q, i) => {
                const hasAnswer = (drafts[q.id] ?? '').trim().length > 0;
                const justSaved = savedId === q.id;
                return (
                  <View key={q.id} style={s.questionCard}>
                    <View style={s.questionHeader}>
                      <View style={[s.qBadge, hasAnswer && s.qBadgeFilled]}>
                        {hasAnswer
                          ? <Ionicons name="checkmark" size={12} color={ACCENT} />
                          : <Text style={s.qNum}>{i + 1}</Text>
                        }
                      </View>
                      <Text style={s.questionText}>{q.question_text}</Text>
                    </View>

                    <TextInput
                      style={s.textarea}
                      multiline
                      placeholder="Write your answer here…"
                      placeholderTextColor={AppColors.textMuted}
                      value={drafts[q.id] ?? ''}
                      onChangeText={text => setDrafts(prev => ({ ...prev, [q.id]: text }))}
                      onBlur={() => handleBlur(q.id)}
                      textAlignVertical="top"
                    />

                    {justSaved && (
                      <View style={s.savedRow}>
                        <Ionicons name="checkmark-circle" size={13} color={AppColors.meetings} />
                        <Text style={s.savedText}>Saved</Text>
                      </View>
                    )}
                  </View>
                );
              })}

              <View style={{ height: 32 }} />
            </ScrollView>
          )
        )}

      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Small reusable components ─────────────────────────────────────────────────

function Loader() {
  return (
    <View style={s.center}>
      <ActivityIndicator color={ACCENT} />
    </View>
  );
}

function StepBadge({ n, label, done }: { n?: number; label?: string; done: boolean }) {
  return (
    <View style={[s.badge, done && s.badgeDone]}>
      {done
        ? <Ionicons name="checkmark" size={15} color={ACCENT} />
        : <Text style={s.badgeText}>{label ?? String(n)}</Text>
      }
    </View>
  );
}

function ProgressRow({ answered, total }: { answered: number; total: number }) {
  const pct = total > 0 ? (answered / total) * 100 : 0;
  return (
    <View style={s.progRow}>
      <View style={s.progTrack}>
        <View style={[s.progFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={s.progLabel}>{answered} of {total} answered</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 8,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:  { gap: 12, paddingBottom: 44 },

  introCard: {
    backgroundColor: ACCENT + '12',
    borderWidth: 1,
    borderColor:  ACCENT + '30',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  introRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  introLabel: { fontSize: 15, fontWeight: '700' },
  introText:  { color: AppColors.textMuted, fontSize: 13, lineHeight: 20 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor:  AppColors.tileBorder,
    borderRadius: 16,
    padding: 16,
  },
  cardBody:  { flex: 1, gap: 6 },
  cardTitle: { color: AppColors.text, fontSize: 14, fontWeight: '600' },

  badge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ACCENT + '22',
    borderWidth: 1, borderColor: ACCENT + '44',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  badgeDone: { backgroundColor: ACCENT + '44' },
  badgeText: { color: ACCENT, fontSize: 13, fontWeight: '800' },

  progRow:   { gap: 4 },
  progTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progFill:  { height: 3, backgroundColor: ACCENT, borderRadius: 2 },
  progLabel: { color: AppColors.textMuted, fontSize: 11 },

  questionCard: {
    backgroundColor: AppColors.tile,
    borderWidth: 1,
    borderColor:  AppColors.tileBorder,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  questionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  qBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.hairline,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  qBadgeFilled: { backgroundColor: ACCENT + '33', borderColor: ACCENT + '66' },
  qNum:         { color: AppColors.textMuted, fontSize: 11, fontWeight: '700' },
  questionText: { color: AppColors.text, fontSize: 14, lineHeight: 21, flex: 1 },
  textarea: {
    backgroundColor: AppColors.screen,
    borderWidth: 1,
    borderColor: AppColors.hairline,
    borderRadius: 12,
    padding: 14,
    color: AppColors.text,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 120,
    outlineStyle: 'none' as any,
  },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedText: { color: AppColors.meetings, fontSize: 11, fontWeight: '600' },
});
