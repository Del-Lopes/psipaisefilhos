-- ============================================================================
--  Módulo Fitness — plano de treinos de musculação editável pelo webapp.
--
--  O plano inteiro (treinos, exercícios e finalização de abdômen) é guardado
--  como um único JSONB. Não há consulta relacional sobre exercícios — o app
--  sempre lê e grava o plano completo — então uma linha por usuária mantém o
--  código simples e as edições atômicas.
--
--  Enquanto não existir linha, o app usa o plano padrão embutido em
--  gestao/lib/fitness.ts e grava aqui na primeira edição.
--
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- ============================================================================

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
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ============================================================================
--  Fim do módulo Fitness.
-- ============================================================================
