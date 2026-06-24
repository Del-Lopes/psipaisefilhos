import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Patient, PatientInput, PatientStatus } from '../lib/types';

interface Props {
  initial?: Patient;
  onCancel: () => void;
  onSubmit: (input: PatientInput) => Promise<void>;
}

const inputCls =
  'w-full rounded-lg border border-secondary-200 px-3 py-2 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500';
const labelCls = 'block text-sm font-semibold text-secondary-600 mb-1';

const PatientForm: React.FC<Props> = ({ initial, onCancel, onSubmit }) => {
  const [form, setForm] = useState<PatientInput>({
    nome: initial?.nome ?? '',
    data_nascimento: initial?.data_nascimento ?? null,
    sexo: initial?.sexo ?? null,
    escola: initial?.escola ?? null,
    ano_escolar: initial?.ano_escolar ?? null,
    queixa_inicial: initial?.queixa_inicial ?? null,
    observacoes: initial?.observacoes ?? null,
    drive_url: initial?.drive_url ?? null,
    status: initial?.status ?? 'ativo',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof PatientInput>(key: K, value: PatientInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        nome: form.nome.trim(),
        data_nascimento: form.data_nascimento || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <h2 className="font-serif text-lg text-secondary-600">
            {initial ? 'Editar paciente' : 'Novo paciente'}
          </h2>
          <button onClick={onCancel} aria-label="Fechar" className="text-secondary-400 hover:text-secondary-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Nome da criança *</label>
            <input className={inputCls} value={form.nome} onChange={(e) => set('nome', e.target.value)} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data de nascimento</label>
              <input
                type="date"
                className={inputCls}
                value={form.data_nascimento ?? ''}
                onChange={(e) => set('data_nascimento', e.target.value || null)}
              />
            </div>
            <div>
              <label className={labelCls}>Sexo</label>
              <select className={inputCls} value={form.sexo ?? ''} onChange={(e) => set('sexo', e.target.value || null)}>
                <option value="">—</option>
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Escola</label>
              <input className={inputCls} value={form.escola ?? ''} onChange={(e) => set('escola', e.target.value || null)} />
            </div>
            <div>
              <label className={labelCls}>Ano escolar</label>
              <input className={inputCls} value={form.ano_escolar ?? ''} onChange={(e) => set('ano_escolar', e.target.value || null)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Queixa inicial</label>
            <textarea
              className={inputCls}
              rows={2}
              value={form.queixa_inicial ?? ''}
              onChange={(e) => set('queixa_inicial', e.target.value || null)}
            />
          </div>

          <div>
            <label className={labelCls}>Observações</label>
            <textarea
              className={inputCls}
              rows={2}
              value={form.observacoes ?? ''}
              onChange={(e) => set('observacoes', e.target.value || null)}
            />
          </div>

          <div>
            <label className={labelCls}>Pasta de documentos (link do Google Drive)</label>
            <input
              type="url"
              className={inputCls}
              value={form.drive_url ?? ''}
              onChange={(e) => set('drive_url', e.target.value || null)}
              placeholder="https://drive.google.com/drive/folders/..."
            />
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => set('status', e.target.value as PatientStatus)}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
