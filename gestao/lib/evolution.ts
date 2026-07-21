import { supabase } from './supabase';
import type {
  Indicator, IndicatorInput, IndicatorScorePoint,
  Goal, GoalInput, GoalStatus, AttendanceStats, Session,
} from './types';

// --- Indicadores -----------------------------------------------------------

export async function listIndicators(patientId: string): Promise<Indicator[]> {
  const { data, error } = await supabase
    .from('indicators')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Indicator[];
}

export async function createIndicator(patientId: string, input: IndicatorInput): Promise<Indicator> {
  const { data, error } = await supabase
    .from('indicators')
    .insert({ ...input, patient_id: patientId })
    .select()
    .single();
  if (error) throw error;
  return data as Indicator;
}

export async function updateIndicator(id: string, input: Partial<IndicatorInput>): Promise<Indicator> {
  const { data, error } = await supabase
    .from('indicators')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Indicator;
}

export async function deleteIndicator(id: string): Promise<void> {
  const { error } = await supabase.from('indicators').delete().eq('id', id);
  if (error) throw error;
}

// --- Pontuações (série do gráfico) -----------------------------------------

/**
 * Todas as pontuações dos indicadores de um paciente, com a data da sessão.
 * Faz join indicator_scores -> sessions(inicio) e filtra pelos indicadores do paciente.
 */
export async function scoresForPatient(patientId: string): Promise<IndicatorScorePoint[]> {
  // Primeiro os ids dos indicadores do paciente.
  const { data: inds, error: e1 } = await supabase
    .from('indicators')
    .select('id')
    .eq('patient_id', patientId);
  if (e1) throw e1;
  const ids = (inds as { id: string }[]).map((i) => i.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('indicator_scores')
    .select('indicator_id, session_id, valor, session:sessions(inicio)')
    .in('indicator_id', ids);
  if (error) throw error;

  return (data as unknown as {
    indicator_id: string; session_id: string; valor: number;
    session: { inicio: string } | null;
  }[])
    .filter((r) => r.session?.inicio)
    .map((r) => ({
      indicator_id: r.indicator_id,
      session_id: r.session_id,
      valor: Number(r.valor),
      inicio: r.session!.inicio,
    }))
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

/** Pontuações de uma sessão específica (para o formulário de pontuar na sessão). */
export async function scoresForSession(sessionId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('indicator_scores')
    .select('indicator_id, valor')
    .eq('session_id', sessionId);
  if (error) throw error;
  const map: Record<string, number> = {};
  for (const r of data as { indicator_id: string; valor: number }[]) {
    map[r.indicator_id] = Number(r.valor);
  }
  return map;
}

/** Cria/atualiza a nota de um indicador numa sessão (upsert por indicator_id+session_id). */
export async function saveScore(indicatorId: string, sessionId: string, valor: number): Promise<void> {
  const { error } = await supabase
    .from('indicator_scores')
    .upsert(
      { indicator_id: indicatorId, session_id: sessionId, valor },
      { onConflict: 'indicator_id,session_id' }
    );
  if (error) throw error;
}

export async function deleteScore(indicatorId: string, sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('indicator_scores')
    .delete()
    .eq('indicator_id', indicatorId)
    .eq('session_id', sessionId);
  if (error) throw error;
}

// --- Objetivos/Marcos ------------------------------------------------------

export async function listGoals(patientId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('patient_id', patientId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Goal[];
}

export async function createGoal(patientId: string, input: GoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...input, patient_id: patientId })
    .select()
    .single();
  if (error) throw error;
  return data as Goal;
}

export async function updateGoal(id: string, input: Partial<GoalInput>): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Goal;
}

/** Muda o status de um objetivo; ao atingir, registra a data (hoje). */
export async function setGoalStatus(id: string, status: GoalStatus): Promise<Goal> {
  const atingido_em = status === 'atingido' ? new Date().toISOString().slice(0, 10) : null;
  return updateGoal(id, { status, atingido_em });
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

// --- Frequência/assiduidade ------------------------------------------------

/** Estatísticas de comparecimento a partir das sessões do paciente. */
export function computeAttendance(sessions: Session[]): AttendanceStats {
  let realizadas = 0, faltas = 0, canceladas = 0, agendadas = 0;
  const meses = new Map<string, { realizadas: number; faltas: number }>();

  for (const s of sessions) {
    if (s.status === 'realizada') realizadas++;
    else if (s.status === 'faltou') faltas++;
    else if (s.status === 'cancelada') canceladas++;
    else if (s.status === 'agendada') agendadas++;

    if (s.status === 'realizada' || s.status === 'faltou') {
      const mes = s.inicio.slice(0, 7); // YYYY-MM
      const cur = meses.get(mes) ?? { realizadas: 0, faltas: 0 };
      if (s.status === 'realizada') cur.realizadas++;
      else cur.faltas++;
      meses.set(mes, cur);
    }
  }

  const base = realizadas + faltas;
  const percentComparecimento = base === 0 ? 0 : Math.round((realizadas / base) * 100);

  const porMes = Array.from(meses.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mes, v]) => ({ mes, ...v }));

  return {
    total: sessions.length,
    realizadas, faltas, canceladas, agendadas,
    percentComparecimento, porMes,
  };
}
