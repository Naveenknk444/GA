-- ─────────────────────────────────────────────────────────────────────────────
-- 12 Step Program -- Seed Data
-- Run AFTER migration-twelve-step.sql
-- Safe to re-run: all inserts use ON CONFLICT ... DO UPDATE
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Steps ─────────────────────────────────────────────────────────────────

INSERT INTO steps (step_number, title) VALUES
  (1,  'Step 1 - Powerlessness'),
  (2,  'Step 2 - Hope'),
  (3,  'Step 3 - Decision'),
  (4,  'Step 4 - Inventory'),
  (5,  'Step 5 - Admission'),
  (6,  'Step 6 - Readiness'),
  (7,  'Step 7 - Humility'),
  (8,  'Step 8 - Willingness'),
  (9,  'Step 9 - Amends'),
  (10, 'Step 10 - Perseverance'),
  (11, 'Step 11 - Seeking'),
  (12, 'Step 12 - Service')
ON CONFLICT (step_number) DO UPDATE SET title = EXCLUDED.title;


-- ── 2. Exercises ─────────────────────────────────────────────────────────────

-- Step 1
WITH s AS (SELECT id FROM steps WHERE step_number = 1)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, v.n, v.t, v.i, v.o
FROM s CROSS JOIN (VALUES
  (1, 'The Twenty Questions',
      'These questions were developed to help you determine if gambling has been a problem in your life. Answer honestly.',
      1),
  (2, 'Powerlessness',
      'Step 1 asks us to admit we were powerless over gambling. Explore what powerlessness means in your own life.',
      2),
  (3, 'Unmanageability',
      'The second part of Step 1 is that our lives had become unmanageable. Examine the areas where gambling made your life unmanageable.',
      3),
  (4, 'Acceptance',
      'Acceptance is the foundation of recovery. Without fully accepting our powerlessness, we cannot move forward.',
      4)
) AS v(n, t, i, o)
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 2
WITH s AS (SELECT id FROM steps WHERE step_number = 2)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, v.n, v.t, v.i, v.o
FROM s CROSS JOIN (VALUES
  (1, 'Understanding Step 2',
      'Step 2 asks us to open our minds to the possibility that a Power greater than ourselves can help us recover.',
      1),
  (2, 'My Higher Power',
      'Define what a Higher Power means to you. It can be anything you choose - the GA group, nature, or a God of your understanding.',
      2)
) AS v(n, t, i, o)
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 3
WITH s AS (SELECT id FROM steps WHERE step_number = 3)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, v.n, v.t, v.i, v.o
FROM s CROSS JOIN (VALUES
  (1, 'Making the Decision',
      'Step 3 is about making a decision - not perfecting it. We become willing to let go of our own willfulness.',
      1),
  (2, 'Letting Go',
      'Explore what it means to let go of control and trust a process greater than yourself.',
      2)
) AS v(n, t, i, o)
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 4
WITH s AS (SELECT id FROM steps WHERE step_number = 4)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, v.n, v.t, v.i, v.o
FROM s CROSS JOIN (VALUES
  (1, 'Resentments',
      'List the people, places, and institutions you resent. Examine how these resentments have affected you.',
      1),
  (2, 'Fears',
      'List your fears and examine how they have driven your behavior and decisions.',
      2),
  (3, 'Harm to Others',
      'List the ways in which your gambling harmed others - financially, emotionally, and in trust.',
      3)
) AS v(n, t, i, o)
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 5
WITH s AS (SELECT id FROM steps WHERE step_number = 5)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, v.n, v.t, v.i, v.o
FROM s CROSS JOIN (VALUES
  (1, 'Preparing for Step 5',
      'Before sharing your inventory, reflect on what this step means and what it will take.',
      1),
  (2, 'After Step 5',
      'After sharing your inventory with another person, reflect on the experience.',
      2)
) AS v(n, t, i, o)
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 6
WITH s AS (SELECT id FROM steps WHERE step_number = 6)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, 1,
  'Character Defects',
  'Identify the character defects revealed in your inventory and reflect on your readiness to have them removed.',
  1
FROM s
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 7
WITH s AS (SELECT id FROM steps WHERE step_number = 7)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, 1,
  'Humility and Shortcomings',
  'Step 7 requires humility - the willingness to seek help and to change. Reflect on this humility.',
  1
