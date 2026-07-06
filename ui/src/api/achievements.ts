import { supabase } from '@/lib/supabase';

export type Achievement = {
  key: string;
  title: string;
  description: string;
  category: 'milestone' | 'activity';
  type: 'automatic' | 'self_reported';
  icon: string;
  color: string;
  sort: number;
};

export type AchievementWithStatus = Achievement & {
  earned: boolean;
  earned_at: string | null;
};

export async function fetchAchievementsWithStatus(userId: string): Promise<AchievementWithStatus[]> {
  const [allRes, earnedRes] = await Promise.all([
    supabase.from('achievements').select('*').order('sort'),
    supabase.from('user_achievements').select('achievement_key, earned_at').eq('user_id', userId),
  ]);
  const all = (allRes.data ?? []) as Achievement[];
  const earnedMap = new Map((earnedRes.data ?? []).map((e: any) => [e.achievement_key, e.earned_at]));
  return all.map(a => ({ ...a, earned: earnedMap.has(a.key), earned_at: earnedMap.get(a.key) ?? null }));
}

export async function earnAchievement(userId: string, key: string, earnedAt?: string): Promise<void> {
  await supabase
    .from('user_achievements')
    .upsert(
      { user_id: userId, achievement_key: key, ...(earnedAt ? { earned_at: earnedAt } : {}) },
      { onConflict: 'user_id,achievement_key' },
    );
}

// Parse YYYY-MM-DD as a local date (avoids UTC-midnight off-by-one)
function localDateFromStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Returns the ISO date string N days after the clean date
export function milestoneDate(cleanDate: string, daysAfter: number): string {
  const [y, m, d] = cleanDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d + daysAfter);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export async function syncAutoAchievements(
  userId: string,
  profile: { clean_date: string | null; gambling_types: string[] | null; quiz_score: number | null; first_name: string | null },
  earnedKeys: Set<string>,
): Promise<string[]> {
  const toEarn: Array<{ key: string; at?: string }> = [];

  if (profile.clean_date) {
    const cleanMs = localDateFromStr(profile.clean_date).getTime();
    const days = Math.floor((Date.now() - cleanMs) / 86400000);

    if (days >= 1   && !earnedKeys.has('1_day_clean'))     toEarn.push({ key: '1_day_clean',     at: milestoneDate(profile.clean_date, 1)   });
    if (days >= 7   && !earnedKeys.has('1_week_clean'))    toEarn.push({ key: '1_week_clean',    at: milestoneDate(profile.clean_date, 7)   });
    if (days >= 30  && !earnedKeys.has('1_month_clean'))   toEarn.push({ key: '1_month_clean',   at: milestoneDate(profile.clean_date, 30)  });
    if (days >= 60  && !earnedKeys.has('2_months_clean'))  toEarn.push({ key: '2_months_clean',  at: milestoneDate(profile.clean_date, 60)  });
    if (days >= 90  && !earnedKeys.has('3_months_clean'))  toEarn.push({ key: '3_months_clean',  at: milestoneDate(profile.clean_date, 90)  });
    if (days >= 180 && !earnedKeys.has('6_months_clean'))  toEarn.push({ key: '6_months_clean',  at: milestoneDate(profile.clean_date, 180) });
    if (days >= 365 && !earnedKeys.has('1_year_clean'))    toEarn.push({ key: '1_year_clean',    at: milestoneDate(profile.clean_date, 365) });
    if (days >= 540 && !earnedKeys.has('18_months_clean')) toEarn.push({ key: '18_months_clean', at: milestoneDate(profile.clean_date, 540) });
  }

  if (profile.first_name && profile.clean_date && !earnedKeys.has('profile_set_up'))
    toEarn.push({ key: 'profile_set_up' });

  if ((profile.gambling_types?.length ?? 0) > 0 && !earnedKeys.has('set_gambling_type'))
    toEarn.push({ key: 'set_gambling_type' });

  if (profile.quiz_score !== null && !earnedKeys.has('completed_20_questions'))
    toEarn.push({ key: 'completed_20_questions' });

  if (!earnedKeys.has('first_post')) {
    const { count } = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId);
    if ((count ?? 0) > 0) toEarn.push({ key: 'first_post' });
  }
  if (!earnedKeys.has('first_reply')) {
    const { count } = await supabase.from('comments').select('id', { count: 'exact', head: true }).eq('author_id', userId);
    if ((count ?? 0) > 0) toEarn.push({ key: 'first_reply' });
  }

  if (toEarn.length > 0) {
    await Promise.all(toEarn.map(({ key, at }) => earnAchievement(userId, key, at)));
  }
  return toEarn.map(e => e.key);
}
