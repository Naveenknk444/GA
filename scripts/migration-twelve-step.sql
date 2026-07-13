-- ─────────────────────────────────────────────────────────────────────────────
-- 12 Step Program — Schema Migration
-- Run in Supabase dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Steps (12 rows, static)
CREATE TABLE IF NOT EXISTS steps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number int  NOT NULL UNIQUE CHECK (step_number BETWEEN 1 AND 12),
  title       text NOT NULL
);

-- 2. Step Exercises (~35 rows, static)
CREATE TABLE IF NOT EXISTS step_exercises (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id         uuid NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  exercise_number int  NOT NULL,
  title           text NOT NULL,
  intro_text      text,
  sort_order      int  NOT NULL,
  UNIQUE(step_id, exercise_number)
);

-- 3. Step Questions (all questions, static)
CREATE TABLE IF NOT EXISTS step_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id   uuid NOT NULL REFERENCES step_exercises(id) ON DELETE CASCADE,
  sort_order    int  NOT NULL,
  question_text text NOT NULL,
  UNIQUE(exercise_id, sort_order)
);

-- 4. Step Responses (user answers — private, never deleted)
CREATE TABLE IF NOT EXISTS step_responses (
  id            uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id   uuid      NOT NULL REFERENCES step_questions(id) ON DELETE CASCADE,
  response_text text      NOT NULL DEFAULT '',
  updated_at    timestamp NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE steps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_responses ENABLE ROW LEVEL SECURITY;

-- Static tables: any authenticated user can read
CREATE POLICY "steps_read"          ON steps          FOR SELECT TO authenticated USING (true);
CREATE POLICY "step_exercises_read" ON step_exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "step_questions_read" ON step_questions FOR SELECT TO authenticated USING (true);

-- Responses: each user sees and writes only their own rows
CREATE POLICY "step_responses_select" ON step_responses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "step_responses_insert" ON step_responses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "step_responses_update" ON step_responses
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
