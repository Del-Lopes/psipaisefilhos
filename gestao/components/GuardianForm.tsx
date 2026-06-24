import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Guardian, GuardianInput } from '../lib/types';

interface Props {
  initial?: Guardian;
  onCancel: () => void;
  onSubmit: (input: GuardianInput) => Promise<void>;
}

const inputCls =
  'w-full rounded-lg border border-secondary-200 px-3 py-2 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500';
const labelCls = 'block text-sm font-semibold text-secondary-600 mb-1';

const GuardianForm: React.FC<Props> = ({ initial, onCancel, onSubmit }) => {
  const [form, setForm] = useState<GuardianInput>({
    nome: initial?.nome ?? '',
    parentesco: initial?.parentesco ?? null,
    telefone: initial?.telefone ?? null,
    email: initial?.email ?? null,
    cpf: initial?.cpf ?? null,
    is_pagante: initial?.is_pagante ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof GuardianInput>(key: K, value: GuardianInput[K]) =>
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
      await onSubmit({ ...form, nome: form.nome.trim() });
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
            {initial ? 'Editar responsável' : 'Novo responsável'}
          </h2>
          <button onClick={onCancel} aria-label="Fechar" className="text-secondary-400 hover:text-secondary-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Nome *</label>
            <input className={inputCls} value={form.nome} onChange={(e) => set('nome', e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Parentesco</label>
              <input className={inputCls} value={form.parentesco ?? ''} onChange={(e) => set('parentesco', e.target.value || null)} placeholder="mãe, pai..." />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input className={inputCls} value={form.telefone ?? ''} onChange={(e) => set('telefone', e.target.value || null)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>E-mail</label>
            <input type="email" className={inputCls} value={form.email ?? ''} onChange={(e) => set('email', e.target.value || null)} />
          </div>
          <div>
            <label className={labelCls}>CPF</label>
            <input className={inputCls} value={form.cpf ?? ''} onChange={(e) => set('cpf', e.target.value || null)} placeholder="para recibos" />
          </div>
          <label className="flex items-center gap-2 text-sm text-secondary-600">
            <input
              type="checkbox"
              checked={form.is_pagante}
              onChange={(e) => set('is_pagante', e.target.checked)}
              className="h-4 w-4 rounded border-secondary-300 text-secondary-500 focus:ring-secondary-500"
            />
            Responsável financeiro (pagante)
          </label>

          {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50">
              Cancelar
            </button>
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

export default GuardianForm;
