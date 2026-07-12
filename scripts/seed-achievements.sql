-- Achievement catalogue — safe to re-run.
-- Uses DO UPDATE SET sort so existing rows with wrong sort values get corrected.
-- Run in Supabase dashboard → SQL Editor.

INSERT INTO achievements (key, title, description, category, type, icon, color, sort)
VALUES
  -- Clean time milestones (chronological order by sort)
  ('1_day_clean',      '1 Day Clean',       'Your first full day free from gambling.',         'milestone', 'automatic', 'sunny-outline',  '#FBBF24', 10),
  ('3_days_clean',     '3 Days Clean',      'Three days of freedom. Keep going.',              'milestone', 'automatic', 'flame-outline',  '#FB923C', 15),
  ('1_week_clean',     '1 Week Clean',      'One week free from gambling.',                    'milestone', 'automatic', 'star-outline',   '#34D399', 20),
  ('1_month_clean',    '30 Days Clean',     'One month of recovery.',                          'milestone', 'automatic', 'ribbon-outline', '#3B82F6', 30),
  ('2_months_clean',   '60 Days Clean',     'Two months free from gambling.',                  'milestone', 'automatic', 'ribbon',         '#3FCF8E', 35),
  ('3_months_clean',   '90 Days Clean',     'Three months of sustained recovery.',             'milestone', 'automatic', 'medal-outline',  '#8B5CF6', 40),
  ('6_months_clean',   '6 Months Clean',    'Half a year of freedom.',                         'milestone', 'automatic', 'trophy-outline', '#F59E0B', 50),
  ('9_months_clean',   '9 Months Clean',    'Nine months of sustained recovery.',              'milestone', 'automatic', 'trophy-outline', '#34D399', 55),
  ('1_year_clean',     '1 Year Clean',      'One full year of recovery.',                      'milestone', 'automatic', 'trophy',         '#EF4444', 60),
  ('18_months_clean',  '18 Months Clean',   'A year and a half of recovery.',                  'milestone', 'automatic', 'trophy-outline', '#A78BFA', 75),

  -- Activity badges
  ('profile_set_up',          'Profile Set Up',        'You set your name and recovery date.',        'activity', 'automatic',    'person-circle-outline',    '#60A5FA', 100),
  ('set_gambling_type',       'Know Your Pattern',     'You identified your gambling type.',           'activity', 'automatic',    'analytics-outline',        '#A78BFA', 110),
  ('completed_20_questions',  '20 Questions Complete', 'You completed the GA 20 Questions quiz.',      'activity', 'automatic',    'checkmark-circle',         '#34D399', 120),
  ('first_post',              'First Post',            'You shared something with the community.',     'activity', 'automatic',    'chatbubble-outline',       '#60A5FA', 130),
  ('first_reply',             'First Reply',           'You replied to another member''s post.',       'activity', 'automatic',    'return-down-forward',      '#34D399', 140),
  ('found_sponsor',           'Found a Sponsor',       'You connected with a GA sponsor.',             'activity', 'self_reported','people-outline',           '#F59E0B', 150),
  ('attended_first_meeting',  'First Meeting',         'You attended your first GA meeting.',          'activity', 'self_reported','location-outline',         '#3FCF8E', 160),
  ('completed_prg',           'PRG Complete',          'You completed a Pressure Relief Group meeting.','activity','self_reported','shield-checkmark-outline',  '#8B5CF6', 170)
ON CONFLICT (key) DO UPDATE SET sort = EXCLUDED.sort;
