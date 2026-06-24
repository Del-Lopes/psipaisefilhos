import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Loader2, ChevronRight } from 'lucide-react';
import { listPatients, createPatient } from '../lib/patients';
import type { Patient, PatientInput } from '../lib/types';
import { calcAge, statusLabels, statusStyles } from '../lib/format';
import PatientForm from '../components/PatientForm';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      setPatients(await listPatients(term));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca com debounce.
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const handleCreate = async (input: PatientInput) => {
    await createPatient(input);
    setShowForm(false);
    load(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-secondary-600">Pacientes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600"
        >
          <Plus className="h-4 w-4" />
          Novo
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-300" />
        <input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-secondary-200 pl-9 pr-3 py-2.5 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
        />
      </div>

      {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-secondary-300" />
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-secondary-100 p-10 flex flex-col items-center text-center">
          <Users className="h-10 w-10 text-secondary-300" />
          <p className="mt-3 text-secondary-500 font-semibold">
            {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </p>
          {!search && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600"
            >
              <Plus className="h-4 w-4" />
              Cadastrar primeiro paciente
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-secondary-100 divide-y divide-secondary-50">
          {patients.map((p) => {
            const age = calcAge(p.data_nascimento);
            return (
              <Link
                key={p.id}
                to={`/app/pacientes/${p.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-secondary-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-secondary-700">{p.nome}</p>
                  <p className="text-sm text-secondary-400">
                    {age !== null ? `${age} anos` : 'Idade não informada'}
                    {p.escola ? ` · ${p.escola}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                  <ChevronRight className="h-4 w-4 text-secondary-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showForm && <PatientForm onCancel={() => setShowForm(false)} onSubmit={handleCreate} />}
    </div>
  );
};

export default Patients;
