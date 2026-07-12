-- Checklist tasks table — add/edit/reorder tasks without code changes
-- Run in Supabase SQL Editor

CREATE TABLE public.checklist_tasks (
  id       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key      text NOT NULL UNIQUE,
  label    text NOT NULL,
  sublabel text,
  type     text NOT NULL CHECK (type IN ('daily', 'weekly', 'onetime')),
  sort     int  NOT NULL DEFAULT 0,
  active   boolean DEFAULT true NOT NULL
);

ALTER TABLE public.checklist_tasks ENABLE ROW LEVEL SECURITY;

-- Any signed-in member can read active tasks
CREATE POLICY "authenticated users can read tasks"
  ON public.checklist_tasks FOR SELECT
  TO authenticated
  USING (active = true);

-- Seed
INSERT INTO public.checklist_tasks (key, label, sublabel, type, sort) VALUES
  ('no_gambling',      'Stayed away from gambling',          'One day at a time',                    'daily',   1),
  ('called_member',    'Called or texted a GA member',       'Use the telephone list',               'daily',   2),
  ('read_recovery',    'Read recovery material',             'Daily reading or GA steps',            'daily',   3),
  ('one_day_at_time',  'Lived one day at a time',            'Easy does it',                         'daily',   4),
  ('attended_meeting', 'Attended a GA meeting',              'Meetings make it',                     'weekly',  1),
  ('sponsor_contact',  'Connected with my sponsor',          'Get a sponsor if you need one',        'weekly',  2),
  ('found_sponsor',    'Found a sponsor',                    'Difficult to recover alone',           'onetime', 1),
  ('scheduled_prg',    'Scheduled a Pressure Relief Group',  'Financial & personal pressure relief', 'onetime', 2),
  ('joined_home_group','Joined a home group',                'Get involved and be of service',       'onetime', 3),
  ('completed_20q',    'Completed the 20 Questions',         'Available in the Recovery tab',        'onetime', 4);
