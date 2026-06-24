import { supabase } from './supabase';
import type { SessionWithPatient } from './types';

/** Limites [início, fim) de um mês (ano, mês 0-11) em horário local. */
export function monthRange(year: number, month: number): { from: Date; to: Date } {
  const from = new Date(year, month, 1, 0, 0, 0, 0);
  const to = new Date(year, month + 1, 1, 0, 0, 0, 0);
  return { from, to };
}

/** Sessões de um mês, com nome do paciente, ordenadas por data. */
export async function listSessionsForMonth(year: number, month: number): Promise<SessionWithPatient[]> {
  const { from, to } = monthRange(year, month);
  const { data, error } = await supabase
    .from('sessions')
    .select('*, patient:patients(id, nome)')
    .gte('inicio', from.toISOString())
    .lt('inicio', to.toISOString())
    .order('inicio', { ascending: true });
  if (error) throw error;
  return data as unknown as SessionWithPatient[];
}

export interface FinanceSummary {
  recebido: number;   // sessões pagas
  aReceber: number;   // realizadas e não pagas
  previsto: number;   // agendadas futuras (ainda não realizadas), não pagas
  totalSessoes: number;
  pendentesCount: number;
}

/**
 * Resume um conjunto de sessões para visão financeira.
 * - recebido: pago = true
 * - aReceber: status 'realizada' e não pago (dinheiro que ela já prestou e ainda não recebeu)
 * - previsto: status 'agendada' e não pago (entrada futura esperada)
 * Sessões 'cancelada'/'faltou' não entram em valores (faltou pode ser cobrado — ajustável depois).
 */
export function summarize(sessions: SessionWithPatient[]): FinanceSummary {
  let recebido = 0, aReceber = 0, previsto = 0, pendentesCount = 0;
  for (const s of sessions) {
    const v = s.valor ?? 0;
    if (s.pago) {
      recebido += v;
    } else if (s.status === 'realizada') {
      aReceber += v;
      if (v > 0) pendentesCount++;
    } else if (s.status === 'agendada') {
      previsto += v;
    }
  }
  return { recebido, aReceber, previsto, totalSessoes: sessions.length, pendentesCount };
}
