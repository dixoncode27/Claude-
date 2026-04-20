-- ─────────────────────────────────────────────────────────────────────────────
-- TBWR Platform — Phase 2 Schema
-- Parent & Coach Management
-- Run this AFTER phase1 schema (supabase/schema.sql)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Extend leads table ──────────────────────────────────────────────────────
-- Add athlete_id FK for convert-to-athlete workflow

alter table leads add column if not exists athlete_id uuid references athletes(id) on delete set null;

-- ─── Coaches ─────────────────────────────────────────────────────────────────

create table if not exists coaches (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  first_name text not null,
  last_name  text not null,
  email      text not null unique,
  phone      text default '',
  bio        text default '',
  specialties text[] default '{}',
  is_active  boolean default true
);

drop trigger if exists coaches_updated_at on coaches;
create trigger coaches_updated_at
  before update on coaches
  for each row execute procedure update_updated_at_column();

-- ─── Athletes ─────────────────────────────────────────────────────────────────
-- Promoted from leads. A lead becomes an athlete when enrolled.

create table if not exists athletes (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  lead_id uuid references leads(id) on delete set null,

  first_name    text not null,
  last_name     text not null,
  date_of_birth date not null,
  gender        text not null,

  pathway       text not null,
  status        text not null default 'active',
  weight_class  text default '',

  coach_id      uuid references coaches(id) on delete set null,

  emergency_contact_name  text default '',
  emergency_contact_phone text default '',

  constraint athletes_pathway_check check (
    pathway in ('little-champs', 'world-team', 'future-olympians')
  ),
  constraint athletes_status_check check (
    status in ('active', 'inactive', 'on-hold')
  )
);

drop trigger if exists athletes_updated_at on athletes;
create trigger athletes_updated_at
  before update on athletes
  for each row execute procedure update_updated_at_column();

create index if not exists idx_athletes_pathway  on athletes(pathway);
create index if not exists idx_athletes_coach_id on athletes(coach_id);
create index if not exists idx_athletes_status   on athletes(status);

-- ─── Parent Profiles ─────────────────────────────────────────────────────────
-- Linked to Supabase auth.users via user_id

create table if not exists parent_profiles (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  user_id    uuid not null unique references auth.users(id) on delete cascade,
  first_name text not null,
  last_name  text not null,
  email      text not null,
  phone      text default ''
);

drop trigger if exists parent_profiles_updated_at on parent_profiles;
create trigger parent_profiles_updated_at
  before update on parent_profiles
  for each row execute procedure update_updated_at_column();

-- ─── Parent → Athlete (junction) ─────────────────────────────────────────────
-- Supports multiple athletes per parent, multiple parents per athlete

create table if not exists parent_athletes (
  parent_id  uuid not null references parent_profiles(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
  primary key (parent_id, athlete_id)
);

-- ─── Sessions ─────────────────────────────────────────────────────────────────

create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,

  session_date date not null,
  start_time   time not null,
  duration_min integer default 60,
  coach_id     uuid references coaches(id) on delete set null,
  pathway      text,
  session_type text not null default 'practice',
  notes        text default '',

  constraint sessions_type_check check (
    session_type in ('practice', 'evaluation', 'competition', 'private')
  )
);

create index if not exists idx_sessions_date     on sessions(session_date desc);
create index if not exists idx_sessions_coach_id on sessions(coach_id);

-- ─── Attendance ───────────────────────────────────────────────────────────────

create table if not exists attendance (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,

  session_id uuid not null references sessions(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
  status     text not null default 'present',
  notes      text default '',

  unique (session_id, athlete_id),

  constraint attendance_status_check check (
    status in ('present', 'absent', 'excused', 'late')
  )
);

create index if not exists idx_attendance_athlete_id on attendance(athlete_id);
create index if not exists idx_attendance_session_id on attendance(session_id);

-- ─── Coach Notes ──────────────────────────────────────────────────────────────

create table if not exists coach_notes (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  athlete_id uuid not null references athletes(id) on delete cascade,
  coach_id   uuid references coaches(id) on delete set null,
  coach_name text default '',
  note_type  text not null default 'general',
  content    text not null,
  is_visible_to_parent boolean default false,

  constraint coach_notes_type_check check (
    note_type in ('general', 'technique', 'behavior', 'progress', 'goal')
  )
);

drop trigger if exists coach_notes_updated_at on coach_notes;
create trigger coach_notes_updated_at
  before update on coach_notes
  for each row execute procedure update_updated_at_column();

create index if not exists idx_coach_notes_athlete_id on coach_notes(athlete_id);

-- ─── Athlete Tags ─────────────────────────────────────────────────────────────

create table if not exists athlete_tags (
  athlete_id uuid not null references athletes(id) on delete cascade,
  tag        text not null,
  primary key (athlete_id, tag)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table coaches         enable row level security;
alter table athletes        enable row level security;
alter table parent_profiles enable row level security;
alter table parent_athletes enable row level security;
alter table sessions        enable row level security;
alter table attendance      enable row level security;
alter table coach_notes     enable row level security;
alter table athlete_tags    enable row level security;

-- Authenticated users (admins) have full access to all tables
create policy "Admins full access coaches"         on coaches         for all to authenticated using (true) with check (true);
create policy "Admins full access athletes"        on athletes        for all to authenticated using (true) with check (true);
create policy "Admins full access parent_profiles" on parent_profiles for all to authenticated using (true) with check (true);
create policy "Admins full access parent_athletes" on parent_athletes for all to authenticated using (true) with check (true);
create policy "Admins full access sessions"        on sessions        for all to authenticated using (true) with check (true);
create policy "Admins full access attendance"      on attendance      for all to authenticated using (true) with check (true);
create policy "Admins full access coach_notes"     on coach_notes     for all to authenticated using (true) with check (true);
create policy "Admins full access athlete_tags"    on athlete_tags    for all to authenticated using (true) with check (true);

-- Parents can read their own profile
create policy "Parents read own profile" on parent_profiles
  for select using (auth.uid() = user_id);

-- Parents can read athletes linked to them
create policy "Parents read linked athletes" on athletes
  for select using (
    id in (
      select athlete_id from parent_athletes
      where parent_id = (
        select id from parent_profiles where user_id = auth.uid()
      )
    )
  );

-- Parents can read notes marked visible
create policy "Parents read visible notes" on coach_notes
  for select using (
    is_visible_to_parent = true
    and athlete_id in (
      select athlete_id from parent_athletes
      where parent_id = (
        select id from parent_profiles where user_id = auth.uid()
      )
    )
  );

-- Parents can read their own attendance records
create policy "Parents read own attendance" on attendance
  for select using (
    athlete_id in (
      select athlete_id from parent_athletes
      where parent_id = (
        select id from parent_profiles where user_id = auth.uid()
      )
    )
  );

-- Parents can read sessions
create policy "Parents read sessions" on sessions
  for select using (true);
