import { supabase } from './supabase';

/**
 * Treinos de musculação — distribuição FULL BODY em 5 dias (A, B, C, D, E).
 *
 * Por que full body: cada sessão tem membro inferior + empurrar + puxar.
 * Se um dia for perdido, basta puxar o próximo treino da fila — nenhum padrão
 * de movimento fica sem estímulo na semana e o desempenho do mês não sofre.
 *
 * Formato: 4 exercícios por dia + finalização de abdômen, com estímulo de core
 * diferente em cada treino (anti-extensão, infra, anti-rotação, flexão
 * resistida e anti-flexão lateral).
 *
 * Perfil: intermediário · academia completa · 35–45 min por sessão.
 * Dados estáticos (sem banco). O progresso da sessão e as cargas ficam no
 * localStorage do dispositivo — ver `fitnessStorage` no fim do arquivo.
 */

export type Padrao =
  | 'Joelho'
  | 'Quadril'
  | 'Empurrar horizontal'
  | 'Empurrar vertical'
  | 'Puxar horizontal'
  | 'Puxar vertical'
  | 'Acessório'
  | 'Core';

/** Opções do seletor de padrão de movimento no editor de treinos. */
export const PADROES: Padrao[] = [
  'Joelho',
  'Quadril',
  'Empurrar horizontal',
  'Empurrar vertical',
  'Puxar horizontal',
  'Puxar vertical',
  'Acessório',
  'Core',
];

export interface Exercicio {
  id: string;
  nome: string;
  padrao: Padrao;
  series: number;
  reps: string;
  /** Descanso em segundos — usado também pelo cronômetro da página. */
  descanso: number;
  /** Reps in reserve: quantas repetições sobram no tanque ao encerrar a série. */
  rir: string;
  dica: string;
}

/** Exercício de abdômen da finalização, com o tipo de estímulo que ele treina. */
export interface ExercicioAbs extends Exercicio {
  estimulo: string;
}

export interface Treino {
  id: string;
  nome: string;
  foco: string;
  duracao: string;
  aquecimento: string[];
  exercicios: Exercicio[];
  abdomen: ExercicioAbs;
}

/**
 * Plano padrão de fábrica. É o que aparece enquanto a usuária nunca editou
 * nada, e a base para o botão "Restaurar plano padrão".
 */
