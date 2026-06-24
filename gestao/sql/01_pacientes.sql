-- ============================================================================
--  Módulo Pacientes — schema + RLS
--  Sistema de gestão de consultório (single-user: a psicóloga)
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
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
--    Criado automaticamente quando um usuário é adicionado no Auth.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuário só enxerga/edita o próprio profile.
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
  sexo            text,                       -- 'F' | 'M' | 'outro' | null
  escola          text,
  ano_escolar     text,
  queixa_inicial  text,                        -- motivo da procura
  observacoes     text,
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

-- A psicóloga (qualquer usuário autenticado deste sistema single-user) acessa
-- apenas os próprios registros (owner_id = ela).
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
  parentesco   text,                            -- 'mãe' | 'pai' | 'avó' | ...
  telefone     text,
  email        text,
  cpf          text,                            -- útil para recibo/nota
  is_pagante   boolean not null default false,  -- responsável financeiro
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

-- ============================================================================
--  Fim do módulo Pacientes.
-- ============================================================================
