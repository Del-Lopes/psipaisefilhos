-- ============================================================================
--  SETUP COMPLETO — Sistema de Gestão de Consultório (single-user)
--  ---------------------------------------------------------------------------
--  Rode ESTE arquivo sozinho num projeto Supabase NOVO e vazio para criar
--  todo o banco de uma vez (equivale a rodar 01→05 na ordem).
--  Idempotente: pode rodar de novo sem quebrar (usa IF NOT EXISTS / OR REPLACE).
--
--  Como usar: Supabase > SQL Editor > New query > colar TUDO > Run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Helper: updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 1. profiles — registra os usuários do sistema (hoje: só a psicóloga)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text,
  created_at  timestamptz not null default now()
);

-- Dados da emitente (para relatórios).
alter table public.profiles
  add column if not exists crp        text,
  add column if not exists documento  text,
  add column if not exists telefone   text,
  add column if not exists endereco   text;

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- Cria o profile assim que um usuário é criado no Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. patients — a criança (paciente)
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.patient_status as enum ('ativo', 'inativo', 'alta');
exception when duplicate_object then null; end $$;

create table if not exists public.patients (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users (id) on delete cascade default auth.uid(),
  nome            text not null,
  data_nascimento date,
  sexo            text,
  escola          text,
  ano_escolar     text,
  queixa_inicial  text,
  observacoes     text,
  drive_url       text,                          -- link pasta Google Drive (módulo Documentos)
  status          public.patient_status not null default 'ativo',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists patients_owner_idx  on public.patients (owner_id);
create index if not exists patients_nome_idx   on public.patients (lower(nome));
create index if not exists patients_status_idx on public.patients (status);

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

alter table public.patients enable row level security;

drop policy if exists "patients_owner_all" on public.patients;
create policy "patients_owner_all" on public.patients
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 3. guardians — responsáveis pela criança (mãe/pai/tutor)
-- ----------------------------------------------------------------------------
create table if not exists public.guardians (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id   uuid not null references public.patients (id) on delete cascade,
  nome         text not null,
  parentesco   text,
  telefone     text,
  email        text,
  cpf          text,
  is_pagante   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists guardians_patient_idx on public.guardians (patient_id);
create index if not exists guardians_owner_idx   on public.guardians (owner_id);

drop trigger if exists guardians_set_updated_at on public.guardians;
create trigger guardians_set_updated_at
  before update on public.guardians
  for each row execute function public.set_updated_at();

alter table public.guardians enable row level security;

drop policy if exists "guardians_owner_all" on public.guardians;
create policy "guardians_owner_all" on public.guardians
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 4. sessions — sessões/consultas (Agenda + Financeiro)
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.session_status as enum ('agendada', 'realizada', 'faltou', 'cancelada');
exception when duplicate_object then null; end $$;

create table if not exists public.sessions (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id    uuid not null references public.patients (id) on delete cascade,
  inicio        timestamptz not null,
  duracao_min   integer not null default 50,
  status        public.session_status not null default 'agendada',
  valor         numeric(10,2),
  pago          boolean not null default false,  -- controle financeiro
  pago_em       date,
  observacoes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists sessions_owner_idx   on public.sessions (owner_id);
create index if not exists sessions_patient_idx on public.sessions (patient_id);
create index if not exists sessions_inicio_idx  on public.sessions (inicio);
create index if not exists sessions_pago_idx    on public.sessions (pago);

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

alter table public.sessions enable row level security;

drop policy if exists "sessions_owner_all" on public.sessions;
create policy "sessions_owner_all" on public.sessions
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 5. session_notes — evolução clínica por sessão (dado SENSÍVEL, CFP)
-- ----------------------------------------------------------------------------
create table if not exists public.session_notes (
  session_id   uuid primary key references public.sessions (id) on delete cascade,
  owner_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  conteudo     text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists session_notes_owner_idx on public.session_notes (owner_id);

drop trigger if exists session_notes_set_updated_at on public.session_notes;
create trigger session_notes_set_updated_at
  before update on public.session_notes
  for each row execute function public.set_updated_at();

alter table public.session_notes enable row level security;

drop policy if exists "session_notes_owner_all" on public.session_notes;
create policy "session_notes_owner_all" on public.session_notes
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 6. indicators / indicator_scores / goals — Evolução Visual
-- ----------------------------------------------------------------------------
create table if not exists public.indicators (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id  uuid not null references public.patients (id) on delete cascade,
  nome        text not null,
  escala_min  integer not null default 0,
  escala_max  integer not null default 10,
  cor         text,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists indicators_patient_idx on public.indicators (patient_id);
create index if not exists indicators_owner_idx   on public.indicators (owner_id);
drop trigger if exists indicators_set_updated_at on public.indicators;
create trigger indicators_set_updated_at
  before update on public.indicators
  for each row execute function public.set_updated_at();
alter table public.indicators enable row level security;
drop policy if exists "indicators_owner_all" on public.indicators;
create policy "indicators_owner_all" on public.indicators
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create table if not exists public.indicator_scores (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  indicator_id  uuid not null references public.indicators (id) on delete cascade,
  session_id    uuid not null references public.sessions (id) on delete cascade,
  valor         numeric(5,2) not null,
  created_at    timestamptz not null default now(),
  unique (indicator_id, session_id)
);
create index if not exists indicator_scores_indicator_idx on public.indicator_scores (indicator_id);
create index if not exists indicator_scores_session_idx   on public.indicator_scores (session_id);
create index if not exists indicator_scores_owner_idx     on public.indicator_scores (owner_id);
alter table public.indicator_scores enable row level security;
drop policy if exists "indicator_scores_owner_all" on public.indicator_scores;
create policy "indicator_scores_owner_all" on public.indicator_scores
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

do $$ begin
  create type public.goal_status as enum ('em_andamento', 'atingido', 'pausado');
exception when duplicate_object then null; end $$;

create table if not exists public.goals (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id    uuid not null references public.patients (id) on delete cascade,
  titulo        text not null,
  descricao     text,
  status        public.goal_status not null default 'em_andamento',
  atingido_em   date,
  ordem         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists goals_patient_idx on public.goals (patient_id);
create index if not exists goals_owner_idx   on public.goals (owner_id);
drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();
alter table public.goals enable row level security;
drop policy if exists "goals_owner_all" on public.goals;
create policy "goals_owner_all" on public.goals
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 7. report_templates — templates de IA para relatórios
-- ----------------------------------------------------------------------------
create table if not exists public.report_templates (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  tipo        text not null,
  nome        text not null,
  instrucoes  text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists report_templates_owner_idx on public.report_templates (owner_id);
create index if not exists report_templates_tipo_idx  on public.report_templates (tipo);
drop trigger if exists report_templates_set_updated_at on public.report_templates;
create trigger report_templates_set_updated_at
  before update on public.report_templates
  for each row execute function public.set_updated_at();
alter table public.report_templates enable row level security;
drop policy if exists "report_templates_owner_all" on public.report_templates;
create policy "report_templates_owner_all" on public.report_templates
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 8. reports — relatórios gerados e salvos (para reabrir/exportar depois)
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id  uuid not null references public.patients (id) on delete cascade,
  session_id  uuid references public.sessions (id) on delete set null,
  tipo        text not null,
  titulo      text not null,
  conteudo    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists reports_patient_idx on public.reports (patient_id);
create index if not exists reports_owner_idx   on public.reports (owner_id);
drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();
alter table public.reports enable row level security;
drop policy if exists "reports_owner_all" on public.reports;
create policy "reports_owner_all" on public.reports
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 9. fitness_planos — plano de treinos de musculação (1 linha por usuária)
-- ----------------------------------------------------------------------------
create table if not exists public.fitness_planos (
  owner_id     uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  treinos      jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists fitness_planos_set_updated_at on public.fitness_planos;
create trigger fitness_planos_set_updated_at
  before update on public.fitness_planos
  for each row execute function public.set_updated_at();
alter table public.fitness_planos enable row level security;
drop policy if exists "fitness_planos_owner_all" on public.fitness_planos;
create policy "fitness_planos_owner_all" on public.fitness_planos
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ============================================================================
--  FIM. Banco pronto. Agora crie o usuário da psicóloga em
--  Authentication > Users > Add user (marque Auto Confirm).
-- ============================================================================
