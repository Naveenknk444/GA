import { supabase } from '@/lib/supabase';

// ─── Task definitions ─────────────────────────────────────────────
export type TaskType = 'daily' | 'weekly' | 'onetime';

export type Task = {
  key: string;
  label: string;
  sublabel?: string;
  type: TaskType;
};

export const DAILY_TASKS: Task[] = [
  { key: 'no_gambling',     label: 'Stayed away from gambling',    sublabel: 'One day at a time',          type: 'daily' },
  { key: 'called_member',   label: 'Called or texted a GA member', sublabel: 'Use the telephone list',     type: 'daily' },
  { key: 'read_recovery',   label: 'Read recovery material',       sublabel: 'Daily reading or GA steps',  type: 'daily' },
  { key: 'one_day_at_time', label: 'Lived one day at a time',      sublabel: 'Easy does it',               type: 'daily' },
];

export const WEEKLY_TASKS: Task[] = [
  { key: 'attended_meeting', label: 'Attended a GA meeting',      sublabel: 'Meetings make it',            type: 'weekly' },
  { key: 'sponsor_contact',  label: 'Connected with my sponsor',  sublabel: 'Get a sponsor if you need one', type: 'weekly' },
];

export const ONETIME_TASKS: Task[] = [
  { key: 'found_sponsor',    label: 'Found a sponsor',                         sublabel: 'Difficult to recover alone',        type: 'onetime' },
  { key: 'scheduled_prg',   label: 'Scheduled a Pressure Relief Group',        sublabel: 'Financial & personal pressure relief', type: 'onetime' },
  { key: 'joined_home_group', label: 'Joined a home group',                    sublabel: 'Get involved and be of service',    type: 'onetime' },
  { key: 'completed_20q',   label: 'Completed the 20 Questions',               sublabel: 'Available in the Recovery tab',     type: 'onetime' },
];

const DAILY_KEYS  = new Set(DAILY_TASKS.map(t => t.key));
const WEEKLY_KEYS = new Set(WEEKLY_TASKS.map(t => t.key));

// ─── Date helpers ──────────────────────────────────────────────────
export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Returns the Monday of the given date's week (YYYY-MM-DD)
export function getMondayStr(d: Date): string {
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  return toDateStr(monday);
}

// ─── API ──────────────────────────────────────────────────────────
export type CheckinState = {
  daily:   Set<string>;
  weekly:  Set<string>;
  onetime: Set<string>;
};

export async function fetchCheckins(userId: string): Promise<CheckinState> {
  const today    = toDateStr(new Date());
  const monday   = getMondayStr(new Date());

  const { data } = await supabase
    .from('daily_checkins')
    .select('task_key, completed_date')
    .eq('user_id', userId);

  const daily   = new Set<string>();
  const weekly  = new Set<string>();
  const onetime = new Set<string>();

  for (const row of data ?? []) {
    if (DAILY_KEYS.has(row.task_key)  && row.completed_date === today)  daily.add(row.task_key);
    if (WEEKLY_KEYS.has(row.task_key) && row.completed_date === monday)  weekly.add(row.task_key);
    if (!DAILY_KEYS.has(row.task_key) && !WEEKLY_KEYS.has(row.task_key)) onetime.add(row.task_key);
  }

  return { daily, weekly, onetime };
}

export async function checkIn(userId: string, task: Task): Promise<void> {
  const date =
    task.type === 'daily'  ? toDateStr(new Date()) :
    task.type === 'weekly' ? getMondayStr(new Date()) :
    toDateStr(new Date());

  await supabase
    .from('daily_checkins')
    .upsert(
      { user_id: userId, task_key: task.key, completed_date: date },
      { onConflict: 'user_id,task_key,completed_date' },
    );
}

export async function unCheckIn(userId: string, task: Task): Promise<void> {
  const date =
    task.type === 'daily'  ? toDateStr(new Date()) :
    task.type === 'weekly' ? getMondayStr(new Date()) :
    null;

  let q = supabase
    .from('daily_checkins')
    .delete()
    .eq('user_id', userId)
    .eq('task_key', task.key);

  if (date) q = q.eq('completed_date', date);

  await q;
}
