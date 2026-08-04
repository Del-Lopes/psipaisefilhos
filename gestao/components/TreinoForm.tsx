import React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, Zap } from 'lucide-react';
import { PADROES, exercicioVazio } from '../lib/fitness';
import type { Exercicio, ExercicioAbs, Padrao, Treino } from '../lib/fitness';

const campo =
  'w-full rounded-lg border border-secondary-200 px-3 py-2 text-sm text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500';
const rotulo = 'block text-xs font-semibold text-secondary-400 mb-1';

/** Editor de um exercício — usado tanto na lista quanto na finalização de abdômen. */
const ExercicioFields: React.FC<{
  ex: Exercicio;
  onChange: (ex: Exercicio) => void;
}> = ({ ex, onChange }) => {
  const set = <K extends keyof Exercicio>(chave: K, valor: Exercicio[K]) =>
    onChange({ ...ex, [chave]: valor });

  return (
    <div className="space-y-3">
      <div>
        <label className={rotulo}>Exercício</label>
        <input
          value={ex.nome}
          onChange={(e) => set('nome', e.target.value)}
          placeholder="Nome do exercício"
          className={campo}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={rotulo}>Séries</label>
          <input
            type="number"
            min={1}
            max={10}
            value={ex.series}
            onChange={(e) => set('series', Number(e.target.value) || 1)}
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>Repetições</label>
          <input
            value={ex.reps}
            onChange={(e) => set('reps', e.target.value)}
            placeholder="10–12"
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>Descanso (s)</label>
          <input
            type="number"
            min={0}
            max={600}
            step={15}
            value={ex.descanso}
            onChange={(e) => set('descanso', Number(e.target.value) || 0)}
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>RIR</label>
          <input
            value={ex.rir}
            onChange={(e) => set('rir', e.target.value)}
            placeholder="2"
            className={campo}
          />
        </div>
      </div>

      <div>
        <label className={rotulo}>Padrão de movimento</label>
        <select
          value={ex.padrao}
          onChange={(e) => set('padrao', e.target.value as Padrao)}
          className={campo}
        >
          {PADROES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={rotulo}>Como executar</label>
        <textarea
          value={ex.dica}
          onChange={(e) => set('dica', e.target.value)}
          placeholder="Orientação técnica que aparece ao tocar em “Como executar”."
          className={`${campo} min-h-[80px] leading-relaxed`}
        />
      </div>
    </div>
  );
};

const TreinoForm: React.FC<{
  treino: Treino;
  onChange: (treino: Treino) => void;
  onRemover: () => void;
  podeRemover: boolean;
}> = ({ treino, onChange, onRemover, podeRemover }) => {
  const set = <K extends keyof Treino>(chave: K, valor: Treino[K]) =>
    onChange({ ...treino, [chave]: valor });

  const alterarExercicio = (indice: number, ex: Exercicio) => {
    const lista = [...treino.exercicios];
    lista[indice] = ex;
    set('exercicios', lista);
  };

  const moverExercicio = (indice: number, delta: number) => {
    const destino = indice + delta;
    if (destino < 0 || destino >= treino.exercicios.length) return;
    const lista = [...treino.exercicios];
    [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
    set('exercicios', lista);
  };

  const removerExercicio = (indice: number) =>
    set(
      'exercicios',
      treino.exercicios.filter((_, i) => i !== indice)
    );

  const alterarAquecimento = (indice: number, valor: string) => {
    const lista = [...treino.aquecimento];
    lista[indice] = valor;
    set('aquecimento', lista);
  };

  return (
    <div className="space-y-6">
      {/* Identificação do treino */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-base text-secondary-700">Sobre o treino</h2>
          <button
            onClick={onRemover}
            disabled={!podeRemover}
            title={podeRemover ? 'Excluir este treino' : 'O plano precisa ter ao menos um treino'}
            className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-semibold text-secondary-500 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir treino
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={rotulo}>Nome</label>
            <input
              value={treino.nome}
              onChange={(e) => set('nome', e.target.value)}
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Duração estimada</label>
            <input
              value={treino.duracao}
              onChange={(e) => set('duracao', e.target.value)}
              placeholder="35–45 min"
              className={campo}
            />
          </div>
        </div>
        <div>
          <label className={rotulo}>Foco</label>
          <input
            value={treino.foco}
            onChange={(e) => set('foco', e.target.value)}
            placeholder="Ex.: Agachamento e puxada horizontal"
            className={campo}
          />
        </div>
      </div>

      {/* Aquecimento */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-5 space-y-3">
        <h2 className="font-serif text-base text-secondary-700">Aquecimento</h2>
        {treino.aquecimento.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => alterarAquecimento(i, e.target.value)}
              className={campo}
            />
            <button
              onClick={() =>
                set(
                  'aquecimento',
                  treino.aquecimento.filter((_, idx) => idx !== i)
                )
              }
              className="shrink-0 rounded-lg border border-secondary-200 p-2 text-secondary-400 hover:bg-primary-50 hover:text-primary-700"
              aria-label="Remover item do aquecimento"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => set('aquecimento', [...treino.aquecimento, ''])}
          className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-xs font-semibold text-secondary-600 hover:bg-secondary-50"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar item
        </button>
      </div>

      {/* Exercícios */}
      <div className="space-y-3">
        <h2 className="font-serif text-base text-secondary-700">
          Exercícios ({treino.exercicios.length})
        </h2>
        {treino.exercicios.map((ex, i) => (
          <div key={ex.id} className="rounded-2xl border border-secondary-100 bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-secondary-300">Exercício {i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moverExercicio(i, -1)}
                  disabled={i === 0}
                  className="rounded-lg border border-secondary-200 p-1.5 text-secondary-500 hover:bg-secondary-50 disabled:opacity-30"
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moverExercicio(i, 1)}
                  disabled={i === treino.exercicios.length - 1}
                  className="rounded-lg border border-secondary-200 p-1.5 text-secondary-500 hover:bg-secondary-50 disabled:opacity-30"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removerExercicio(i)}
                  className="rounded-lg border border-secondary-200 p-1.5 text-secondary-400 hover:bg-primary-50 hover:text-primary-700"
                  aria-label="Remover exercício"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <ExercicioFields ex={ex} onChange={(novo) => alterarExercicio(i, novo)} />
          </div>
        ))}
        <button
          onClick={() => set('exercicios', [...treino.exercicios, exercicioVazio()])}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-secondary-200 px-3 py-3 text-sm font-semibold text-secondary-500 hover:bg-secondary-50"
        >
          <Plus className="h-4 w-4" /> Adicionar exercício
        </button>
      </div>

      {/* Finalização — abdômen */}
      <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary-500" />
          <h2 className="font-serif text-base text-secondary-700">Finalização · Abdômen</h2>
        </div>
        <div>
          <label className={rotulo}>Estímulo trabalhado</label>
          <input
            value={treino.abdomen.estimulo}
            onChange={(e) =>
              set('abdomen', { ...treino.abdomen, estimulo: e.target.value } as ExercicioAbs)
            }
            placeholder="Ex.: Anti-rotação"
            className={campo}
          />
        </div>
        <ExercicioFields
          ex={treino.abdomen}
          onChange={(novo) =>
            set('abdomen', { ...novo, estimulo: treino.abdomen.estimulo } as ExercicioAbs)
          }
        />
      </div>
    </div>
  );
};

export default TreinoForm;
