-- ============================================================
-- user_tasks  — per-user custom checklist tasks
-- ============================================================
create table if not exists user_tasks (
  id                uuid         primary key default gen_random_uuid(),
  user_id           uuid         not null references auth.users(id) on delete cascade,
  label             text         not null,
  note              text,
  type              text         not null check (type in ('daily','weekly','onetime')) default 'daily',
  priority          text         not null check (priority in ('normal','high'))        default 'normal',
  category          text         not null default 'recovery',
  linked_to_sponsor boolean      not null default false,
  target_date       date,
  sort              integer      not null default 0,
  deleted_at        timestamptz,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

alter table user_tasks enable row level security;

-- Users can only see and modify their own tasks (including soft-deleted ones so restore works)
create policy "user_tasks: own rows only"
  on user_tasks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Fast lookup of active tasks per tab
create index if not exists idx_user_tasks_user_active
  on user_tasks (user_id, type) where deleted_at is null;

-- Fast lookup of deleted tasks for restore screen
create index if not exists idx_user_tasks_user_deleted
  on user_tasks (user_id, deleted_at desc) where deleted_at is not null;

-- ============================================================
-- user_task_checkins  — completion log for user_tasks
-- ============================================================
create table if not exists user_task_checkins (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id)  on delete cascade,
  user_task_id   uuid        not null references user_tasks(id)  on delete cascade,
  completed_date date        not null,
  created_at     timestamptz not null default now(),

  -- one check-in per task per day (daily=today, weekly=monday, onetime=first day)
  unique (user_id, user_task_id, completed_date)
);

alter table user_task_checkins enable row level security;

create policy "user_task_checkins: own rows only"
  on user_task_checkins for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_task_checkins_user
  on user_task_checkins (user_id);
create index if not exists idx_user_task_checkins_task
  on user_task_checkins (user_task_id);
-- Useful for streak / "last done" queries
create index if not exists idx_user_task_checkins_task_date
  on user_task_checkins (user_task_id, completed_date desc);
