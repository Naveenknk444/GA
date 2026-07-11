import { supabase } from '@/lib/supabase';
import { getMondayStr, toDateStr } from './checklist';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskCategory =
  'recovery' | 'finance' | 'health' | 'household' |
  'family'   | 'work'    | 'wellbeing' | 'learning';

export type TaskPriority  = 'normal' | 'high';
export type UserTaskType  = 'daily'  | 'weekly' | 'onetime';

export type UserTask = {
  id:                string;
  user_id:           string;
  label:             string;
  note:              string | null;
  type:              UserTaskType;
  priority:          TaskPriority;
  category:          TaskCategory;
  linked_to_sponsor: boolean;
  target_date:       string | null;
  sort:              number;
  deleted_at:        string | null;
  created_at:        string;
};

export type UserTaskDraft = {
  label:              string;
  note?:              string | null;
  type:               UserTaskType;
  priority:           TaskPriority;
  category:           TaskCategory;
  linked_to_sponsor?: boolean;
  target_date?:       string | null;
};

export type UserTaskGroups = {
  daily:   UserTask[];
  weekly:  UserTask[];
  onetime: UserTask[];
};

export type UserTaskStats = {
  streak:   number;
  total:    number;
  lastDone: string | null;
};

// ─── Fetch active tasks (grouped by type) ─────────────────────────────────────

export async function fetchUserTasks(userId: string): Promise<UserTaskGroups> {
  const { data } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('sort')
    .order('created_at');

  const tasks = (data ?? []) as UserTask[];
  return {
    daily:   tasks.filter(t => t.type === 'daily'),
    weekly:  tasks.filter(t => t.type === 'weekly'),
    onetime: tasks.filter(t => t.type === 'onetime'),
  };
}

// ─── Fetch soft-deleted tasks (for restore section) ───────────────────────────

export async function fetchDeletedUserTasks(userId: string): Promise<UserTask[]> {
  const { data } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', userId)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  return (data ?? []) as UserTask[];
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createUserTask(userId: string, draft: UserTaskDraft): Promise<UserTask> {
  const { data, error } = await supabase
    .from('user_tasks')
    .insert({ user_id: userId, ...draft })
    .select()
    .single();

  if (error) throw error;
  return data as UserTask;
}

export async function updateUserTask(taskId: string, updates: Partial<UserTaskDraft>): Promise<void> {
  await supabase
    .from('user_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId);
}

export async function deleteUserTask(taskId: string): Promise<void> {
  await supabase
    .from('user_tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', taskId);
}

export async function restoreUserTask(taskId: string): Promise<void> {
  await supabase
    .from('user_tasks')
    .update({ deleted_at: null })
    .eq('id', taskId);
}

// ─── Checkins ─────────────────────────────────────────────────────────────────

// Returns the Set of user_task IDs that are "done" for the current period.
export async function fetchUserTaskCheckins(
  userId: string,
  tasks:  UserTask[],
): Promise<Set<string>> {
  if (tasks.length === 0) return new Set();

  const today  = toDateStr(new Date());
  const monday = getMondayStr(new Date());

  const { data } = await supabase
    .from('user_task_checkins')
    .select('user_task_id, completed_date')
    .eq('user_id', userId)
    .in('user_task_id', tasks.map(t => t.id));

  const dailyIds   = new Set(tasks.filter(t => t.type === 'daily').map(t => t.id));
  const weeklyIds  = new Set(tasks.filter(t => t.type === 'weekly').map(t => t.id));
  const onetimeIds = new Set(tasks.filter(t => t.type === 'onetime').map(t => t.id));

  const done = new Set<string>();
  for (const row of data ?? []) {
    if (dailyIds.has(row.user_task_id)   && row.completed_date === today)  done.add(row.user_task_id);
    if (weeklyIds.has(row.user_task_id)  && row.completed_date === monday) done.add(row.user_task_id);
    if (onetimeIds.has(row.user_task_id))                                  done.add(row.user_task_id);
  }

  return done;
}

export async function checkInUserTask(userId: string, task: UserTask): Promise<void> {
  const date = task.type === 'weekly'
    ? getMondayStr(new Date())
    : toDateStr(new Date());

  await supabase
    .from('user_task_checkins')
    .upsert(
      { user_id: userId, user_task_id: task.id, completed_date: date },
      { onConflict: 'user_id,user_task_id,completed_date' },
    );
}

export async function unCheckInUserTask(userId: string, task: UserTask): Promise<void> {
  // onetime tasks don't get un-checked once done
  if (task.type === 'onetime') return;

  const date = task.type === 'weekly' ? getMondayStr(new Date()) : toDateStr(new Date());

  await supabase
    .from('user_task_checkins')
    .delete()
    .eq('user_id', userId)
    .eq('user_task_id', task.id)
    .eq('completed_date', date);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function fetchUserTaskStats(
  userId: string,
  taskId: string,
  type:   UserTaskType,
): Promise<UserTaskStats> {
  const { data } = await supabase
    .from('user_task_checkins')
    .select('completed_date')
    .eq('user_id', userId)
    .eq('user_task_id', taskId)
    .order('completed_date', { ascending: false });

  const rows   = (data ?? []) as { completed_date: string }[];
  const total  = rows.length;
  const lastDone = rows[0]?.completed_date ?? null;

  let streak = 0;

  if (type === 'daily') {
    const dates = new Set(rows.map(r => r.completed_date));
    // Walk back from today; if today not done yet, still count from yesterday
    let d = new Date();
    if (!dates.has(toDateStr(d))) d.setDate(d.getDate() - 1);
    while (streak < 365) {
      if (dates.has(toDateStr(d))) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (type === 'weekly') {
    const weeks = new Set(rows.map(r => getMondayStr(new Date(r.completed_date + 'T00:00:00'))));
    let d = new Date();
    if (!weeks.has(getMondayStr(d))) d.setDate(d.getDate() - 7);
    while (streak < 52) {
      if (weeks.has(getMondayStr(d))) {
        streak++;
        d.setDate(d.getDate() - 7);
      } else {
        break;
      }
    }
  }

  return { streak, total, lastDone };
}
