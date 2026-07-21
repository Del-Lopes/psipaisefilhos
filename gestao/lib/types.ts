export type PatientStatus = 'ativo' | 'inativo' | 'alta';

export interface Patient {
  id: string;
  owner_id: string;
  nome: string;
  data_nascimento: string | null; // ISO date (YYYY-MM-DD)
  sexo: string | null;
  escola: string | null;
  ano_escolar: string | null;
  queixa_inicial: string | null;
  observacoes: string | null;
  drive_url: string | null;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
}

export interface Guardian {
  id: string;
  owner_id: string;
  patient_id: string;
  nome: string;
  parentesco: string | null;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  is_pagante: boolean;
  created_at: string;
  updated_at: string;
}

// Campos editáveis pelo formulário (sem os gerenciados pelo banco).
export type PatientInput = Pick<
  Patient,
  'nome' | 'data_nascimento' | 'sexo' | 'escola' | 'ano_escolar' | 'queixa_inicial' | 'observacoes' | 'drive_url' | 'status'
>;

export type GuardianInput = Pick<
  Guardian,
  'nome' | 'parentesco' | 'telefone' | 'email' | 'cpf' | 'is_pagante'
>;

export type SessionStatus = 'agendada' | 'realizada' | 'faltou' | 'cancelada';

export interface Session {
  id: string;
  owner_id: string;
  patient_id: string;
  inicio: string; // ISO timestamptz
  duracao_min: number;
  status: SessionStatus;
  valor: number | null;
  pago: boolean;
  pago_em: string | null; // ISO date
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

// Sessão com o nome do paciente embutido (join), para exibir na agenda.
export interface SessionWithPatient extends Session {
  patient: Pick<Patient, 'id' | 'nome'> | null;
}

export type SessionInput = Pick<
  Session,
  'patient_id' | 'inicio' | 'duracao_min' | 'status' | 'valor' | 'pago' | 'pago_em' | 'observacoes'
>;

export interface SessionNote {
  session_id: string;
  owner_id: string;
  conteudo: string;
  created_at: string;
  updated_at: string;
}

// --- Evolução visual -------------------------------------------------------

export interface Indicator {
  id: string;
  owner_id: string;
  patient_id: string;
  nome: string;
  escala_min: number;
  escala_max: number;
  cor: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type IndicatorInput = Pick<
  Indicator,
  'nome' | 'escala_min' | 'escala_max' | 'cor' | 'ativo'
>;

export interface IndicatorScore {
  id: string;
  owner_id: string;
  indicator_id: string;
  session_id: string;
  valor: number;
  created_at: string;
}

// Pontuação com a data da sessão embutida (join), para montar a série do gráfico.
export interface IndicatorScorePoint {
  indicator_id: string;
  session_id: string;
  valor: number;
  inicio: string; // data/hora da sessão (ISO)
}

export type GoalStatus = 'em_andamento' | 'atingido' | 'pausado';

export interface Goal {
  id: string;
  owner_id: string;
  patient_id: string;
  titulo: string;
  descricao: string | null;
  status: GoalStatus;
  atingido_em: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export type GoalInput = Pick<
  Goal,
  'titulo' | 'descricao' | 'status' | 'atingido_em' | 'ordem'
>;

export interface AttendanceStats {
  total: number;
  realizadas: number;
  faltas: number;
  canceladas: number;
  agendadas: number;
  percentComparecimento: number; // realizadas / (realizadas + faltas)
  porMes: { mes: string; realizadas: number; faltas: number }[];
}

// --- Relatórios ------------------------------------------------------------

export type ReportType = 'sessao' | 'geral';

export interface ReportTemplate {
  id: string;
  owner_id: string;
  tipo: ReportType;
  nome: string;
  instrucoes: string;
  created_at: string;
  updated_at: string;
}

export type ReportTemplateInput = Pick<ReportTemplate, 'tipo' | 'nome' | 'instrucoes'>;

// Dados da emitente (psicóloga), guardados em profiles.
export interface EmitterProfile {
  id: string;
  nome: string | null;
  crp: string | null;
  documento: string | null;
  telefone: string | null;
  endereco: string | null;
}

export type EmitterInput = Pick<EmitterProfile, 'nome' | 'crp' | 'documento' | 'telefone' | 'endereco'>;

// Objeto de dados enviado à IA / usado para montar o relatório.
export interface ReportPayload {
  tipo: ReportType;
  paciente: {
    nome: string;
    data_nascimento: string | null;
    idade: number | null;
    sexo: string | null;
    escola: string | null;
    ano_escolar: string | null;
    queixa_inicial: string | null;
  };
  responsaveis: { nome: string; parentesco: string | null }[];
  frequencia?: { total: number; realizadas: number; faltas: number; percentComparecimento: number };
  objetivos?: { titulo: string; status: string }[];
  indicadores?: { nome: string; ultimaPontuacao: number | null }[];
  sessao?: { data: string; evolucao: string | null };        // relatório de sessão
  sessoes?: { data: string; status: string; evolucao: string | null }[]; // relatório geral
}
