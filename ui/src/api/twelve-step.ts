import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Step = {
  id: string;
  step_number: number;
  title: string;
};

export type StepExercise = {
  id: string;
  step_id: string;
  exercise_number: number;
  title: string;
  intro_text: string | null;
  sort_order: number;
};

export type StepQuestion = {
  id: string;
  exercise_id: string;
  sort_order: number;
  question_text: string;
};

export type StepResponse = {
  id: string;
  user_id: string;
  question_id: string;
  response_text: string;
  updated_at: string;
};

// ── Fetch all 12 steps ────────────────────────────────────────────────────────

export async function fetchSteps(): Promise<Step[]> {
  const { data } = await supabase
    .from('steps')
    .select('*')
    .order('step_number');
  return (data ?? []) as Step[];
}

// ── Fetch exercises for a step ────────────────────────────────────────────────

export async function fetchExercises(stepId: string): Promise<StepExercise[]> {
  const { data } = await supabase
    .from('step_exercises')
    .select('*')
    .eq('step_id', stepId)
    .order('sort_order');
  return (data ?? []) as StepExercise[];
}

// ── Fetch questions for an exercise ──────────────────────────────────────────

export async function fetchQuestions(exerciseId: string): Promise<StepQuestion[]> {
  const { data } = await supabase
    .from('step_questions')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('sort_order');
  return (data ?? []) as StepQuestion[];
}

// ── Fetch user responses for an exercise (keyed by question_id) ───────────────

export async function fetchResponses(
  userId: string,
  exerciseId: string,
): Promise<Record<string, StepResponse>> {
  const { data: questions } = await supabase
    .from('step_questions')
    .select('id')
    .eq('exercise_id', exerciseId);

  if (!questions || questions.length === 0) return {};

  const questionIds = questions.map((q) => q.id);

  const { data } = await supabase
    .from('step_responses')
    .select('*')
    .eq('user_id', userId)
    .in('question_id', questionIds);

  const map: Record<string, StepResponse> = {};
  for (const row of data ?? []) {
    map[row.question_id] = row as StepResponse;
  }
  return map;
}

// ── Save (upsert) a single response ──────────────────────────────────────────

export async function saveResponse(
  userId: string,
  questionId: string,
  responseText: string,
): Promise<void> {
  await supabase.from('step_responses').upsert(
    {
      user_id:       userId,
      question_id:   questionId,
      response_text: responseText,
      updated_at:    new Date().toISOString(),
    },
    { onConflict: 'user_id,question_id' },
  );
}

// ── Progress: answered count per step ────────────────────────────────────────
// Returns { answered, total } for each step_id

export type StepProgress = { answered: number; total: number };

export async function fetchStepProgress(
  userId: string,
  stepIds: string[],
): Promise<Record<string, StepProgress>> {
  if (stepIds.length === 0) return {};

  // All questions for these steps (via exercises)
  const { data: exercises } = await supabase
    .from('step_exercises')
    .select('id, step_id')
    .in('step_id', stepIds);

  if (!exercises || exercises.length === 0) {
    return Object.fromEntries(stepIds.map((id) => [id, { answered: 0, total: 0 }]));
  }

  const exerciseIds = exercises.map((e) => e.id);

  const { data: questions } = await supabase
    .from('step_questions')
    .select('id, exercise_id')
    .in('exercise_id', exerciseIds);

  const questionIds = (questions ?? []).map((q) => q.id);

  const { data: responses } = await supabase
    .from('step_responses')
    .select('question_id')
    .eq('user_id', userId)
    .in('question_id', questionIds);

  // Map exercise_id → step_id
  const exerciseToStep: Record<string, string> = {};
  for (const e of exercises) exerciseToStep[e.id] = e.step_id;

  // Map question_id → step_id
  const questionToStep: Record<string, string> = {};
  for (const q of questions ?? []) {
    questionToStep[q.id] = exerciseToStep[q.exercise_id];
  }

  const answeredSet = new Set((responses ?? []).map((r) => r.question_id));

  const progress: Record<string, StepProgress> = {};
  for (const stepId of stepIds) progress[stepId] = { answered: 0, total: 0 };

  for (const q of questions ?? []) {
    const stepId = questionToStep[q.id];
    if (!stepId || !progress[stepId]) continue;
    progress[stepId].total += 1;
    if (answeredSet.has(q.id)) progress[stepId].answered += 1;
  }

  return progress;
}