FROM s
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 8
WITH s AS (SELECT id FROM steps WHERE step_number = 8)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, v.n, v.t, v.i, v.o
FROM s CROSS JOIN (VALUES
  (1, 'People I Have Harmed',
      'Make a list of everyone harmed by your gambling. Be thorough and honest.',
      1),
  (2, 'Becoming Willing',
      'Examine your willingness to make amends to each person on your list.',
      2)
) AS v(n, t, i, o)
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 9
WITH s AS (SELECT id FROM steps WHERE step_number = 9)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, v.n, v.t, v.i, v.o
FROM s CROSS JOIN (VALUES
  (1, 'Planning Amends',
      'Plan how you will make amends to specific people, considering timing and method carefully.',
      1),
  (2, 'After Amends',
      'Reflect on the amends you have made and what you have learned.',
      2)
) AS v(n, t, i, o)
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 10
WITH s AS (SELECT id FROM steps WHERE step_number = 10)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, 1,
  'Daily Inventory',
  'Step 10 is practiced daily. Reflect on your day, identify wrongs promptly, and keep your side of the street clean.',
  1
FROM s
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 11
WITH s AS (SELECT id FROM steps WHERE step_number = 11)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, 1,
  'Prayer and Meditation',
  'Develop a practice of seeking conscious contact with your Higher Power through prayer and meditation.',
  1
FROM s
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;

-- Step 12
WITH s AS (SELECT id FROM steps WHERE step_number = 12)
INSERT INTO step_exercises (step_id, exercise_number, title, intro_text, sort_order)
SELECT s.id, v.n, v.t, v.i, v.o
FROM s CROSS JOIN (VALUES
  (1, 'The Spiritual Awakening',
      'Reflect on the spiritual awakening you have experienced through working the steps.',
      1),
  (2, 'Carrying the Message',
      'Explore how you will carry the GA message to other compulsive gamblers.',
      2)
) AS v(n, t, i, o)
ON CONFLICT (step_id, exercise_number) DO UPDATE
  SET title = EXCLUDED.title, intro_text = EXCLUDED.intro_text, sort_order = EXCLUDED.sort_order;


-- ── 3. Questions ─────────────────────────────────────────────────────────────

