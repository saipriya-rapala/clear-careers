-- Clear Careers initial schema
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.clusters (
  id bigserial primary key,
  cluster_id text not null unique,
  cluster_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.careers (
  id bigserial primary key,
  career_no int,
  career_name text not null,
  cluster_id text not null references public.clusters(cluster_id) on update cascade,
  one_line_summary text,
  what_they_do text,
  industries text,
  entry_salary_lpa text,
  mid_salary_lpa text,
  senior_salary_lpa text,
  top_earnings_lpa text,
  demand_level text,
  growth_rate text,
  ai_impact text,
  core_skills text,
  key_certifications text,
  degree_required text,
  work_life_balance text,
  stress_level text,
  entry_path text,
  who_should_choose text,
  who_should_avoid text,
  verdict text,
  money_score int,
  growth_score int,
  stability_score int,
  created_at timestamptz not null default now()
);

create index if not exists careers_cluster_id_idx on public.careers(cluster_id);
create index if not exists careers_name_idx on public.careers(career_name);

create table if not exists public.applications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  career_id bigint not null references public.careers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, career_id)
);

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_career_id_idx on public.applications(career_id);

alter table public.clusters enable row level security;
alter table public.careers enable row level security;
alter table public.applications enable row level security;

-- Public read access for exploration UI
create policy if not exists "clusters readable by everyone"
  on public.clusters
  for select
  using (true);

create policy if not exists "careers readable by everyone"
  on public.careers
  for select
  using (true);

-- Applications are private per authenticated user
create policy if not exists "users can read own applications"
  on public.applications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy if not exists "users can insert own applications"
  on public.applications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- CSV import notes:
-- 1) Import ClusterSummary.csv into public.clusters with columns:
--    cluster_id, cluster_name
-- 2) Import Careers.csv into public.careers with mapping:
--    "No." -> career_no
--    "Career Name" -> career_name
--    "Cluster" -> cluster_id
--    "One-Line Summary" -> one_line_summary
--    "What They Do" -> what_they_do
--    "Industries" -> industries
--    "Entry Salary (LPA)" -> entry_salary_lpa
--    "Mid Salary (LPA)" -> mid_salary_lpa
--    "Senior Salary (LPA)" -> senior_salary_lpa
--    "Top Earnings (LPA)" -> top_earnings_lpa
--    "Demand Level" -> demand_level
--    "Growth Rate" -> growth_rate
--    "AI Impact" -> ai_impact
--    "Core Skills" -> core_skills
--    "Key Certifications" -> key_certifications
--    "Degree Required" -> degree_required
--    "Work-Life Balance" -> work_life_balance
--    "Stress Level" -> stress_level
--    "Entry Path" -> entry_path
--    "Who Should Choose" -> who_should_choose
--    "Who Should Avoid" -> who_should_avoid
--    "Verdict" -> verdict
--    "Money Score" -> money_score
--    "Growth Score" -> growth_score
--    "Stability Score" -> stability_score
