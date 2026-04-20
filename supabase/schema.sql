-- ─────────────────────────────────────────────────────────────────────────────
-- TBWR Platform — Supabase Schema
-- Phase 1: Athlete Entry & Onboarding
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Leads Table ─────────────────────────────────────────────────────────────
-- Stores every onboarding submission. Becomes an athlete record once enrolled.

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Parent information
  parent_first_name text not null,
  parent_last_name  text not null,
  parent_email      text not null,
  parent_phone      text not null,
  parent_city       text not null,

  -- Athlete information
  athlete_first_name text not null,
  athlete_last_name  text not null,
  athlete_dob        date not null,
  athlete_gender     text not null,

  -- Assessment
  assessment_answers  jsonb not null default '{}',
  route_result        text not null,    -- premium-entry | standard-entry | not-ready
  pathway             text not null,    -- little-champs | world-team | future-olympians
  assessment_score    integer not null default 0,

  -- Availability
  preferred_days      text[] default '{}',
  preferred_time      text default '',
  availability_notes  text default '',

  -- Admin fields
  status              text not null default 'new',
  admin_notes         text default '',
  assigned_coach      text,
  converted_to_athlete boolean default false,

  -- Future: link to athlete profile when Phase 2 is built
  -- athlete_id uuid references athletes(id)
  constraint leads_route_result_check check (
    route_result in ('premium-entry', 'standard-entry', 'not-ready')
  ),
  constraint leads_pathway_check check (
    pathway in ('little-champs', 'world-team', 'future-olympians')
  ),
  constraint leads_status_check check (
    status in ('new', 'contacted', 'scheduled', 'enrolled', 'nurture', 'inactive')
  )
);

-- ─── Updated At Trigger ───────────────────────────────────────────────────────

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at
  before update on leads
  for each row execute procedure update_updated_at_column();

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists idx_leads_status        on leads(status);
create index if not exists idx_leads_route_result  on leads(route_result);
create index if not exists idx_leads_pathway       on leads(pathway);
create index if not exists idx_leads_created_at    on leads(created_at desc);
create index if not exists idx_leads_parent_email  on leads(parent_email);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table leads enable row level security;

-- Public can insert (form submissions) via service role key in API route
-- Admin can read/update — enforce via authenticated Supabase users
-- For Phase 1 the API routes use service_role key directly

-- Allow authenticated admin users full access
create policy "Admins have full access" on leads
  for all
  to authenticated
  using (true)
  with check (true);

-- ─── Future Tables (Phase 2 — do not build yet) ───────────────────────────────
-- athletes        — full athlete profiles, linked to a lead
-- parents         — parent accounts with login
-- coaches         — coach profiles
-- attendance      — session attendance records
-- notes           — coach notes per athlete
-- pathways        — pathway progression milestones (Phase 3)
