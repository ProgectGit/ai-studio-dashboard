create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  status text not null default 'idea' check (status in ('idea', 'active', 'testing', 'released', 'paused', 'archived')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text default '',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'todo',
  completed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.project_databases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  database_type text not null,
  description text default ''
);

create table if not exists public.project_ai_modules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  module_type text not null,
  description text default ''
);

create table if not exists public.project_tech_stack (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tech_name text not null
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_project_tasks_updated_at on public.project_tasks;
create trigger set_project_tasks_updated_at
before update on public.project_tasks
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_databases enable row level security;
alter table public.project_ai_modules enable row level security;
alter table public.project_tech_stack enable row level security;

drop policy if exists "Public MVP access to projects" on public.projects;
create policy "Public MVP access to projects"
on public.projects for all
using (true)
with check (true);

drop policy if exists "Public MVP access to tasks" on public.project_tasks;
create policy "Public MVP access to tasks"
on public.project_tasks for all
using (true)
with check (true);

drop policy if exists "Public MVP access to databases" on public.project_databases;
create policy "Public MVP access to databases"
on public.project_databases for all
using (true)
with check (true);

drop policy if exists "Public MVP access to ai modules" on public.project_ai_modules;
create policy "Public MVP access to ai modules"
on public.project_ai_modules for all
using (true)
with check (true);

drop policy if exists "Public MVP access to tech stack" on public.project_tech_stack;
create policy "Public MVP access to tech stack"
on public.project_tech_stack for all
using (true)
with check (true);
