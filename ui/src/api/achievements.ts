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

export async function earnAchievement(userId: string, key: string): Promise<void> {
  await supabase
    .from('user_achievements')
    .upsert({ user_id: userId, achievement_key: key }, { onConflict: 'user_id,achievement_key' });
}

export async function syncAutoAchievements(
  userId: string,
  profile: { clean_date: string | null; gambling_types: string[] | null; quiz_score: number | null; first_name: string | null },
  earnedKeys: Set<string>,
): Promise<string[]> {
  const toEarn: string[] = [];

  if (profile.clean_date) {
    const days = Math.floor((Date.now() - new Date(profile.clean_date).getTime()) / 86400000);
    if (days >= 1   && !earnedKeys.has('1_day_clean'))    toEarn.push('1_day_clean');
    if (days >= 7   && !earnedKeys.has('1_week_clean'))   toEarn.push('1_week_clean');
    if (days >= 30  && !earnedKeys.has('1_month_clean'))  toEarn.push('1_month_clean');
    if (days >= 90  && !earnedKeys.has('3_months_clean')) toEarn.push('3_months_clean');
    if (days >= 180 && !earnedKeys.has('6_months_clean')) toEarn.push('6_months_clean');
    if (days >= 365 && !earnedKeys.has('1_year_clean'))   toEarn.push('1_year_clean');
  }

  if (profile.first_name && profile.clean_date && !earnedKeys.has('profile_set_up'))
    toEarn.push('profile_set_up');

  if ((profile.gambling_types?.length ?? 0) > 0 && !earnedKeys.has('set_gambling_type'))
    toEarn.push('set_gambling_type');

  if (profile.quiz_score !== null && !earnedKeys.has('completed_20_questions'))
    toEarn.push('completed_20_questions');

  if (!earnedKeys.has('first_post')) {
    const { count } = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId);
    if ((count ?? 0) > 0) toEarn.push('first_post');
  }
  if (!earnedKeys.has('first_reply')) {
    const { count } = await supabase.from('comments').select('id', { count: 'exact', head: true }).eq('author_id', userId);
    if ((count ?? 0) > 0) toEarn.push('first_reply');
  }

  if (toEarn.length > 0) await Promise.all(toEarn.map(k => earnAchievement(userId, k)));
  return toEarn;
}
