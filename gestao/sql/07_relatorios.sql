-- ============================================================================
--  Módulo Relatórios — templates de IA + dados da emitente
--  Depende de 01_pacientes.sql (profiles, set_updated_at).
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- (A) Dados da emitente (psicóloga) para cabeçalho/rodapé do relatório.
--     Estende a tabela profiles que já existe.
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists crp        text,   -- registro no Conselho de Psicologia
  add column if not exists documento  text,   -- CPF ou CNPJ
  add column if not exists telefone   text,
  add column if not exists endereco   text;

-- ----------------------------------------------------------------------------
-- (B) report_templates — instruções (formato) que a IA deve seguir por tipo
-- ----------------------------------------------------------------------------
create table if not exists public.report_templates (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  tipo        text not null,            -- 'sessao' | 'geral'
  nome        text not null,
  instrucoes  text not null,            -- o "treinamento": como a IA deve escrever/estruturar
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
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ============================================================================
--  Fim do módulo Relatórios.
-- ============================================================================
