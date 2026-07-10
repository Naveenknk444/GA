-- Daily Checklist table
-- Tracks all task completions: daily (by date), weekly (by Monday), one-time (any date)

CREATE TABLE public.daily_checkins (
  user_id        uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  task_key       text NOT NULL,
  completed_date date NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (user_id, task_key, completed_date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own checkins"
  ON public.daily_checkins FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
