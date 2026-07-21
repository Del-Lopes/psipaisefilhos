import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Indicator, IndicatorInput } from '../lib/types';

interface Props {
  initial?: Indicator;
  onCancel: () => void;
  onSubmit: (input: IndicatorInput) => Promise<void>;
}

const inputCls =
  'w-full rounded-lg border border-secondary-200 px-3 py-2 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500';
const labelCls = 'block text-sm font-semibold text-secondary-600 mb-1';

// Paleta sugerida (cores da marca + variações) para as linhas do gráfico.
const CORES = ['#F28E6F', '#4B5945', '#AEC370', '#FFD55D', '#D97A5C', '#8DA15A', '#B2644B'];

const IndicatorForm: React.FC<Props> = ({ initial, onCancel, onSubmit }) => {
  const [nome, setNome] = useState(initial?.nome ?? '');
  const [escalaMin, setEscalaMin] = useState(initial?.escala_min ?? 0);
  const [escalaMax, setEscalaMax] = useState(initial?.escala_max ?? 10);
  const [cor, setCor] = useState(initial?.cor ?? CORES[0]);
  const [ativo, setAtivo] = useState(initial?.ativo ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return setError('Dê um nome ao indicador.');
    if (escalaMax <= escalaMin) return setError('A escala máxima deve ser maior que a mínima.');
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ nome: nome.trim(), escala_min: escalaMin, escala_max: escalaMax, cor, ativo });
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
            {initial ? 'Editar indicador' : 'Novo indicador'}
          </h2>
          <button onClick={onCancel} aria-label="Fechar" className="text-secondary-400 hover:text-secondary-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Nome do indicador *</label>
            <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ansiedade, Foco, Sono..." autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Escala mínima</label>
              <input type="number" className={inputCls} value={escalaMin} onChange={(e) => setEscalaMin(Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Escala máxima</label>
              <input type="number" className={inputCls} value={escalaMax} onChange={(e) => setEscalaMax(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Cor no gráfico</label>
            <div className="flex flex-wrap gap-2">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`h-7 w-7 rounded-full border-2 ${cor === c ? 'border-secondary-600' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-secondary-600">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-4 w-4 rounded border-secondary-300 text-secondary-500 focus:ring-secondary-500" />
            Ativo (aparece no gráfico e para pontuar nas sessões)
          </label>

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

export default IndicatorForm;