export const PLANO_PADRAO: Treino[] = [
  {
    id: 'A',
    nome: 'Treino A',
    foco: 'Agachamento e puxada horizontal',
    duracao: '35–45 min',
    aquecimento: [
      '5 min de esteira ou bike em ritmo leve',
      'Mobilidade de quadril e tornozelo — 10 rotações para cada lado',
      '1 série de 12 reps do primeiro exercício só com a barra',
    ],
    exercicios: [
      {
        id: 'a1',
        nome: 'Agachamento livre (barra)',
        padrao: 'Joelho',
        series: 4,
        reps: '8–10',
        descanso: 120,
        rir: '2',
        dica: 'Pés na largura dos ombros, pontas levemente para fora. Desça até a coxa ficar paralela ao chão mantendo o peito aberto e o abdômen contraído. Joelho acompanha a linha do pé — nunca cai para dentro.',
      },
      {
        id: 'a2',
        nome: 'Flexão de braço',
        padrao: 'Empurrar horizontal',
        series: 3,
        reps: '10–12',
        descanso: 75,
        rir: '2',
        dica: 'Mãos um pouco mais abertas que os ombros, corpo em linha reta da cabeça ao calcanhar. Desça até o peito quase tocar o chão. Para facilitar, apoie as mãos num banco; para dificultar, eleve os pés.',
      },
      {
        id: 'a3',
        nome: 'Remada curvada com barra (pegada pronada)',
        padrao: 'Puxar horizontal',
        series: 3,
        reps: '10–12',
        descanso: 90,
        rir: '2',
        dica: 'Tronco inclinado a ~45°, coluna neutra. Puxe a barra em direção ao umbigo levando o cotovelo para trás. Evite dar impulso com a lombar.',
      },
      {
        id: 'a4',
        nome: 'Cadeira flexora',
        padrao: 'Quadril',
        series: 3,
        reps: '12–15',
        descanso: 60,
        rir: '1',
        dica: 'Segure 1 segundo na contração máxima e volte devagar (2–3 s). O posterior responde muito bem à fase de descida controlada.',
      },
    ],
    abdomen: {
      id: 'abs-a',
      nome: 'Prancha isométrica',
      padrao: 'Core',
      estimulo: 'Anti-extensão',
      series: 3,
      reps: '30–45 s',
      descanso: 45,
      rir: '—',
      dica: 'Cotovelos abaixo dos ombros, glúteo contraído e quadril na linha do corpo. O trabalho aqui é impedir que a lombar afunde — se ela afundar, encerre a série.',
    },
  },
  {
    id: 'B',
    nome: 'Treino B',
    foco: 'Terra romeno e trabalho vertical',
    duracao: '35–45 min',
    aquecimento: [
      '5 min de elíptico ou caminhada inclinada',
      'Ativação de glúteo com mini band — 15 reps de caminhada lateral para cada lado',
      '1 série leve de 12 reps do primeiro exercício',
    ],
    exercicios: [
      {
        id: 'b1',
        nome: 'Levantamento terra romeno (barra)',
        padrao: 'Quadril',
        series: 4,
        reps: '8–10',
        descanso: 120,
        rir: '2',
        dica: 'Joelho levemente flexionado e fixo. Empurre o quadril para trás deslizando a barra rente à perna até sentir o alongamento do posterior — a coluna nunca arredonda.',
      },
      {
        id: 'b2',
        nome: 'Desenvolvimento com halteres sentada',
        padrao: 'Empurrar vertical',
        series: 3,
        reps: '10–12',
        descanso: 75,
        rir: '2',
        dica: 'Apoie as costas no encosto e não deixe a lombar arquear. Suba até quase estender o cotovelo, sem travar a articulação.',
      },
      {
        id: 'b3',
        nome: 'Puxada alta frontal (pulldown)',
        padrao: 'Puxar vertical',
        series: 3,
        reps: '10–12',
        descanso: 75,
        rir: '2',
        dica: 'Pegada um pouco mais aberta que os ombros. Puxe a barra até a linha da clavícula pensando em "levar o cotovelo para o bolso".',
      },
      {
        id: 'b4',
        nome: 'Leg press 45°',
        padrao: 'Joelho',
        series: 3,
        reps: '12–15',
        descanso: 90,
        rir: '2',
        dica: 'Pés na metade da plataforma, na largura do quadril. Desça até 90° sem tirar o quadril do apoio e não trave o joelho na subida.',
      },
    ],
    abdomen: {
      id: 'abs-b',
      nome: 'Elevação de pernas suspensa (ou no banco)',
      padrao: 'Core',
      estimulo: 'Flexão de quadril / porção inferior',
      series: 3,
      reps: '12–15',
      descanso: 45,
      rir: '1',
      dica: 'Suba as pernas levando o quadril levemente para cima no fim do movimento — é essa parte que tira o trabalho do flexor de quadril e joga no abdômen. Evite balançar.',
    },
  },
  {
    id: 'C',
    nome: 'Treino C',
    foco: 'Unilateral e máquinas — pouca carga na coluna',
    duracao: '35–45 min',
    aquecimento: [
      '5 min de bike ou escada',
      'Mobilidade de ombro com bastão — 10 reps',
      '1 série leve de 10 reps por perna do primeiro exercício',
    ],
    exercicios: [
      {
        id: 'c1',
        nome: 'Afundo búlgaro com halteres',
        padrao: 'Joelho',
        series: 3,
        reps: '10 por perna',
        descanso: 90,
        rir: '2',
        dica: 'Pé de trás no banco, pé da frente longe o suficiente para o joelho não passar muito da ponta. Tronco levemente inclinado à frente joga mais trabalho para o glúteo.',
      },
      {
        id: 'c2',
        nome: 'Crucifixo no peck deck',
        padrao: 'Empurrar horizontal',
        series: 3,
        reps: '12',
        descanso: 75,
        rir: '1',
        dica: 'Ajuste o banco para as manoplas ficarem na altura do meio do peito. Segure 1 s na contração e volte controlando o alongamento.',
      },
      {
        id: 'c3',
        nome: 'Remada cavalinho ou remada máquina',
        padrao: 'Puxar horizontal',
        series: 3,
        reps: '12',
        descanso: 75,
        rir: '1',
        dica: 'Peito apoiado quando houver apoio. Puxe com os cotovelos rentes ao corpo e evite encolher os ombros no fim.',
      },
      {
        id: 'c4',
        nome: 'Panturrilha em pé',
        padrao: 'Acessório',
        series: 4,
        reps: '15–20',
        descanso: 45,
        rir: '1',
        dica: 'Amplitude total: desça o calcanhar até o alongamento máximo e suba até a ponta do pé, com pausa de 1 s no topo.',
      },
    ],
    abdomen: {
      id: 'abs-c',
      nome: 'Pallof press na polia',
      padrao: 'Core',
      estimulo: 'Anti-rotação',
      series: 3,
      reps: '12 por lado',
      descanso: 45,
      rir: '1',
      dica: 'De lado para a polia, na altura do peito. Estenda os braços à frente e segure 2 s resistindo à força que tenta girar seu tronco. O corpo não se move — só os braços.',
    },
  },
  {
    id: 'D',
    nome: 'Treino D',
    foco: 'Posterior e puxada vertical',
    duracao: '35–45 min',
    aquecimento: [
      '5 min de esteira ou remo',
      'Ativação de glúteo com mini band — 15 reps de caminhada lateral para cada lado',
      '1 série leve de 12 reps do primeiro exercício',
    ],
    exercicios: [
      {
        id: 'd1',
        nome: 'Stiff com halteres',
        padrao: 'Quadril',
        series: 4,
        reps: '12',
        descanso: 90,
        rir: '2',
        dica: 'Mesma mecânica do terra romeno, com amplitude um pouco maior. Desça até onde a coluna se mantiver neutra — não force além disso.',
      },
      {
        id: 'd2',
        nome: 'Desenvolvimento na máquina (ou Arnold press)',
        padrao: 'Empurrar vertical',
        series: 3,
        reps: '12',
        descanso: 60,
        rir: '2',
        dica: 'Amplitude completa sem travar o cotovelo. Se usar Arnold press, gire o punho de forma lenta e contínua durante a subida.',
      },
      {
        id: 'd3',
        nome: 'Puxada alta supinada (ou barra fixa assistida)',
        padrao: 'Puxar vertical',
        series: 3,
        reps: '10–12',
        descanso: 90,
        rir: '2',
        dica: 'Pegada supinada na largura dos ombros. Peito para frente e ombro para baixo antes de iniciar a puxada — recruta mais dorsal e menos trapézio.',
      },
      {
        id: 'd4',
        nome: 'Cadeira extensora',
        padrao: 'Joelho',
        series: 3,
        reps: '12–15',
        descanso: 60,
        rir: '1',
        dica: 'Ajuste o encosto para o joelho ficar alinhado ao eixo da máquina. Segure 1 s no topo e desça em 2–3 s.',
      },
    ],
    abdomen: {
      id: 'abs-d',
      nome: 'Abdominal na polia alta (ajoelhada)',
      padrao: 'Core',
      estimulo: 'Flexão de tronco com carga',
      series: 3,
      reps: '15',
      descanso: 45,
      rir: '1',
      dica: 'Ajoelhada de frente para a polia, corda na altura da testa. Enrole a coluna levando o cotovelo em direção à coxa — quem desce é o tronco, o quadril fica parado.',
    },
  },
  {
    id: 'E',
    nome: 'Treino E',
    foco: 'Glúteo, peitoral e braços',
    duracao: '35–45 min',
    aquecimento: [
      '5 min de bike ou elíptico',
      'Ativação de glúteo com mini band — 15 reps de ponte no chão',
      '1 série leve de 12 reps do primeiro exercício',
    ],
    exercicios: [
      {
        id: 'e1',
        nome: 'Elevação pélvica na barra',
        padrao: 'Quadril',
        series: 4,
        reps: '12',
        descanso: 90,
        rir: '1',
        dica: 'Apoie a escápula no banco, queixo levemente para o peito. No topo, contraia o glúteo por 2 segundos até o tronco ficar paralelo ao chão.',
      },
      {
        id: 'e2',
        nome: 'Crucifixo inclinado com halteres',
        padrao: 'Empurrar horizontal',
        series: 3,
        reps: '12',
        descanso: 75,
        rir: '1',
        dica: 'Banco entre 30° e 45°. Cotovelo levemente flexionado e fixo durante todo o movimento — abra até sentir o alongamento do peitoral, sem descer além da linha do ombro.',
      },
      {
        id: 'e3',
        nome: 'Remada baixa na polia (triângulo)',
        padrao: 'Puxar horizontal',
        series: 3,
        reps: '10–12',
        descanso: 75,
        rir: '2',
        dica: 'Tronco estável — quem puxa é o dorsal, não a lombar. Junte as escápulas no fim do movimento e controle a volta.',
      },
      {
        id: 'e4',
        nome: 'Bi-set: rosca direta + tríceps na corda',
        padrao: 'Acessório',
        series: 3,
        reps: '12 + 12',
        descanso: 60,
        rir: '1',
        dica: 'Faça os dois exercícios em sequência, sem descanso entre eles. Cotovelo fixo ao lado do corpo nos dois movimentos.',
      },
    ],
    abdomen: {
      id: 'abs-e',
      nome: 'Prancha lateral',
      padrao: 'Core',
      estimulo: 'Anti-flexão lateral / oblíquos',
      series: 3,
      reps: '30 s por lado',
      descanso: 45,
      rir: '—',
      dica: 'Cotovelo abaixo do ombro, corpo em linha reta vista de frente. Suba o quadril e não deixe ele cair em direção ao chão. Para facilitar, apoie o joelho de baixo.',
    },
  },
];

