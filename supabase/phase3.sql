-- ─────────────────────────────────────────────────────────────────────────────
-- TBWR Platform — Phase 3 Schema
-- Skill Progression & Progress Reports
-- Run this AFTER phase2 schema (supabase/phase2.sql)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Skills (master list) ────────────────────────────────────────────────────

create table if not exists skills (
  id uuid primary key default uuid_generate_v4(),
  category    text not null,
  name        text not null,
  description text default '',
  difficulty  text not null default 'beginner',
  sort_order  integer default 0,

  constraint skills_difficulty_check check (
    difficulty in ('beginner', 'intermediate', 'advanced')
  )
);

-- ─── Athlete Skill Progress ───────────────────────────────────────────────────

create table if not exists athlete_skills (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  athlete_id  uuid not null references athletes(id) on delete cascade,
  skill_id    uuid not null references skills(id)   on delete cascade,
  status      text not null default 'not_started',
  coach_notes text default '',
  achieved_at timestamptz,

  unique (athlete_id, skill_id),

  constraint athlete_skills_status_check check (
    status in ('not_started', 'in_progress', 'achieved')
  )
);

drop trigger if exists athlete_skills_updated_at on athlete_skills;
create trigger athlete_skills_updated_at
  before update on athlete_skills
  for each row execute procedure update_updated_at_column();

create index if not exists idx_athlete_skills_athlete_id on athlete_skills(athlete_id);
create index if not exists idx_athlete_skills_skill_id   on athlete_skills(skill_id);

-- ─── Progress Reports ─────────────────────────────────────────────────────────

create table if not exists progress_reports (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  athlete_id        uuid not null references athletes(id) on delete cascade,
  coach_id          uuid references coaches(id) on delete set null,
  coach_name        text default '',
  period_label      text not null default '',
  summary           text not null default '',
  strengths         text default '',
  areas_to_improve  text default '',
  is_shared_with_parent boolean default false
);

drop trigger if exists progress_reports_updated_at on progress_reports;
create trigger progress_reports_updated_at
  before update on progress_reports
  for each row execute procedure update_updated_at_column();

create index if not exists idx_progress_reports_athlete_id on progress_reports(athlete_id);

-- ─── Seed Skills ─────────────────────────────────────────────────────────────

insert into skills (category, name, description, difficulty, sort_order) values
  -- Stance & Motion
  ('Stance & Motion', 'Athletic stance',    'Proper weight distribution and balance', 'beginner', 1),
  ('Stance & Motion', 'Level changes',      'Changing levels efficiently without losing position', 'beginner', 2),
  ('Stance & Motion', 'Penetration step',   'Drive step to close distance on opponent', 'beginner', 3),
  ('Stance & Motion', 'Circular motion',    'Moving in circles to set up attacks', 'intermediate', 4),
  -- Takedowns
  ('Takedowns', 'Double leg',       'Attack both legs to score a takedown', 'beginner', 10),
  ('Takedowns', 'Single leg',       'Attack one leg and finish to the mat', 'beginner', 11),
  ('Takedowns', 'High crotch',      'Inside leg attack transitioning to takedown', 'intermediate', 12),
  ('Takedowns', 'Fireman''s carry', 'Arm and leg combination takedown', 'intermediate', 13),
  ('Takedowns', 'Ankle pick',       'Low-level attack targeting the ankle', 'intermediate', 14),
  ('Takedowns', 'Duck under',       'Head-level attack using opponent''s grip', 'advanced', 15),
  -- Escapes & Reversals
  ('Escapes & Reversals', 'Stand up escape', 'Get to feet from bottom position', 'beginner', 20),
  ('Escapes & Reversals', 'Sit out turn in', 'Hip-based escape to create space', 'beginner', 21),
  ('Escapes & Reversals', 'Switch',          'Reverse hips to score a reversal', 'intermediate', 22),
  ('Escapes & Reversals', 'Granby roll',     'Roll-based reversal from bottom', 'intermediate', 23),
  ('Escapes & Reversals', 'Peterson roll',   'Shoulder roll reversal', 'advanced', 24),
  -- Pins & Back Points
  ('Pins & Back Points', 'Half nelson',       'Control head and arm to expose back', 'beginner', 30),
  ('Pins & Back Points', 'Cross face cradle', 'Trap leg and head to pin', 'beginner', 31),
  ('Pins & Back Points', 'Tilt series',       'Use tilts to expose the back for points', 'intermediate', 32),
  ('Pins & Back Points', 'Arm bar',           'Hyperextend arm to turn opponent', 'intermediate', 33),
  ('Pins & Back Points', 'Leg cradle',        'Double leg and head cradle combination', 'advanced', 34),
  -- Riding & Control
  ('Riding & Control', 'Basic ride',    'Maintain top control position', 'beginner', 40),
  ('Riding & Control', 'Leg ride',      'Use legs to control bottom wrestler', 'intermediate', 41),
  ('Riding & Control', 'Gut wrench',    'Lift and turn from top position', 'intermediate', 42),
  ('Riding & Control', 'Spiral ride',   'Pressure-based top control', 'advanced', 43),
  -- Defense
  ('Defense', 'Sprawl',           'Counter takedown by driving hips to mat', 'beginner', 50),
  ('Defense', 'Whizzer',          'Overhook counter to single leg attacks', 'intermediate', 51),
  ('Defense', 'Head snap',        'Use head control to off-balance opponent', 'intermediate', 52),
  ('Defense', 'Underhook battle', 'Fight for inside position', 'advanced', 53)
on conflict do nothing;

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table skills          enable row level security;
alter table athlete_skills  enable row level security;
alter table progress_reports enable row level security;

create policy "Skills readable by authenticated"     on skills          for select to authenticated using (true);
create policy "Admins full access athlete_skills"    on athlete_skills  for all    to authenticated using (true) with check (true);
create policy "Admins full access progress_reports"  on progress_reports for all   to authenticated using (true) with check (true);

-- Parents read their linked athletes' skill progress
create policy "Parents read linked athlete skills" on athlete_skills
  for select using (
    athlete_id in (
      select athlete_id from parent_athletes
      where parent_id = (select id from parent_profiles where user_id = auth.uid())
    )
  );

-- Parents read shared progress reports
create policy "Parents read shared reports" on progress_reports
  for select using (
    is_shared_with_parent = true
    and athlete_id in (
      select athlete_id from parent_athletes
      where parent_id = (select id from parent_profiles where user_id = auth.uid())
    )
  );
