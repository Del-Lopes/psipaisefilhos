import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, ExternalLink, Loader2, FileText, ChevronRight } from 'lucide-react';
import { listPatientsWithDocs } from '../lib/patients';
import type { Patient } from '../lib/types';

const Documentos: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPatientsWithDocs()
      .then(setPatients)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar documentos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-secondary-600">Documentos</h1>
        <p className="text-sm text-secondary-400">
          Pastas de documentos vinculadas a cada paciente no Google Drive.
        </p>
      </div>

      {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-secondary-100 p-10 flex flex-col items-center text-center">
          <FileText className="h-10 w-10 text-secondary-300" />
          <p className="mt-3 text-secondary-500 font-semibold">Nenhuma pasta vinculada ainda</p>
          <p className="text-sm text-secondary-400 max-w-sm mt-1">
            Abra a ficha de um paciente e cole, no campo de edição, o link da pasta dele no Google Drive.
            Os pacientes com pasta aparecem aqui.
          </p>
          <Link to="/app/pacientes" className="mt-4 text-sm text-secondary-500 hover:underline">
            Ir para Pacientes
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-secondary-100 divide-y divide-secondary-50">
          {patients.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <Link to={`/app/pacientes/${p.id}`} className="flex items-center gap-3 min-w-0 group">
                <div className="h-9 w-9 rounded-full bg-secondary-100 flex items-center justify-center shrink-0">
                  <FolderOpen className="h-5 w-5 text-secondary-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-secondary-700 truncate group-hover:underline">{p.nome}</p>
                  <p className="text-xs text-secondary-400 truncate">{p.drive_url}</p>
                </div>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={p.drive_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50"
                >
                  Abrir <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Link to={`/app/pacientes/${p.id}`} className="text-secondary-300 hover:text-secondary-500" aria-label="Abrir ficha">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documentos;
