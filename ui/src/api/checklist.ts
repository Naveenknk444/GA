import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────
export type TaskType = 'daily' | 'weekly' | 'onetime';

export type Task = {
  id: string;
  key: string;
  label: string;
  sublabel: string | null;
  type: TaskType;
  sort: number;
};

export type TaskGroups = {
  daily:   Task[];
  weekly:  Task[];
  onetime: Task[];
};

export type CheckinState = {
  daily:   Set<string>;
  weekly:  Set<string>;
  onetime: Set<string>;
};

// ─── Date helpers ─────────────────────────────────────────────────
export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getMondayStr(d: Date): string {
  const day  = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon  = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  return toDateStr(mon);
}

// ─── Fetch tasks from DB ──────────────────────────────────────────
export async function fetchChecklistTasks(): Promise<TaskGroups> {
  const { data } = await supabase
    .from('checklist_tasks')
    .select('id, key, label, sublabel, type, sort')
    .eq('active', true)
    .order('sort');

  const tasks = (data ?? []) as Task[];
  return {
    daily:   tasks.filter(t => t.type === 'daily'),
    weekly:  tasks.filter(t => t.type === 'weekly'),
    onetime: tasks.filter(t => t.type === 'onetime'),
  };
}

// ─── Fetch completion state ───────────────────────────────────────
export async function fetchCheckins(userId: string, groups: TaskGroups): Promise<CheckinState> {
  const today  = toDateStr(new Date());
  const monday = getMondayStr(new Date());

  const dailyKeys  = new Set(groups.daily.map(t => t.key));
  const weeklyKeys = new Set(groups.weekly.map(t => t.key));

  const { data } = await supabase
    .from('daily_checkins')
    .select('task_key, completed_date')
    .eq('user_id', userId);

  const daily   = new Set<string>();
  const weekly  = new Set<string>();
  const onetime = new Set<string>();

  for (const row of data ?? []) {
    if (dailyKeys.has(row.task_key)  && row.completed_date === today)  daily.add(row.task_key);
    if (weeklyKeys.has(row.task_key) && row.completed_date === monday) weekly.add(row.task_key);
    if (!dailyKeys.has(row.task_key) && !weeklyKeys.has(row.task_key)) onetime.add(row.task_key);
  }

  return { daily, weekly, onetime };
}

// ─── Hidden system tasks ──────────────────────────────────────────

export async function fetchHiddenSystemTaskKeys(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('checklist_hidden_system_tasks')
    .select('task_key')
    .eq('user_id', userId);
  return new Set((data ?? []).map((r: any) => r.task_key));
}

export async function hideSystemTask(userId: string, taskKey: string): Promise<void> {
  await supabase
    .from('checklist_hidden_system_tasks')
    .upsert({ user_id: userId, task_key: taskKey }, { onConflict: 'user_id,task_key' });
}

export async function restoreSystemTask(userId: string, taskKey: string): Promise<void> {
  await supabase
    .from('checklist_hidden_system_tasks')
    .delete()
    .eq('user_id', userId)
    .eq('task_key', taskKey);
}

// ─── Toggle a task ────────────────────────────────────────────────
export async function checkIn(userId: string, task: Task): Promise<void> {
  const date =
    task.type === 'weekly' ? getMondayStr(new Date()) : toDateStr(new Date());

  await supabase
    .from('daily_checkins')
    .upsert(
      { user_id: userId, task_key: task.key, completed_date: date },
      { onConflict: 'user_id,task_key,completed_date' },
    );
}

export async function unCheckIn(userId: string, task: Task): Promise<void> {
  const date =
    task.type === 'weekly' ? getMondayStr(new Date()) :
    task.type === 'daily'  ? toDateStr(new Date()) :
    null; // onetime: delete any row for this key

  let q = supabase
    .from('daily_checkins')
    .delete()
    .eq('user_id', userId)
    .eq('task_key', task.key);

  if (date) q = q.eq('completed_date', date);

  await q;
}
