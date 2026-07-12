import { supabase } from '@/lib/supabase';

export type ScheduleBlock = {
  id: string;
  user_id: string;
  day: string;
  start_time: string;
  end_time: string;
  task: string;
  color: string | null;
  priority: 'low' | 'medium' | 'high';
  location: string | null;
  reminder_minutes: number | null;
  energy_level: 'low' | 'medium' | 'high' | null;
  recurring: boolean;
  specific_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ScheduleLog = {
  id: string;
  user_id: string;
  block_id: string;
  date: string;
  completed: boolean;
  reflection: string | null;
  notes: string | null;
};

export type BlockWithLog = ScheduleBlock & { log: ScheduleLog | null };

export type BlockDraft = Omit<ScheduleBlock, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'recurring' | 'specific_date'> & {
  recurring?: boolean;
  specific_date?: string | null;
};

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export function todayName(): string {
  return DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── fetch all blocks for one day, joined with today's log ────────────────────
export async function fetchDayBlocks(userId: string, day: string, date: string): Promise<BlockWithLog[]> {
  // Fetch recurring blocks for this day name + one-time blocks for this exact date
  const [{ data: recurring }, { data: oneTime }] = await Promise.all([
    supabase.from('schedule_blocks').select('*').eq('user_id', userId).eq('day', day).eq('recurring', true).order('start_time'),
    supabase.from('schedule_blocks').select('*').eq('user_id', userId).eq('specific_date', date).eq('recurring', false).order('start_time'),
  ]);
  const blocks = [...(recurring ?? []), ...(oneTime ?? [])].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  if (!blocks.length) return [];

  const { data: logs } = await supabase
    .from('schedule_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .in('block_id', blocks.map(b => b.id));

  const logMap = new Map((logs ?? []).map(l => [l.block_id, l]));

  return blocks.map(b => ({ ...b, log: logMap.get(b.id) ?? null }));
}

// ── fetch all blocks for the whole week ─────────────────────────────────────
export async function fetchWeekBlocks(userId: string): Promise<Record<string, ScheduleBlock[]>> {
  const { data } = await supabase
    .from('schedule_blocks')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

  const grouped: Record<string, ScheduleBlock[]> = {};
  for (const block of data ?? []) {
    if (!grouped[block.day]) grouped[block.day] = [];
    grouped[block.day].push(block);
  }
  return grouped;
}

// ── create a new block ───────────────────────────────────────────────────────
export async function createBlock(userId: string, draft: BlockDraft): Promise<ScheduleBlock | null> {
  const { data } = await supabase
    .from('schedule_blocks')
    .insert({ ...draft, user_id: userId })
    .select()
    .single();
  return data;
}

// ── update a block ───────────────────────────────────────────────────────────
export async function updateBlock(id: string, draft: Partial<BlockDraft>): Promise<ScheduleBlock | null> {
  const { data } = await supabase
    .from('schedule_blocks')
    .update({ ...draft, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return data;
}

// ── delete a block ───────────────────────────────────────────────────────────
export async function deleteBlock(id: string): Promise<void> {
  await supabase.from('schedule_blocks').delete().eq('id', id);
}

// ── upsert a log (mark complete / save reflection) ───────────────────────────
export async function upsertLog(
  userId: string,
  blockId: string,
  date: string,
  patch: Partial<Pick<ScheduleLog, 'completed' | 'reflection' | 'notes'>>,
): Promise<ScheduleLog | null> {
  const { data } = await supabase
    .from('schedule_logs')
    .upsert(
      { user_id: userId, block_id: blockId, date, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'block_id,date' },
    )
    .select()
    .single();
  return data;
}
