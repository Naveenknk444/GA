-- ── schedule_blocks: weekly recurring template ────────────────────────────────
create table if not exists public.schedule_blocks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  day              text not null check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  start_time       time not null,
  end_time         time not null,
  task             text not null,
  color            text,
  priority         text not null default 'medium' check (priority in ('low','medium','high')),
  location         text,
  reminder_minutes integer,
  energy_level     text check (energy_level in ('low','medium','high')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── schedule_logs: per-date completion + reflection ───────────────────────────
create table if not exists public.schedule_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  block_id    uuid not null references public.schedule_blocks(id) on delete cascade,
  date        date not null,
  completed   boolean not null default false,
  reflection  text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (block_id, date)
);

-- ── indexes ───────────────────────────────────────────────────────────────────
create index if not exists schedule_blocks_user_day  on public.schedule_blocks(user_id, day);
create index if not exists schedule_logs_user_date   on public.schedule_logs(user_id, date);
create index if not exists schedule_logs_block_date  on public.schedule_logs(block_id, date);

-- ── RLS: schedule_blocks ──────────────────────────────────────────────────────
alter table public.schedule_blocks enable row level security;

create policy "owner can select blocks"
  on public.schedule_blocks for select
  using (auth.uid() = user_id);

create policy "owner can insert blocks"
  on public.schedule_blocks for insert
  with check (auth.uid() = user_id);

create policy "owner can update blocks"
  on public.schedule_blocks for update
  using (auth.uid() = user_id);

create policy "owner can delete blocks"
  on public.schedule_blocks for delete
  using (auth.uid() = user_id);

-- ── RLS: schedule_logs ────────────────────────────────────────────────────────
alter table public.schedule_logs enable row level security;

create policy "owner can select logs"
  on public.schedule_logs for select
  using (auth.uid() = user_id);

create policy "owner can insert logs"
  on public.schedule_logs for insert
  with check (auth.uid() = user_id);

create policy "owner can update logs"
  on public.schedule_logs for update
  using (auth.uid() = user_id);

create policy "owner can delete logs"
  on public.schedule_logs for delete
  using (auth.uid() = user_id);
