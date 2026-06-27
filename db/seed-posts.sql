-- ============================================================
-- Seed posts, comments, and resources
-- Run in Supabase SQL Editor → New Query → Run
-- Run AFTER schema.sql. Safe to re-run (uses ON CONFLICT DO NOTHING).
-- ============================================================

-- Step 1: Create fake anonymous seed users in auth.users
--         These are sample community members for demo data only.
insert into auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  is_super_admin, raw_app_meta_data, raw_user_meta_data, is_sso_user
) values
  ('aaaaaaaa-0000-0000-0000-000000000001','authenticated','authenticated',
   null, null, now(), now()-interval'120 days', now(),
   false,'{"provider":"anonymous","providers":["anonymous"]}','{}',false),
  ('aaaaaaaa-0000-0000-0000-000000000002','authenticated','authenticated',
   null, null, now(), now()-interval'90 days', now(),
   false,'{"provider":"anonymous","providers":["anonymous"]}','{}',false),
  ('aaaaaaaa-0000-0000-0000-000000000003','authenticated','authenticated',
   null, null, now(), now()-interval'45 days', now(),
   false,'{"provider":"anonymous","providers":["anonymous"]}','{}',false),
  ('aaaaaaaa-0000-0000-0000-000000000004','authenticated','authenticated',
   null, null, now(), now()-interval'10 days', now(),
   false,'{"provider":"anonymous","providers":["anonymous"]}','{}',false)
on conflict (id) do nothing;

-- Step 2: Create profiles for those seed users
insert into profiles (id, handle, clean_date, created_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001','Member a1b2c3d4','2025-05-20', now()-interval'120 days'),
  ('aaaaaaaa-0000-0000-0000-000000000002','Member e5f6g7h8','2025-08-01', now()-interval'90 days'),
  ('aaaaaaaa-0000-0000-0000-000000000003','Member i9j0k1l2','2026-01-10', now()-interval'45 days'),
  ('aaaaaaaa-0000-0000-0000-000000000004','Member m3n4o5p6','2026-06-19', now()-interval'10 days')
on conflict (id) do nothing;

-- Step 3: Seed posts (known IDs so we can link comments below)
insert into posts (id, author_id, category, title, body, created_at) values

  ('bbbbbbbb-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'milestone',
   '90 days clean today',
   'I never thought I would make it this far. Three months ago I was hiding losses from my family and lying to myself every single day. Today I woke up with nothing to hide. Thank you to everyone in this community.',
   now()-interval'2 hours'),

  ('bbbbbbbb-0000-0000-0000-000000000002',
   'aaaaaaaa-0000-0000-0000-000000000002',
   'support',
   'Rough night — need to talk',
   'Had a really hard evening. Drove past the casino on my way home and sat in the parking lot for 20 minutes. I did not go in. But it scared me how close it was. Has anyone else been through this?',
   now()-interval'5 hours'),

  ('bbbbbbbb-0000-0000-0000-000000000003',
   'aaaaaaaa-0000-0000-0000-000000000003',
   'discussion',
   'How did you tell your family?',
   'I have been clean for 45 days but still have not told my wife the full truth about what happened. I am scared of her reaction but I know I cannot keep carrying this alone. How did others handle this conversation?',
   now()-interval'1 day'),

  ('bbbbbbbb-0000-0000-0000-000000000004',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'milestone',
   'One year — could not have done it without GA',
   'One year ago today I walked into my first GA meeting. I was broken, in debt, and completely out of hope. Today I have a sponsor, a home group, and a life I actually want to live. One day at a time.',
   now()-interval'2 days'),

  ('bbbbbbbb-0000-0000-0000-000000000005',
   'aaaaaaaa-0000-0000-0000-000000000002',
   'discussion',
   'Tips for dealing with sports season?',
   'Football season is the hardest time for me. Ads everywhere, friends placing bets, group chats full of picks. The temptation is constant. What strategies do you use to get through it?',
   now()-interval'3 days'),

  ('bbbbbbbb-0000-0000-0000-000000000006',
   'aaaaaaaa-0000-0000-0000-000000000004',
   'support',
   'First week — is it supposed to feel this hard?',
   'Day 6 today. I feel like I am crawling out of my skin. The urges come in waves and I do not know what to do with myself. I went to two meetings this week but still feel so alone in this. Does it get easier?',
   now()-interval'4 days')

on conflict (id) do nothing;

-- Step 4: Seed comments
insert into comments (post_id, author_id, body, created_at) values

  -- On "90 days clean today"
  ('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000002',
   'This made my morning. Congratulations. 90 days is no small thing — keep coming back.',
   now()-interval'1 hour'),
  ('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000004',
   'You give me so much hope. I am at day 6 and this is exactly what I needed to read today.',
   now()-interval'40 minutes'),

  -- On "Rough night"
  ('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000003',
   'The fact that you did not go in is the win. That took real strength. Call your sponsor if the urge comes back tonight.',
   now()-interval'4 hours'),
  ('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000001',
   'I have been there. Sat outside for over an hour once. You drove away. That is all that matters. We are here for you.',
   now()-interval'3 hours'),

  -- On "How did you tell your family?"
  ('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000001',
   'I told mine with a counselor present. Having a third person made it feel safer for both of us. Still hard, but it was the right thing to do.',
   now()-interval'20 hours'),
  ('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000002',
   'There is no perfect moment. I wrote a letter first because I could not find the words out loud. It helped me organise my thoughts before the real conversation.',
   now()-interval'18 hours'),

  -- On "One year"
  ('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000003',
   'One year! You give the rest of us something to aim for. Thank you for sharing this.',
   now()-interval'1 day 22 hours'),

  -- On "First week"
  ('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000001',
   'Yes it does get easier. Week one is the hardest. Keep going to meetings every single day if you have to. It genuinely helps.',
   now()-interval'3 days 20 hours'),
  ('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000003',
   'You are not alone. Day 6 means you chose recovery 6 times. That is 6 victories, even if it does not feel that way right now.',
   now()-interval'3 days 18 hours');

-- Step 5: Seed resources
insert into resources (category, title, summary, url, sort) values
  ('newcomer',       'Is GA For You? — 20 Questions',        'Answer 20 questions to understand if gambling has become a problem in your life.',                                  'https://www.gamblersanonymous.org/ga/content/20-questions',                   1),
  ('literature',     'GA Combo Book',                         'The primary text of Gamblers Anonymous — includes the 12 steps, 20 questions, and personal recovery stories.',     'https://www.gamblersanonymous.org/ga/content/combo-book',                     2),
  ('newcomer',       'How GA Works',                          'A plain-language overview of the GA fellowship, meeting format, and the recovery program.',                         'https://www.gamblersanonymous.org/ga/content/unity-program',                  3),
  ('gamban',         'Gamban — Block Gambling Sites',         'Software that blocks gambling websites and apps across all your devices. Free for GA members.',                     'https://gamban.com',                                                          4),
  ('self_exclusion', 'Arizona Self-Exclusion Program',        'Voluntarily ban yourself from Arizona tribal casinos and state-licensed gaming facilities.',                        'https://www.azgaming.gov/self-exclusion/',                                     5),
  ('self_exclusion', 'National Problem Gambling Helpline',    '24/7 free and confidential support. Call or text 1-800-522-4700.',                                                 'https://www.ncpgambling.org/help-treatment/national-helpline-1-800-522-4700/', 6),
  ('literature',     'GA Unity Program — The Steps',          'The 12 steps of the GA program, adapted from the original 12-step model for compulsive gamblers.',                 'https://www.gamblersanonymous.org/ga/content/unity-program',                  7)
on conflict do nothing;
