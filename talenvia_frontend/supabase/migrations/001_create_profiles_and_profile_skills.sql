-- Talenvia: Profiles + Profile Skills schema
-- Deliverable: single SQL script including table creation, RLS, policies, and updated_at triggers.

-- Extensions (gen_random_uuid)
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- updated_at automation
-- ------------------------------------------------------------
create or replace function public.tv_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- profiles: one row per auth user
-- ------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  professional_headline text,
  location text,
  professional_summary text,
  email text,
  phone text,
  portfolio_url text null,
  github_url text null,
  linkedin_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tv_profiles_set_updated_at on public.profiles;
create trigger tv_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.tv_set_updated_at();

alter table public.profiles enable row level security;

-- Policies: profiles (SELECT, INSERT, UPDATE only for owner)
drop policy if exists "Profiles: select own" on public.profiles;
create policy "Profiles: select own"
on public.profiles
for select
using (user_id = auth.uid());

drop policy if exists "Profiles: insert own" on public.profiles;
create policy "Profiles: insert own"
on public.profiles
for insert
with check (user_id = auth.uid());

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
on public.profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- profile_skills: multiple skills per user, unique per (user, skill_name)
-- ------------------------------------------------------------
create table if not exists public.profile_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  proficiency text not null check (proficiency in ('beginner','intermediate','advanced')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_skills_user_skill_unique unique (user_id, skill_name)
);

create index if not exists profile_skills_user_id_idx on public.profile_skills(user_id);

drop trigger if exists tv_profile_skills_set_updated_at on public.profile_skills;
create trigger tv_profile_skills_set_updated_at
before update on public.profile_skills
for each row
execute function public.tv_set_updated_at();

alter table public.profile_skills enable row level security;

-- Policies: profile_skills (SELECT/INSERT/UPDATE/DELETE only for owner)
drop policy if exists "Profile skills: select own" on public.profile_skills;
create policy "Profile skills: select own"
on public.profile_skills
for select
using (user_id = auth.uid());

drop policy if exists "Profile skills: insert own" on public.profile_skills;
create policy "Profile skills: insert own"
on public.profile_skills
for insert
with check (user_id = auth.uid());

drop policy if exists "Profile skills: update own" on public.profile_skills;
create policy "Profile skills: update own"
on public.profile_skills
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Profile skills: delete own" on public.profile_skills;
create policy "Profile skills: delete own"
on public.profile_skills
for delete
using (user_id = auth.uid());