/**
 * Regra de rodízio: os treinos são cíclicos, não presos a dias fixos da semana.
 * Fez A na segunda e perdeu a terça? Na quarta faz o B. Nada se perde.
 */
export const RODIZIO = [
  'Faça os treinos na ordem A → B → C → D → E → A, sem amarrar a dias fixos da semana.',
  'Perdeu um dia? Retome no treino seguinte da fila. Nenhum padrão de movimento fica sem estímulo.',
  'Ideal: 3 a 5 sessões por semana. Como as sessões são curtas, dois dias seguidos não são problema.',
  'Todo treino tem membro inferior, um empurrar, um puxar e a finalização de abdômen.',
  'O estímulo de abdômen muda a cada dia — no ciclo completo o core é treinado nas cinco funções.',
  'Progressão: quando fechar todas as séries no topo da faixa de reps com o RIR indicado, suba 2,5 a 5 kg na próxima vez.',
];

// ---------------------------------------------------------------------------
// Plano de treinos (Supabase) — editável pelo webapp, sincroniza entre
// celular e computador. Uma linha por usuária em public.fitness_planos.
// ---------------------------------------------------------------------------

/** Gera um id único para exercícios criados pela usuária. */
export function novoId(prefixo = 'ex'): string {
  return `${prefixo}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Exercício em branco, usado ao adicionar um item novo no editor. */
export function exercicioVazio(): Exercicio {
  return {
    id: novoId(),
    nome: '',
    padrao: 'Acessório',
    series: 3,
    reps: '10–12',
    descanso: 75,
    rir: '2',
    dica: '',
  };
}

/** Treino em branco, usado ao adicionar um dia novo no editor. */
export function treinoVazio(letra: string): Treino {
  return {
    id: novoId('t'),
    nome: `Treino ${letra}`,
    foco: '',
    duracao: '35–45 min',
    aquecimento: ['5 min de esteira ou bike em ritmo leve'],
    exercicios: [exercicioVazio()],
    abdomen: {
      ...exercicioVazio(),
      id: novoId('abs'),
      padrao: 'Core',
      estimulo: '',
      reps: '12–15',
      descanso: 45,
    },
  };
}

/**
 * Plano salvo da usuária. Se ela nunca editou (sem linha na tabela), devolve o
 * plano padrão. Se a tabela ainda não existe no Supabase, também cai no padrão
 * em vez de quebrar a página — ver `planoEditavel`.
 */
export async function carregarPlano(): Promise<Treino[]> {
  const { data, error } = await supabase
    .from('fitness_planos')
    .select('treinos')
    .maybeSingle();
  if (error) throw error;
  const treinos = data?.treinos as Treino[] | undefined;
  return treinos && treinos.length > 0 ? treinos : PLANO_PADRAO;
}

/** Grava o plano completo (upsert pela PK owner_id). */
export async function salvarPlano(treinos: Treino[]): Promise<void> {
  const { data: sessao } = await supabase.auth.getUser();
  const ownerId = sessao.user?.id;
  if (!ownerId) throw new Error('Sessão expirada. Entre novamente para salvar.');

  const { error } = await supabase
    .from('fitness_planos')
    .upsert({ owner_id: ownerId, treinos }, { onConflict: 'owner_id' });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Persistência local (dispositivo da usuária) — progresso da sessão e cargas.
// ---------------------------------------------------------------------------

const PROGRESSO_KEY = 'psi.fitness.progresso';
const CARGAS_KEY = 'psi.fitness.cargas';

type Registro = Record<string, string>;

function ler(key: string): Registro {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Registro) : {};
  } catch {
    return {};
  }
}

function gravar(key: string, valor: Registro) {
  try {
    localStorage.setItem(key, JSON.stringify(valor));
  } catch {
    /* modo privado / storage cheio — o app segue funcionando sem persistir */
  }
}

export const fitnessStorage = {
  /** Ids dos exercícios já concluídos na sessão atual de cada treino. */
  lerConcluidos(treinoId: string): string[] {
    const v = ler(PROGRESSO_KEY)[treinoId];
    return v ? v.split(',').filter(Boolean) : [];
  },
  salvarConcluidos(treinoId: string, ids: string[]) {
    const atual = ler(PROGRESSO_KEY);
    atual[treinoId] = ids.join(',');
    gravar(PROGRESSO_KEY, atual);
  },
  /** Última carga usada em cada exercício, digitada pela usuária. */
  lerCargas(): Registro {
    return ler(CARGAS_KEY);
  },
  salvarCarga(exercicioId: string, carga: string) {
    const atual = ler(CARGAS_KEY);
    if (carga.trim()) atual[exercicioId] = carga.trim();
    else delete atual[exercicioId];
    gravar(CARGAS_KEY, atual);
  },
};
