-- Daily Readings: July 4–7, 9–10
-- Run in Supabase SQL Editor.
-- Uses dollar-quoting ($refl$, $pray$) to handle apostrophes and em-dashes safely.
-- ON CONFLICT updates content so re-running is safe (including the existing July 9 seed).

-- ─── July 4 ───────────────────────────────────────────────────────────────────
INSERT INTO public.daily_readings (month, day, content)
VALUES (7, 4, jsonb_build_object(
  'reflection', $refl$It's time for me to become willing to do what it takes to recover my personal responsibility, even if that means giving over the financial reins to another. Just as there are paradoxes in the Steps—admitting my life's unmanageability in order that it become manageable again, surrendering to a Higher Power in order to become liberated—there will be other paradoxes in my recovery. Allowing a trusted family member or professional to take over management of my finances in order for me to become fiscally responsible may be one of those paradoxes. I have proved that I am powerless over gambling—and over the emotional highs and lows that went with it. Now is the time to give up my lonely disaster course and begin to interact with others, accepting any help my Higher Power provides.

Have I accepted that, although my recovery is my own, I sometimes need to count on others for their help and encouragement?$refl$,
  'prayer', $pray$May the Gamblers Anonymous Program, with God's help, give me a chance to live a steady, creative, outreaching life. May I accept the strength others offer me, as I willingly share my strength with others. May I realize on this Declaration of Independence Day that I, too, have a celebration of freedom—from my gambling addiction.$pray$,
  'remember', 'To celebrate my personal freedom.'
)) ON CONFLICT (month, day) DO UPDATE SET content = EXCLUDED.content;

-- ─── July 5 ───────────────────────────────────────────────────────────────────
INSERT INTO public.daily_readings (month, day, content)
VALUES (7, 5, jsonb_build_object(
  'reflection', $refl$I am free to be, to do, to accept, to reject. I am free to be the wise, loving, kind, and patient person I want to be. I'm free to do that which I consider wise—that which will in no way harm or hinder another person. I'm free to do that which will lead me into paths of peace and satisfaction. I'm free to decide for or against, to say no and to say yes. I'm free to live life in a productive way and to contribute what I have to give to life.

Am I coming to believe that I am free to be the best self I am able to be?$refl$,
  'prayer', $pray$Let the freedom I am now experiencing continue to flow through my life into productiveness, into the conviction of life's goodness I have always wanted to share. May I accept this freedom with God's blessing—and use it wisely.$pray$,
  'remember', 'Let freedom ring true.'
)) ON CONFLICT (month, day) DO UPDATE SET content = EXCLUDED.content;

-- ─── July 6 ───────────────────────────────────────────────────────────────────
INSERT INTO public.daily_readings (month, day, content)
VALUES (7, 6, jsonb_build_object(
  'reflection', $refl$Some people in the Gamblers Anonymous Program feel that they can't do the things they want to do. They doubt their own ability. But actually, every person has untapped ability. We're children of God, which should give us a strong clue as to the infinite nature of our ability. As spiritual beings, we're unlimited. We may find it easier to accept this as true of some person who shines in a particular field. I may compare my own accomplishments with another's and feel discouraged. But the only comparison I need make or should make is with myself.

Am I a better, more productive person today?$refl$,
  'prayer', $pray$May I realize that I am a child of God. And His loving-parent promise to give me what I need, not what I might want, is His way of teaching me to be what I am, not what I dreamed I should be. As a spiritual being, I can truly become a productive person, perhaps even do some of the things I once felt unable to do without the gambler's grandiosity, which lulled me into false confidence.$pray$,
  'remember', 'To compare me with the old me.'
)) ON CONFLICT (month, day) DO UPDATE SET content = EXCLUDED.content;

-- ─── July 7 ───────────────────────────────────────────────────────────────────
INSERT INTO public.daily_readings (month, day, content)
VALUES (7, 7, jsonb_build_object(
  'reflection', $refl$What wonderful things could happen in my life if I could get rid of my natural impulse to justify my actions. Is honesty so deeply repressed under layers of guilt that I can't release it to understand my motives? Being honest with ourselves isn't easy. It's difficult to search out why I had this or that impulse and, more importantly, why I acted upon it. Nothing makes us feel so vulnerable as to give up the crutch of the alibi, yet my willingness to be vulnerable will go a long way toward helping me grow in the Gamblers Anonymous Program.

Am I becoming more aware that self-deception multiplies my problems?$refl$,
  'prayer', $pray$May God remove my urge to make excuses. Help me face up to the realities that surface when I am honest with myself. Help me to know, as certainly as day follows sunrise, that my difficulties will be lessened if I can only trust God's will.$pray$,
  'remember', $rmbr$I will be willing to do God's will.$rmbr$
)) ON CONFLICT (month, day) DO UPDATE SET content = EXCLUDED.content;

-- ─── July 9 (updates existing seed with real content) ────────────────────────
INSERT INTO public.daily_readings (month, day, content)
VALUES (7, 9, jsonb_build_object(
  'reflection', $refl$Samuel Johnson wrote: … he who hath so little knowledge of human nature as to seek happiness by changing anything other than his own disposition will waste his life in fruitless efforts and multiply the grief he proposes to remove. Today I understand that I am not the evil person I once thought I was, only that I have made mistakes in my lifetime that caused me and those I love much pain and grief. By changing myself today, I can face my unsettled past as a time of learning. I hope that those close to me will learn to respect the healthy choices I am making today, rather than dwelling on all the unhealthy choices I used to make.

Has the Serenity Prayer taught me to spend my efforts on changing only those things I can—namely things about myself?$refl$,
  'prayer', $pray$Help me understand that I must seek the answers to change within myself. May I choose the things that bring me happiness and serenity, and avoid the things that bring me turmoil and grief. If I allow my Higher Power to guide my life, I will be given all that is needed to make the right choices today.$pray$,
  'remember', $rmbr$With God's help, I choose to change myself.$rmbr$
)) ON CONFLICT (month, day) DO UPDATE SET content = EXCLUDED.content;

-- ─── July 10 ──────────────────────────────────────────────────────────────────
INSERT INTO public.daily_readings (month, day, content)
VALUES (7, 10, jsonb_build_object(
  'reflection', $refl$The Gamblers Anonymous Program is a road, not a resting place. Before we came to this Program—and, for some of us, many times afterward—most of us looked for answers to our living problems in religion, philosophy, psychology, in theories of self-control and personal growth. Often these explorations of ours aimed at goals that were precisely what we wanted: freedom, calm, confidence, and joy. But they seldom provided any workable methods for getting there—for how to get from the doldrums of despair we found ourselves in to where we wanted to be.

Do I truly believe that I can find everything that I need and really want through the Twelve Steps?$refl$,
  'prayer', $pray$May I know that, once through the Twelve Steps, I am not on a plane surface. For life is not a flat field, but a slope upward. And those flights of Steps must be taken over and over and remembered. May I be sure that, once I have made them totally familiar to me, they will take me anywhere I want to go.$pray$,
  'remember', 'The Steps are a road, not a resting place.'
)) ON CONFLICT (month, day) DO UPDATE SET content = EXCLUDED.content;
