import { supabase } from './supabase';
import { listSessionsForMonth, summarize } from './finance';
import type { SessionWithPatient } from './types';

export interface DashboardData {
  sessoesHoje: SessionWithPatient[];
  pacientesAtivos: number;
  aReceberMes: number;
  pendentesMes: number;
}

/** Intervalo [hoje 00:00, amanhã 00:00) em horário local. */
function todayRange(): { from: Date; to: Date } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

export async function loadDashboard(): Promise<DashboardData> {
  const { from, to } = todayRange();
  const now = new Date();

  const [hojeRes, ativosRes, mesSessions] = await Promise.all([
    supabase
      .from('sessions')
      .select('*, patient:patients(id, nome)')
      .gte('inicio', from.toISOString())
      .lt('inicio', to.toISOString())
      .order('inicio', { ascending: true }),
    supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ativo'),
    listSessionsForMonth(now.getFullYear(), now.getMonth()),
  ]);

  if (hojeRes.error) throw hojeRes.error;
  if (ativosRes.error) throw ativosRes.error;

  const resumo = summarize(mesSessions);

  return {
    sessoesHoje: hojeRes.data as unknown as SessionWithPatient[],
    pacientesAtivos: ativosRes.count ?? 0,
    aReceberMes: resumo.aReceber,
    pendentesMes: resumo.pendentesCount,
  };
}