-- Step 1 / Exercise 1: The Twenty Questions
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 1 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1,  'Did you ever lose time from work or school due to gambling?'),
  (2,  'Has gambling ever made your home life unhappy?'),
  (3,  'Did gambling affect your reputation?'),
  (4,  'Have you ever felt remorse after gambling?'),
  (5,  'Did you ever gamble to get money with which to pay debts or otherwise solve financial difficulties?'),
  (6,  'Did gambling cause a decrease in your ambition or efficiency?'),
  (7,  'After losing did you feel you must return as soon as possible and win back your losses?'),
  (8,  'After a win did you have a strong urge to return and win more?'),
  (9,  'Did you often gamble until your last dollar was gone?'),
  (10, 'Did you ever borrow to finance your gambling?'),
  (11, 'Have you ever sold anything to finance gambling?'),
  (12, 'Were you reluctant to use gambling money for normal expenditures?'),
  (13, 'Did gambling make you careless of the welfare of yourself or your family?'),
  (14, 'Did you ever gamble longer than you had planned?'),
  (15, 'Have you ever gambled to escape worry, trouble, boredom, or loneliness?'),
  (16, 'Have you ever committed, or considered committing, an illegal act to finance gambling?'),
  (17, 'Did gambling cause you to have difficulty in sleeping?'),
  (18, 'Do arguments, disappointments or frustrations create within you an urge to gamble?'),
  (19, 'Did you ever have an urge to celebrate any good fortune by a few hours of gambling?'),
  (20, 'Have you ever considered self-destruction or suicide as a result of your gambling?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 1 / Exercise 2: Powerlessness
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 1 AND e.exercise_number = 2
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'Describe in your own words what it means to be powerless over gambling.'),
  (2, 'Give specific examples from your life where gambling controlled you rather than you controlling it.'),
  (3, 'How did you try to control your gambling in the past? What happened each time?'),
  (4, 'What did you tell yourself to justify continuing to gamble despite the consequences?'),
  (5, 'At what point did you realize - or begin to accept - that you could not stop on your own?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 1 / Exercise 3: Unmanageability
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 1 AND e.exercise_number = 3
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'How did gambling make your financial life unmanageable? Describe specific situations.'),
  (2, 'How did gambling affect your work or career? Give examples.'),
  (3, 'How did gambling damage your relationships with family and friends?'),
  (4, 'What did you do - lies, secrets, or schemes - to hide your gambling or cover your losses?'),
  (5, 'Describe how your emotional and mental health suffered because of your gambling.')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 1 / Exercise 4: Acceptance
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 1 AND e.exercise_number = 4
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'Do you fully accept that you are a compulsive gambler? What does that acceptance feel like?'),
  (2, 'What did it take for you to reach acceptance? Was there a specific moment or event?'),
  (3, 'How does accepting your powerlessness actually give you freedom rather than take it away?'),
  (4, 'What would happen if you tried to gamble again, even just once? Be honest.')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 2 / Exercise 1: Understanding Step 2
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 2 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'Before recovery, what did you rely on to manage your problems and feelings?'),
  (2, 'What does insanity mean in the context of your gambling? Give examples of insane thinking or behavior.'),
  (3, 'What evidence do you have that a Power greater than yourself can help restore you to sanity?'),
  (4, 'What doubts or resistance do you have about Step 2? How can you work through them?'),
  (5, 'How has the GA group already demonstrated a power greater than yourself in your recovery?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 2 / Exercise 2: My Higher Power
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 2 AND e.exercise_number = 2
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'How do you define your Higher Power at this point in your recovery?'),
  (2, 'What qualities do you want your Higher Power to have?'),
  (3, 'How comfortable are you with the spiritual aspects of the program? What concerns you?'),
  (4, 'What would it look like to trust a Higher Power in your daily life?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 3 / Exercise 1: Making the Decision
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 3 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'What does turning your will and your life over mean to you?'),
  (2, 'In what areas of your life have you been trying to control outcomes or other people?'),
  (3, 'What would your life look like if you truly let go of control over others and outcomes?'),
  (4, 'What fears come up when you think about surrendering to a Higher Power?'),
  (5, 'Write the Step 3 prayer in your own words and reflect on what it means to you.')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 3 / Exercise 2: Letting Go
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 3 AND e.exercise_number = 2
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'Describe a situation where letting go of control led to a better outcome than you expected.'),
  (2, 'What people, places, or things are you still trying to control? What would it mean to release them?'),
  (3, 'How has self-will created problems in your life and in your relationships?'),
  (4, 'What actions can you take daily to practice Step 3?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 4 / Exercise 1: Resentments
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 4 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'List the people, institutions, or principles you resent. For each, describe what happened.'),
  (2, 'For each resentment, how were you affected - your self-esteem, finances, relationships, or security?'),
  (3, 'Looking at your resentments, what was your part in each situation?'),
  (4, 'How have resentments kept you trapped and made you feel justified in gambling?'),
  (5, 'What would it take for you to move toward forgiveness in these areas?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 4 / Exercise 2: Fears
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 4 AND e.exercise_number = 2
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'List your fears - financial, relational, social, health, or spiritual.'),
  (2, 'For each fear, why do you have it? What does it reveal about your beliefs or values?'),
  (3, 'How have your fears driven your behavior, including your gambling?'),
  (4, 'How can trusting your Higher Power help you address your fears?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 4 / Exercise 3: Harm to Others
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 4 AND e.exercise_number = 3
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'List the people you have harmed through your gambling. Describe how you harmed each person.'),
  (2, 'What financial harms have you caused to others as a result of your gambling?'),
  (3, 'What emotional or relational harms have you caused to family members or friends?'),
  (4, 'Have you harmed anyone through dishonesty, theft, or broken promises related to gambling?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 5 / Exercise 1: Preparing for Step 5
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 5 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'Who have you chosen to hear your Step 5 and why did you choose this person?'),
  (2, 'What are you most afraid to share? What makes it difficult to admit?'),
  (3, 'What do you hope to get from completing Step 5?'),
  (4, 'How has keeping secrets affected your recovery and your mental health?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 5 / Exercise 2: After Step 5
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 5 AND e.exercise_number = 2
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'How did you feel after completing Step 5? Describe the experience.'),
  (2, 'What did you learn about yourself through sharing your inventory?'),
  (3, 'Is there anything left unsaid that you need to address? How will you do so?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 6 / Exercise 1: Character Defects
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 6 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'List the character defects revealed in your Step 4 inventory.'),
  (2, 'For each defect, how has it protected or served you? Why have you held onto it?'),
  (3, 'How do these character defects harm you and others today?'),
  (4, 'Are you entirely ready to have all these defects removed? If not, which ones do you still hold onto and why?'),
  (5, 'What would your life look like without these character defects?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 7 / Exercise 1: Humility and Shortcomings
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 7 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'What does humility mean to you? How is it different from humiliation?'),
  (2, 'How has pride or arrogance contributed to your gambling and your problems?'),
  (3, 'Write the Step 7 prayer in your own words. What does it mean to ask for shortcomings to be removed?'),
  (4, 'How will you practice humility in your daily life going forward?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 8 / Exercise 1: People I Have Harmed
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 8 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'List all the people you have harmed as a result of your gambling. Include family, friends, employers, and others.'),
  (2, 'For each person, describe specifically how you harmed them.'),
  (3, 'Are there people harmed through indirect consequences of your gambling - stress, financial strain, or your absence?'),
  (4, 'Have you harmed yourself? In what ways?'),
  (5, 'What makes it hardest to acknowledge the harm you have caused?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 8 / Exercise 2: Becoming Willing
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 8 AND e.exercise_number = 2
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'For each person on your list, are you willing to make amends? If not, what holds you back?'),
  (2, 'Are there people you are unwilling to make amends to because of their wrongs toward you? How can you work through this?'),
  (3, 'How does your willingness to make amends reflect your commitment to recovery?'),
  (4, 'What do you hope making amends will accomplish for you and for those you have harmed?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 9 / Exercise 1: Planning Amends
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 9 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'For each person on your amends list, how do you plan to approach them?'),
  (2, 'Are there any amends that could harm the other person or a third party? How will you handle these?'),
  (3, 'For financial amends, what is your realistic plan for repayment?'),
  (4, 'Are there amends that cannot be made directly? What indirect amends can you make?'),
  (5, 'Discuss your amends plan with your sponsor before proceeding. What guidance have you received?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 9 / Exercise 2: After Amends
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 9 AND e.exercise_number = 2
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'Describe the amends you have made. How did each one go?'),
  (2, 'How did making amends affect your relationships and your self-esteem?'),
  (3, 'Are there amends still outstanding? What is your plan for completing them?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 10 / Exercise 1: Daily Inventory
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 10 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'How do you currently practice daily self-examination? Describe your routine.'),
  (2, 'When you notice you have been wrong or harmed someone today, how quickly do you admit it?'),
  (3, 'What character defects appeared in your behavior today? How did you address them?'),
  (4, 'What are you grateful for today? How does gratitude support your recovery?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 11 / Exercise 1: Prayer and Meditation
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 11 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'Do you currently have a practice of prayer or meditation? Describe it.'),
  (2, 'What does conscious contact with your Higher Power mean to you?'),
  (3, 'How do you seek knowledge of your Higher Power''s will for you? What does this look like in practice?'),
  (4, 'How has prayer and meditation supported your recovery and your daily peace of mind?'),
  (5, 'What changes would you like to make to deepen your spiritual practice?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 12 / Exercise 1: The Spiritual Awakening
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 12 AND e.exercise_number = 1
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'Describe the spiritual awakening or change you have experienced as a result of working the Steps.'),
  (2, 'How are you different today than you were before recovery? In attitude, behavior, and relationships?'),
  (3, 'What does living the principles of the program look like in your daily life?'),
  (4, 'How has your relationship with yourself and others changed through this process?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;

-- Step 12 / Exercise 2: Carrying the Message
WITH ex AS (
  SELECT e.id FROM step_exercises e
  JOIN steps s ON s.id = e.step_id
  WHERE s.step_number = 12 AND e.exercise_number = 2
)
INSERT INTO step_questions (exercise_id, sort_order, question_text)
SELECT ex.id, v.n, v.q
FROM ex CROSS JOIN (VALUES
  (1, 'How are you currently carrying the message to other compulsive gamblers?'),
  (2, 'What does service to GA and to other gamblers mean to you personally?'),
  (3, 'How does helping others strengthen your own recovery?'),
  (4, 'What would you say to someone who is new to GA and just beginning their journey?')
) AS v(n, q)
ON CONFLICT (exercise_id, sort_order) DO UPDATE SET question_text = EXCLUDED.question_text;
