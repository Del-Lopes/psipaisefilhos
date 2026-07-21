import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Loader2, Pencil, Trash2, Target, Activity, CalendarCheck2, CheckCircle2,
} from 'lucide-react';
import {
  listIndicators, createIndicator, updateIndicator, deleteIndicator,
  scoresForPatient, listGoals, createGoal, updateGoal, setGoalStatus, deleteGoal,
  computeAttendance,
} from '../lib/evolution';
import { listSessionsByPatient } from '../lib/sessions';
import type {
  Indicator, IndicatorInput, IndicatorScorePoint, Goal, GoalInput, AttendanceStats,
} from '../lib/types';
import LineChart, { type LineSeries } from './charts/LineChart';
import BarChart, { type BarGroup } from './charts/BarChart';
import IndicatorForm from './IndicatorForm';
import GoalForm from './GoalForm';

const goalStatusStyles: Record<Goal['status'], string> = {
  em_andamento: 'bg-secondary-100 text-secondary-700',
  atingido: 'bg-nature-100 text-nature-800',
  pausado: 'bg-accent-100 text-accent-800',
};
const goalStatusLabels: Record<Goal['status'], string> = {
  em_andamento: 'Em andamento',
  atingido: 'Atingido',
  pausado: 'Pausado',
};

const EvolutionSection: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [scores, setScores] = useState<IndicatorScorePoint[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [indicatorModal, setIndicatorModal] = useState<{ open: boolean; edit?: Indicator }>({ open: false });
  const [goalModal, setGoalModal] = useState<{ open: boolean; edit?: Goal }>({ open: false });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inds, sc, gs, sessions] = await Promise.all([
        listIndicators(patientId),
        scoresForPatient(patientId),
        listGoals(patientId),
        listSessionsByPatient(patientId),
      ]);
      setIndicators(inds);
      setScores(sc);
      setGoals(gs);
      setAttendance(computeAttendance(sessions));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar a evolução.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  // --- handlers indicadores ---
  const submitIndicator = async (input: IndicatorInput) => {
    if (indicatorModal.edit) await updateIndicator(indicatorModal.edit.id, input);
    else await createIndicator(patientId, input);
    setIndicatorModal({ open: false });
    load();
  };
  const removeIndicator = async (ind: Indicator) => {
    if (!confirm(`Excluir o indicador "${ind.nome}" e todas as suas pontuações?`)) return;
    await deleteIndicator(ind.id);
    load();
  };

  // --- handlers objetivos ---
  const submitGoal = async (input: GoalInput) => {
    if (goalModal.edit) await updateGoal(goalModal.edit.id, input);
    else await createGoal(patientId, input);
    setGoalModal({ open: false });
    load();
  };
  const toggleGoalAtingido = async (g: Goal) => {
    await setGoalStatus(g.id, g.status === 'atingido' ? 'em_andamento' : 'atingido');
    load();
  };
  const removeGoal = async (g: Goal) => {
    if (!confirm(`Excluir o objetivo "${g.titulo}"?`)) return;
    await deleteGoal(g.id);
    load();
  };

  // --- montagem das séries do gráfico de indicadores ---
  const series: LineSeries[] = indicators
    .filter((ind) => ind.ativo)
    .map((ind) => ({
      label: ind.nome,
      color: ind.cor ?? '#4B5945',
      points: scores
        .filter((s) => s.indicator_id === ind.id)
        .map((s) => ({ x: new Date(s.inicio).getTime(), y: s.valor })),
    }));

  const yMin = Math.min(...indicators.map((i) => i.escala_min), 0);
  const yMax = Math.max(...indicators.map((i) => i.escala_max), 10);

  // --- barras de frequência ---
  const barGroups: BarGroup[] = (attendance?.porMes ?? []).map((m) => ({
    label: m.mes.slice(5) + '/' + m.mes.slice(2, 4), // MM/AA
    values: [
      { color: '#AEC370', value: m.realizadas },
      { color: '#F28E6F', value: m.faltas },
    ],
  }));

  const goalsAtingidos = goals.filter((g) => g.status === 'atingido').length;

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>;
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

      {/* Indicadores + gráfico */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-secondary-600 flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary-400" /> Indicadores clínicos
          </h3>
          <button onClick={() => setIndicatorModal({ open: true })} className="flex items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-secondary-600">
            <Plus className="h-4 w-4" /> Novo
          </button>
        </div>

        {indicators.length === 0 ? (
          <p className="text-sm text-secondary-400 py-4 text-center">
            Nenhum indicador. Crie indicadores (ex: Ansiedade, Foco) e pontue-os ao registrar a evolução de cada sessão.
          </p>
        ) : (
          <>
            <LineChart series={series} yMin={yMin} yMax={yMax} formatX={(x) => new Date(x).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
            <div className="flex flex-wrap gap-3 mt-4">
              {indicators.map((ind) => (
                <div key={ind.id} className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${ind.ativo ? 'border-secondary-200' : 'border-secondary-100 opacity-50'}`}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ind.cor ?? '#4B5945' }} />
                  <span className="font-semibold text-secondary-600">{ind.nome}</span>
                  <span className="text-secondary-400">({ind.escala_min}–{ind.escala_max})</span>
                  <button onClick={() => setIndicatorModal({ open: true, edit: ind })} className="text-secondary-300 hover:text-secondary-600" aria-label="Editar indicador"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => removeIndicator(ind)} className="text-secondary-300 hover:text-primary-600" aria-label="Excluir indicador"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Objetivos */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-secondary-600 flex items-center gap-2">
            <Target className="h-5 w-5 text-secondary-400" /> Objetivos
            {goals.length > 0 && <span className="text-sm text-secondary-400 font-sans">({goalsAtingidos}/{goals.length} atingidos)</span>}
          </h3>
          <button onClick={() => setGoalModal({ open: true })} className="flex items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-secondary-600">
            <Plus className="h-4 w-4" /> Novo
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="text-sm text-secondary-400 py-4 text-center">Nenhum objetivo terapêutico cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.id} className="flex items-start justify-between gap-3 rounded-lg border border-secondary-100 p-3">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleGoalAtingido(g)} className={g.status === 'atingido' ? 'text-nature-600' : 'text-secondary-300 hover:text-nature-600'} aria-label="Alternar atingido">
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <div>
                    <p className={`font-semibold text-secondary-700 ${g.status === 'atingido' ? 'line-through opacity-70' : ''}`}>{g.titulo}</p>
                    {g.descricao && <p className="text-sm text-secondary-400">{g.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${goalStatusStyles[g.status]}`}>{goalStatusLabels[g.status]}</span>
                  <button onClick={() => setGoalModal({ open: true, edit: g })} className="p-1 text-secondary-300 hover:text-secondary-600" aria-label="Editar objetivo"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => removeGoal(g)} className="p-1 text-secondary-300 hover:text-primary-600" aria-label="Excluir objetivo"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequência */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <h3 className="font-serif text-lg text-secondary-600 flex items-center gap-2 mb-4">
          <CalendarCheck2 className="h-5 w-5 text-secondary-400" /> Frequência
        </h3>
        {attendance && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="rounded-lg bg-secondary-50 p-3 text-center">
                <p className="font-serif text-xl text-secondary-600">{attendance.realizadas}</p>
                <p className="text-xs text-secondary-400">Realizadas</p>
              </div>
              <div className="rounded-lg bg-secondary-50 p-3 text-center">
                <p className="font-serif text-xl text-secondary-600">{attendance.faltas}</p>
                <p className="text-xs text-secondary-400">Faltas</p>
              </div>
              <div className="rounded-lg bg-secondary-50 p-3 text-center">
                <p className="font-serif text-xl text-secondary-600">{attendance.percentComparecimento}%</p>
                <p className="text-xs text-secondary-400">Comparecimento</p>
              </div>
              <div className="rounded-lg bg-secondary-50 p-3 text-center">
                <p className="font-serif text-xl text-secondary-600">{attendance.agendadas}</p>
                <p className="text-xs text-secondary-400">Agendadas</p>
              </div>
            </div>
            <BarChart groups={barGroups} legend={[{ color: '#AEC370', label: 'Realizadas' }, { color: '#F28E6F', label: 'Faltas' }]} />
          </>
        )}
      </div>

      {indicatorModal.open && (
        <IndicatorForm initial={indicatorModal.edit} onCancel={() => setIndicatorModal({ open: false })} onSubmit={submitIndicator} />
      )}
      {goalModal.open && (
        <GoalForm initial={goalModal.edit} onCancel={() => setGoalModal({ open: false })} onSubmit={submitGoal} />
      )}
    </div>
  );
};

export default EvolutionSection;
