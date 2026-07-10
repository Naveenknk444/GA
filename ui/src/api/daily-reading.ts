import { supabase } from '@/lib/supabase';

export type ReadingContent = {
  reflection: string;
  prayer: string;
  remember: string;
};

export type DailyReading = {
  id: string;
  month: number;
  day: number;
  content: ReadingContent;
};

export async function fetchDailyReading(month: number, day: number): Promise<DailyReading | null> {
  const { data } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('month', month)
    .eq('day', day)
    .maybeSingle();
  return (data as DailyReading) ?? null;
}

export async function markAsRead(userId: string, year: number, month: number, day: number): Promise<void> {
  await supabase
    .from('reading_logs')
    .upsert(
      { user_id: userId, year, month, day },
      { onConflict: 'user_id,year,month,day' },
    );
}

// Returns a Set of "month-day" keys (e.g. "7-9") for read entries in the given year.
export async function fetchReadLog(userId: string, year: number): Promise<Set<string>> {
  const { data } = await supabase
    .from('reading_logs')
    .select('month, day')
    .eq('user_id', userId)
    .eq('year', year);
  return new Set((data ?? []).map((r: any) => `${r.month}-${r.day}`));
}
