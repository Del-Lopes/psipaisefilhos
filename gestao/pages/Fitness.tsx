import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dumbbell,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronDown,
  Flame,
  Repeat,
  Info,
  Zap,
  Pencil,
  Save,
  X,
  Plus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  PLANO_PADRAO,
  RODIZIO,
  carregarPlano,
  salvarPlano,
  treinoVazio,
  fitnessStorage,
} from '../lib/fitness';
import type { Exercicio, ExercicioAbs, Treino } from '../lib/fitness';
import TreinoForm from '../components/TreinoForm';

/** mm:ss a partir de segundos. */
const formatarTempo = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** Cópia profunda simples — o plano é JSON puro. */
const clonar = <T,>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T;

/** Cronômetro de descanso — fixo no rodapé enquanto estiver rodando. */
const CronometroDescanso: React.FC<{
  segundos: number;
  onFechar: () => void;
}> = ({ segundos, onFechar }) => {
  const [restante, setRestante] = useState(segundos);
  const [rodando, setRodando] = useState(true);
  const inicial = useRef(segundos);

  // Novo descanso disparado por outro exercício: reinicia a contagem.
  useEffect(() => {
    inicial.current = segundos;
    setRestante(segundos);
    setRodando(true);
  }, [segundos]);

  useEffect(() => {
    if (!rodando || restante <= 0) return;
    const t = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rodando, restante]);

  const acabou = restante <= 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:pl-64">
      <div className="mx-auto max-w-3xl m-3 rounded-2xl bg-secondary-500 text-white shadow-xl px-4 py-3 flex items-center gap-3">
        <Timer className={`h-5 w-5 shrink-0 ${acabou ? 'text-accent-500' : 'text-nature-500'}`} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-secondary-200">
            {acabou ? 'Descanso concluído — bora para a próxima série' : 'Descanso'}
          </p>
          <p className="font-serif text-2xl tabular-nums leading-tight">
            {formatarTempo(Math.max(restante, 0))}
          </p>
        </div>
        {!acabou && (
          <button
            onClick={() => setRodando((r) => !r)}
            className="rounded-lg bg-secondary-600 p-2.5 hover:bg-secondary-700"
            aria-label={rodando ? 'Pausar' : 'Retomar'}
          >
            {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}
        <button
          onClick={() => {
            setRestante(inicial.current);
            setRodando(true);
          }}
          className="rounded-lg bg-secondary-600 p-2.5 hover:bg-secondary-700"
          aria-label="Reiniciar descanso"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={onFechar}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-secondary-200 hover:text-white"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

const CardExercicio: React.FC<{
  ex: Exercicio | ExercicioAbs;
  indice: number | string;
  concluido: boolean;
  carga: string;
  onAlternar: () => void;
  onCarga: (v: string) => void;
  onDescansar: () => void;
}> = ({ ex, indice, concluido, carga, onAlternar, onCarga, onDescansar }) => {
  const [aberto, setAberto] = useState(false);

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        concluido ? 'border-nature-300 bg-nature-50' : 'border-secondary-100 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onAlternar}
          aria-label={concluido ? 'Desmarcar exercício' : 'Marcar como concluído'}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            concluido
              ? 'border-nature-600 bg-nature-600 text-white'
              : 'border-secondary-200 text-transparent hover:border-secondary-400'
          }`}
        >
          <Check className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs font-semibold text-secondary-300">{indice}</span>
            <h3
              className={`font-serif text-base leading-snug ${
                concluido ? 'text-secondary-400 line-through' : 'text-secondary-700'
              }`}
            >
              {ex.nome || 'Exercício sem nome'}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-full bg-secondary-500 px-2.5 py-1 font-semibold text-white">
              {ex.series} × {ex.reps}
            </span>
            <span className="rounded-full bg-secondary-50 px-2.5 py-1 font-semibold text-secondary-500">
              Descanso {ex.descanso}s
            </span>
            <span className="rounded-full bg-secondary-50 px-2.5 py-1 font-semibold text-secondary-500">
              RIR {ex.rir}
            </span>
            <span className="rounded-full bg-warm-100 px-2.5 py-1 font-semibold text-secondary-400">
              {ex.padrao}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-secondary-400">
              Carga
              <input
                value={carga}
                onChange={(e) => onCarga(e.target.value)}
                placeholder="—"
                inputMode="decimal"
                className="w-24 rounded-lg border border-secondary-200 px-2.5 py-1.5 text-sm text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
              />
            </label>
            <button
              onClick={onDescansar}
              className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-semibold text-secondary-600 hover:bg-secondary-50"
            >
              <Timer className="h-3.5 w-3.5" /> Descansar {ex.descanso}s
            </button>
            {ex.dica && (
              <button
                onClick={() => setAberto((a) => !a)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-secondary-400 hover:text-secondary-600"
              >
                <Info className="h-3.5 w-3.5" /> Como executar
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${aberto ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>

          {aberto && ex.dica && (
            <p className="mt-3 rounded-lg bg-warm-50 px-3 py-2.5 text-sm leading-relaxed text-secondary-500">
              {ex.dica}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Fitness: React.FC = () => {
  const [plano, setPlano] = useState<Treino[]>(PLANO_PADRAO);
  const [carregando, setCarregando] = useState(true);
  /** Tabela fitness_planos ausente no Supabase: mostra o plano padrão, sem editar. */
  const [semTabela, setSemTabela] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [treinoId, setTreinoId] = useState<string>(PLANO_PADRAO[0].id);
  const [concluidos, setConcluidos] = useState<string[]>([]);
  const [cargas, setCargas] = useState<Record<string, string>>({});
  // Chave numérica para reiniciar o cronômetro mesmo repetindo o mesmo descanso.
  const [descanso, setDescanso] = useState<{ segundos: number; chave: number } | null>(null);

  // Edição
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState<Treino[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPlano()
      .then((treinos) => {
        setPlano(treinos);
        setTreinoId(treinos[0].id);
      })
      .catch((err) => {
        // Sem a tabela criada, a página segue útil em modo somente leitura.
        const msg = err instanceof Error ? err.message : String(err);
        if (/fitness_planos|schema cache|does not exist/i.test(msg)) setSemTabela(true);
        else setErro(msg);
      })
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    setCargas(fitnessStorage.lerCargas());
  }, []);

  useEffect(() => {
    setConcluidos(fitnessStorage.lerConcluidos(treinoId));
  }, [treinoId]);

  const listaAtiva = editando ? rascunho : plano;
  const treino = useMemo(
    () => listaAtiva.find((t) => t.id === treinoId) ?? listaAtiva[0],
    [listaAtiva, treinoId]
  );

  const alternar = (exId: string) => {
    const proximo = concluidos.includes(exId)
      ? concluidos.filter((id) => id !== exId)
      : [...concluidos, exId];
    setConcluidos(proximo);
    fitnessStorage.salvarConcluidos(treinoId, proximo);
  };

  const definirCarga = (exId: string, valor: string) => {
    setCargas((c) => ({ ...c, [exId]: valor }));
    fitnessStorage.salvarCarga(exId, valor);
  };

  const reiniciar = () => {
    setConcluidos([]);
    fitnessStorage.salvarConcluidos(treinoId, []);
  };

  // --- edição -------------------------------------------------------------
  const abrirEdicao = () => {
    setRascunho(clonar(plano));
    setErro(null);
    setEditando(true);
  };

  const cancelarEdicao = () => {
    setEditando(false);
    setRascunho([]);
    setErro(null);
    if (!plano.some((t) => t.id === treinoId)) setTreinoId(plano[0].id);
  };

  const atualizarTreino = (novo: Treino) =>
    setRascunho((r) => r.map((t) => (t.id === novo.id ? novo : t)));

  const adicionarTreino = () => {
    const letra = String.fromCharCode(65 + rascunho.length);
    const novo = treinoVazio(letra);
    setRascunho((r) => [...r, novo]);
    setTreinoId(novo.id);
  };

  const removerTreino = (id: string) => {
    const restante = rascunho.filter((t) => t.id !== id);
    if (restante.length === 0) return;
    setRascunho(restante);
    if (treinoId === id) setTreinoId(restante[0].id);
  };

  const restaurarPadrao = () => {
    const padrao = clonar(PLANO_PADRAO);
    setRascunho(padrao);
    setTreinoId(padrao[0].id);
  };

  const salvar = async () => {
    setSalvando(true);
    setErro(null);
    try {
      await salvarPlano(rascunho);
      setPlano(rascunho);
      setEditando(false);
      setRascunho([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar o plano.';
      setErro(
        /fitness_planos|schema cache|does not exist/i.test(msg)
          ? 'A tabela fitness_planos ainda não existe no Supabase. Rode gestao/sql/09_fitness.sql no SQL Editor e tente de novo.'
          : msg
      );
    } finally {
      setSalvando(false);
    }
  };

  // O abdômen da finalização entra na contagem junto com os exercícios.
  const todos = useMemo(() => [...treino.exercicios, treino.abdomen], [treino]);
  const feitos = todos.filter((e) => concluidos.includes(e.id)).length;
  const total = todos.length || 1;
  const percentual = Math.round((feitos / total) * 100);

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-secondary-300" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${descanso ? 'pb-28' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-secondary-600">Fitness</h1>
          <p className="text-sm text-secondary-400">
            {editando
              ? 'Editando o plano — as mudanças só valem depois de salvar.'
              : 'Treinos full body para consultar durante o treino na academia.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!editando && (
            <div className="flex items-center gap-2 rounded-xl bg-white border border-secondary-100 px-3 py-2">
              <Repeat className="h-4 w-4 text-nature-600" />
              <span className="text-xs font-semibold text-secondary-500">
                Rodízio de {plano.length} dias
              </span>
            </div>
          )}
          {editando ? (
            <>
              <button
                onClick={cancelarEdicao}
                disabled={salvando}
                className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50 disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex items-center gap-1.5 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-50"
              >
                {salvando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar plano
              </button>
            </>
          ) : (
            !semTabela && (
              <button
                onClick={abrirEdicao}
                className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50"
              >
                <Pencil className="h-4 w-4" /> Editar treinos
              </button>
            )
          )}
        </div>
      </div>

      {semTabela && (
        <div className="flex gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-primary-600" />
          <div className="text-sm text-secondary-600">
            <p className="font-semibold">Edição indisponível — banco não configurado</p>
            <p className="mt-1 text-secondary-500">
              Rode <code className="font-mono text-xs">gestao/sql/09_fitness.sql</code> no SQL
              Editor do Supabase para liberar a edição dos treinos. Enquanto isso, o plano padrão
              abaixo funciona normalmente para consulta.
            </p>
          </div>
        </div>
      )}

      {erro && (
        <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700">{erro}</p>
      )}

      {/* Seletor de treino */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3">
        {listaAtiva.map((t) => {
          const ativo = t.id === treino.id;
          return (
            <button
              key={t.id}
              onClick={() => setTreinoId(t.id)}
              className={`rounded-2xl border p-3 sm:p-4 text-left transition-colors ${
                ativo
                  ? 'border-secondary-500 bg-secondary-500 text-white'
                  : 'border-secondary-100 bg-white hover:bg-secondary-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Dumbbell
                  className={`h-4 w-4 shrink-0 ${ativo ? 'text-accent-500' : 'text-secondary-300'}`}
                />
                <span
                  className={`font-serif text-base ${ativo ? 'text-white' : 'text-secondary-700'}`}
                >
                  {t.nome || 'Sem nome'}
                </span>
              </div>
              <p
                className={`mt-1 text-xs leading-snug ${
                  ativo ? 'text-secondary-100' : 'text-secondary-400'
                }`}
              >
                {t.foco || '—'}
              </p>
            </button>
          );
        })}
        {editando && (
          <button
            onClick={adicionarTreino}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-secondary-300 p-3 text-sm font-semibold text-secondary-500 hover:bg-secondary-50"
          >
            <Plus className="h-4 w-4" /> Novo treino
          </button>
        )}
      </div>

      {editando ? (
        <>
          <TreinoForm
            treino={treino}
            onChange={atualizarTreino}
            onRemover={() => removerTreino(treino.id)}
            podeRemover={rascunho.length > 1}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary-100 bg-white p-5">
            <div>
              <p className="font-semibold text-secondary-600">Restaurar plano padrão</p>
              <p className="text-sm text-secondary-400">
                Descarta todas as edições e volta aos 5 treinos originais.
              </p>
            </div>
            <button
              onClick={restaurarPadrao}
              className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrão
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Progresso da sessão */}
          <div className="rounded-2xl border border-secondary-100 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-lg text-secondary-700">
                  {treino.nome} · {treino.duracao}
                </p>
                <p className="text-sm text-secondary-400">
                  {feitos} de {total} exercícios concluídos
                </p>
              </div>
              <button
                onClick={reiniciar}
                className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reiniciar treino
              </button>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary-100">
              <div
                className="h-full rounded-full bg-nature-500 transition-all duration-300"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>

          {/* Aquecimento */}
          {treino.aquecimento.length > 0 && (
            <div className="rounded-2xl border border-accent-200 bg-accent-50 p-5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary-600" />
                <h2 className="font-serif text-base text-secondary-700">Aquecimento (5–8 min)</h2>
              </div>
              <ul className="mt-2 space-y-1">
                {treino.aquecimento.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-secondary-500">
                    <span className="text-primary-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exercícios */}
          <div className="space-y-3">
            {treino.exercicios.map((ex, i) => (
              <CardExercicio
                key={ex.id}
                ex={ex}
                indice={i + 1}
                concluido={concluidos.includes(ex.id)}
                carga={cargas[ex.id] ?? ''}
                onAlternar={() => alternar(ex.id)}
                onCarga={(v) => definirCarga(ex.id, v)}
                onDescansar={() => setDescanso({ segundos: ex.descanso, chave: Date.now() })}
              />
            ))}
          </div>

          {/* Finalização — abdômen (estímulo diferente em cada treino) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Zap className="h-4 w-4 text-primary-500" />
              <h2 className="font-serif text-base text-secondary-700">Finalização · Abdômen</h2>
              {treino.abdomen.estimulo && (
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                  {treino.abdomen.estimulo}
                </span>
              )}
            </div>
            <CardExercicio
              ex={treino.abdomen}
              indice="ABS"
              concluido={concluidos.includes(treino.abdomen.id)}
              carga={cargas[treino.abdomen.id] ?? ''}
              onAlternar={() => alternar(treino.abdomen.id)}
              onCarga={(v) => definirCarga(treino.abdomen.id, v)}
              onDescansar={() =>
                setDescanso({ segundos: treino.abdomen.descanso, chave: Date.now() })
              }
            />
          </div>

          {/* Como usar o rodízio */}
          <div className="rounded-2xl border border-secondary-100 bg-white p-5">
            <h2 className="font-serif text-base text-secondary-700">Como usar</h2>
            <p className="mt-1 text-sm text-secondary-400">
              Os treinos são full body: cada sessão cobre perna, empurrar e puxar, mais a
              finalização de abdômen.
            </p>
            <ul className="mt-3 space-y-2">
              {RODIZIO.map((regra) => (
                <li key={regra} className="flex gap-2 text-sm leading-relaxed text-secondary-500">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-nature-600" />
                  {regra}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-secondary-400">
              RIR = repetições em reserva. RIR 2 significa encerrar a série ainda conseguindo fazer
              mais 2 repetições com boa técnica. O plano fica salvo na sua conta; progresso e
              cargas ficam neste dispositivo.
            </p>
          </div>
        </>
      )}

      {descanso && !editando && (
        <CronometroDescanso
          key={descanso.chave}
          segundos={descanso.segundos}
          onFechar={() => setDescanso(null)}
        />
      )}
    </div>
  );
};

export default Fitness;
