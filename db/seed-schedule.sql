-- ── Seed your weekly schedule ─────────────────────────────────────────────────
-- HOW TO RUN:
--   1. Go to Supabase → Authentication → Users → copy your user UUID
--   2. Replace 'YOUR-USER-ID-HERE' below with that UUID
--   3. Run this script in Supabase SQL editor

do $$
declare
  uid uuid := '921c51fc-03ae-4bfa-8c4b-8172376c7776'; -- Naveen. Change this UUID to seed for a different user.
begin

insert into public.schedule_blocks
  (user_id, day, start_time, end_time, task, color, priority, energy_level)
values

-- ── Monday ────────────────────────────────────────────────────────────────────
(uid, 'Monday', '05:00', '14:00', 'Work',     '#4F8CFF', 'high',   'high'),
(uid, 'Monday', '14:00', '16:00', 'Gym',      '#E0A53E', 'high',   'high'),
(uid, 'Monday', '16:00', '17:00', 'LinkedIn', '#9B8CFF', 'medium', 'medium'),
(uid, 'Monday', '17:00', '22:00', 'GA',       '#3FCF8E', 'high',   'medium'),

-- ── Tuesday ───────────────────────────────────────────────────────────────────
(uid, 'Tuesday', '05:00', '14:00', 'Work',     '#4F8CFF', 'high',   'high'),
(uid, 'Tuesday', '14:00', '16:00', 'Gym',      '#E0A53E', 'high',   'high'),
(uid, 'Tuesday', '16:00', '17:00', 'Cleaning', '#9AA4B2', 'low',    'low'),
(uid, 'Tuesday', '17:30', '20:30', 'GA',       '#3FCF8E', 'high',   'medium'),

-- ── Wednesday ─────────────────────────────────────────────────────────────────
(uid, 'Wednesday', '05:00', '14:00', 'Work', '#4F8CFF', 'high', 'high'),
(uid, 'Wednesday', '15:00', '22:00', 'GA',   '#3FCF8E', 'high', 'medium'),

-- ── Thursday ──────────────────────────────────────────────────────────────────
(uid, 'Thursday', '05:00', '14:00', 'Work',    '#4F8CFF', 'high',   'high'),
(uid, 'Thursday', '14:00', '16:00', 'Gym',     '#E0A53E', 'high',   'high'),
(uid, 'Thursday', '16:00', '17:30', '12-step', '#F97316', 'high',   'medium'),
(uid, 'Thursday', '17:30', '20:30', 'GA',      '#3FCF8E', 'high',   'medium'),

-- ── Friday ────────────────────────────────────────────────────────────────────
(uid, 'Friday', '05:00', '14:00', 'Work',            '#4F8CFF', 'high',   'high'),
(uid, 'Friday', '14:00', '19:00', 'App development', '#4F8CFF', 'high',   'high'),
(uid, 'Friday', '19:00', '23:59', 'Free time',       '#3FCF8E', 'low',    'low'),

-- ── Saturday ──────────────────────────────────────────────────────────────────
(uid, 'Saturday', '05:00', '07:00', 'Gym',              '#E0A53E', 'high',   'high'),
(uid, 'Saturday', '07:00', '10:00', 'GA',               '#3FCF8E', 'high',   'medium'),
(uid, 'Saturday', '10:00', '12:00', 'Cleaning/Laundry', '#9AA4B2', 'medium', 'low'),
(uid, 'Saturday', '12:00', '14:00', 'LinkedIn',         '#9B8CFF', 'medium', 'medium'),
(uid, 'Saturday', '14:30', '17:30', 'Idea Talk',        '#E0A53E', 'medium', 'medium'),
(uid, 'Saturday', '18:00', '20:00', 'LinkedIn',         '#9B8CFF', 'medium', 'medium'),

-- ── Sunday ────────────────────────────────────────────────────────────────────
(uid, 'Sunday', '05:00', '07:00', 'Gym',         '#E0A53E', 'high',   'high'),
(uid, 'Sunday', '09:00', '12:00', 'GA',          '#3FCF8E', 'high',   'medium'),
(uid, 'Sunday', '12:00', '18:00', 'Office work', '#4F8CFF', 'high',   'high');

end $$;
