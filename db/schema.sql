-- ============================================================
-- Recovery Community — database schema (Supabase / Postgres)
-- Run this in the Supabase dashboard → SQL Editor → New query → Run.
-- Safe to re-run: tables use IF NOT EXISTS; meetings is rebuilt; policies
-- are dropped+recreated.
-- ============================================================
--
-- Design notes (how the BRD principles show up here):
--   * Anonymity: profiles have a `handle` and NO name/email/phone/avatar columns.
--   * No popularity systems: there are NO likes/followers/ranking columns.
--   * Security: every table has Row Level Security (RLS). The signed-in user's
--     id (auth.uid(), from the anonymous login) decides what they can write.
-- ============================================================

-- 1. PROFILES — one row per anonymous member ----------------
create table if not exists profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  handle           text not null,           -- e.g. "Member a3f8c2d1"; never a real name
  clean_date       date,                    -- optional; never a dollar amount
  recovery_phrase  text,                    -- optional; user-chosen phrase for account recovery
  created_at       timestamptz not null default now()
);

-- 2. POSTS --------------------------------------------------
do $$ begin
  create type post_category as enum ('discussion', 'support', 'milestone');
exception when duplicate_object then null; end $$;

create table if not exists posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references profiles (id) on delete cascade,
  category   post_category not null default 'discussion',
  title      text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

-- 3. COMMENTS (replies) -------------------------------------
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  author_id  uuid not null references profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

-- 4. MEETINGS (seeded by admin; read-only to members) -------
--    Rebuilt here so the full real-world column set always applies.
drop table if exists meetings cascade;

do $$ begin
  create type meeting_format as enum ('in_person', 'online', 'hybrid', 'telephone');
exception when duplicate_object then null; end $$;

create table meetings (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,                         -- display name for the list/detail
  region           text not null default 'Valley of the Sun',
  day              text not null,                         -- 'Sunday' .. 'Saturday'
  start_time       text not null,                         -- e.g. '7:00 PM'
  end_time         text,                                  -- e.g. '9:00 PM' (nullable)
  type_code        text,                                  -- 'CL' | 'MCL' | 'OP' | 'HYBRID' | 'GAM' | 'COMBINED'
  type_label       text,                                  -- 'Closed' | 'Modified Closed' | 'Open' | 'Gam-Anon' ...
  format           meeting_format not null default 'in_person',
  language         text not null default 'English',       -- 'English' | 'Spanish'
  focus            text,                                  -- 'Topic/Therapy', 'Step Discussion', 'Beginners' ...
  location_name    text,                                  -- 'Desert Cross Lutheran Church'
  address          text,
  city             text,
  state            text default 'AZ',
  zip              text,
  room_notes       text,                                  -- 'Educ Bldg; Rm 1/2; Masks Optional'
  online_url       text,                                  -- Zoom/meeting link
  online_id        text,                                  -- meeting ID
  online_password  text,
  phone_dial_in    text,                                  -- telephone dial-in + access code
  contact_name     text,
  contact_phone    text,
  is_new           boolean not null default false,        -- newly added meeting
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 5. RESOURCES (recovery literature; read-only to members) --
create table if not exists resources (
  id       uuid primary key default gen_random_uuid(),
  category text not null,            -- 'literature' | 'newcomer' | 'gamban' | 'self_exclusion'
  title    text not null,
  summary  text,
  body     text,
  url      text,
  sort     int not null default 0
);

-- ============================================================
-- ROW LEVEL SECURITY  (drop+create so the script re-runs cleanly)
-- ============================================================
alter table profiles  enable row level security;
alter table posts     enable row level security;
alter table comments  enable row level security;
alter table meetings  enable row level security;
alter table resources enable row level security;

-- PROFILES: anyone may read; you may only create/update your own row
drop policy if exists "profiles_read"   on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- POSTS: read all; write only your own
drop policy if exists "posts_read"   on posts;
drop policy if exists "posts_insert" on posts;
drop policy if exists "posts_update" on posts;
drop policy if exists "posts_delete" on posts;
create policy "posts_read"   on posts for select using (true);
create policy "posts_insert" on posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on posts for update using (auth.uid() = author_id);
create policy "posts_delete" on posts for delete using (auth.uid() = author_id);

-- COMMENTS: read all; write only your own
drop policy if exists "comments_read"   on comments;
drop policy if exists "comments_insert" on comments;
drop policy if exists "comments_delete" on comments;
create policy "comments_read"   on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = author_id);
create policy "comments_delete" on comments for delete using (auth.uid() = author_id);

-- MEETINGS & RESOURCES: read-only to everyone (no member writes; seeded by admin)
drop policy if exists "meetings_read"  on meetings;
drop policy if exists "resources_read" on resources;
create policy "meetings_read"  on meetings  for select using (true);
create policy "resources_read" on resources for select using (true);
