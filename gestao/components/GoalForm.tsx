import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Goal, GoalInput, GoalStatus } from '../lib/types';

interface Props {
  initial?: Goal;
  onCancel: () => void;
  onSubmit: (input: GoalInput) => Promise<void>;
}

const inputCls =
  'w-full rounded-lg border border-secondary-200 px-3 py-2 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500';
const labelCls = 'block text-sm font-semibold text-secondary-600 mb-1';

const GoalForm: React.FC<Props> = ({ initial, onCancel, onSubmit }) => {
  const [titulo, setTitulo] = useState(initial?.titulo ?? '');
  const [descricao, setDescricao] = useState(initial?.descricao ?? '');
  const [status, setStatus] = useState<GoalStatus>(initial?.status ?? 'em_andamento');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return setError('Descreva o objetivo.');
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        status,
        atingido_em: status === 'atingido' ? (initial?.atingido_em ?? new Date().toISOString().slice(0, 10)) : null,
        ordem: initial?.ordem ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <h2 className="font-serif text-lg text-secondary-600">
            {initial ? 'Editar objetivo' : 'Novo objetivo'}
          </h2>
          <button onClick={onCancel} aria-label="Fechar" className="text-secondary-400 hover:text-secondary-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Objetivo terapêutico *</label>
            <input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Reduzir crises de ansiedade na escola" autoFocus />
          </div>
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea className={inputCls} rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)}>
              <option value="em_andamento">Em andamento</option>
              <option value="atingido">Atingido</option>
              <option value="pausado">Pausado</option>
            </select>
          </div>

          {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
