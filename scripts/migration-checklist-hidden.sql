-- Tracks which GA default (system) checklist tasks a user has hidden
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS checklist_hidden_system_tasks (
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_key text NOT NULL,
  PRIMARY KEY (user_id, task_key)
);

ALTER TABLE checklist_hidden_system_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own hidden system tasks"
  ON checklist_hidden_system_tasks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
