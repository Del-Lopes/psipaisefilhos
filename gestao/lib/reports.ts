import { supabase } from './supabase';
import type {
  ReportTemplate, ReportTemplateInput, ReportType,
  EmitterProfile, EmitterInput, ReportPayload,
} from './types';
import { getPatient, listGuardians } from './patients';
import { listSessionsByPatient } from './sessions';
import { getNote } from './notes';
import { listIndicators, scoresForPatient, listGoals, computeAttendance } from './evolution';
import { calcAge } from './format';

// --- Templates -------------------------------------------------------------

export async function listTemplates(tipo?: ReportType): Promise<ReportTemplate[]> {
  let q = supabase.from('report_templates').select('*').order('created_at', { ascending: true });
  if (tipo) q = q.eq('tipo', tipo);
  const { data, error } = await q;
  if (error) throw error;
  return data as ReportTemplate[];
}

export async function createTemplate(input: ReportTemplateInput): Promise<ReportTemplate> {
  const { data, error } = await supabase.from('report_templates').insert(input).select().single();
  if (error) throw error;
  return data as ReportTemplate;
}

export async function updateTemplate(id: string, input: Partial<ReportTemplateInput>): Promise<ReportTemplate> {
  const { data, error } = await supabase.from('report_templates').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as ReportTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('report_templates').delete().eq('id', id);
  if (error) throw error;
}

// --- Emitente (profile da psicóloga) ---------------------------------------

export async function getEmitter(): Promise<EmitterProfile | null> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, crp, documento, telefone, endereco')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw error;
  return (data as EmitterProfile) ?? null;
}

export async function saveEmitter(input: EmitterInput): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error('Usuário não autenticado.');
  const { error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', uid);
  if (error) throw error;
}

// --- Montagem dos dados do relatório ---------------------------------------

/** Payload de um relatório de sessão específica. */
export async function buildSessionPayload(patientId: string, sessionId: string): Promise<ReportPayload> {
  const [patient, guardians, sessions, note] = await Promise.all([
    getPatient(patientId),
    listGuardians(patientId),
    listSessionsByPatient(patientId),
    getNote(sessionId),
  ]);
  const sessao = sessions.find((s) => s.id === sessionId);
  return {
    tipo: 'sessao',
    paciente: {
      nome: patient.nome,
      data_nascimento: patient.data_nascimento,
      idade: calcAge(patient.data_nascimento),
      sexo: patient.sexo,
      escola: patient.escola,
      ano_escolar: patient.ano_escolar,
      queixa_inicial: patient.queixa_inicial,
    },
    responsaveis: guardians.map((g) => ({ nome: g.nome, parentesco: g.parentesco })),
    sessao: {
      data: sessao?.inicio ?? '',
      evolucao: note?.conteudo ?? null,
    },
  };
}

/** Payload de um relatório geral consolidado do paciente. */
export async function buildGeneralPayload(patientId: string): Promise<ReportPayload> {
  const [patient, guardians, sessions, indicators, scores, goals] = await Promise.all([
    getPatient(patientId),
    listGuardians(patientId),
    listSessionsByPatient(patientId),
    listIndicators(patientId),
    scoresForPatient(patientId),
    listGoals(patientId),
  ]);

  const att = computeAttendance(sessions);

  // Última pontuação por indicador (scores já vêm ordenados por data asc).
  const ultimaPorIndicador = new Map<string, number>();
  for (const s of scores) ultimaPorIndicador.set(s.indicator_id, s.valor);

  // Evoluções das sessões realizadas (busca as notas em paralelo).
  const realizadas = sessions.filter((s) => s.status === 'realizada');
  const notas = await Promise.all(realizadas.map((s) => getNote(s.id)));

  return {
    tipo: 'geral',
    paciente: {
      nome: patient.nome,
      data_nascimento: patient.data_nascimento,
      idade: calcAge(patient.data_nascimento),
      sexo: patient.sexo,
      escola: patient.escola,
      ano_escolar: patient.ano_escolar,
      queixa_inicial: patient.queixa_inicial,
    },
    responsaveis: guardians.map((g) => ({ nome: g.nome, parentesco: g.parentesco })),
    frequencia: {
      total: att.total,
      realizadas: att.realizadas,
      faltas: att.faltas,
      percentComparecimento: att.percentComparecimento,
    },
    objetivos: goals.map((g) => ({ titulo: g.titulo, status: g.status })),
    indicadores: indicators.map((i) => ({
      nome: i.nome,
      ultimaPontuacao: ultimaPorIndicador.get(i.id) ?? null,
    })),
    sessoes: realizadas.map((s, i) => ({
      data: s.inicio,
      status: s.status,
      evolucao: notas[i]?.conteudo ?? null,
    })),
  };
}

// --- Geração via IA (Edge Function) ----------------------------------------

/**
 * Chama a Edge Function 'gerar-relatorio' (Supabase) que fala com o Gemini.
 * A função guarda a chave da IA (secret) — a chave NUNCA fica no front.
 * Retorna o texto-RASCUNHO, que a psicóloga revisa antes de exportar.
 */
export async function generateReportText(
  payload: ReportPayload,
  instrucoes: string
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('gerar-relatorio', {
    body: { tipo: payload.tipo, payload, instrucoes },
  });
  if (error) {
    throw new Error(
      'Não foi possível gerar o texto pela IA. Verifique se a função "gerar-relatorio" está publicada. Detalhe: ' +
        error.message
    );
  }
  return (data as { texto: string }).texto;
}
