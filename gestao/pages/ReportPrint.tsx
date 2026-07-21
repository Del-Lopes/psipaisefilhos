import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintData {
  titulo: string;
  pacienteNome: string;
  corpo: string;          // texto do relatório (revisado)
  emitente: {
    nome: string | null;
    crp: string | null;
    documento: string | null;
    telefone: string | null;
    endereco: string | null;
  };
  dataEmissao: string;    // ISO
}

const STORAGE_KEY = 'gestao:report-print';

/** Salva os dados e navega para a impressão (usado pelo modal de geração). */
export function stashPrintData(data: PrintData) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const ReportPrint: React.FC = () => {
  const [data, setData] = useState<PrintData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) {
    return (
      <div className="p-8 text-center text-secondary-500">
        <p>Nenhum relatório para exibir.</p>
        <Link to="/app/pacientes" className="text-secondary-600 underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  const dataFmt = new Date(data.dataEmissao).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="report-print-root bg-secondary-50 min-h-screen">
      {/* Barra de ações — escondida na impressão */}
      <div className="no-print sticky top-0 flex items-center justify-between gap-4 bg-white border-b border-secondary-100 px-4 py-3">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600">
          <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Folha A4 */}
      <div className="report-sheet mx-auto my-6 bg-white shadow-sm">
        <header className="flex items-start justify-between gap-6 border-b border-secondary-200 pb-4 mb-6">
          <img src="/logo.png" alt="" className="h-20 w-20 object-contain" />
          <div className="text-right text-xs text-secondary-500 leading-relaxed">
            <p className="font-serif text-base text-secondary-700">{data.emitente.nome ?? 'Psicóloga'}</p>
            {data.emitente.crp && <p>CRP: {data.emitente.crp}</p>}
            {data.emitente.documento && <p>{data.emitente.documento}</p>}
            {data.emitente.telefone && <p>{data.emitente.telefone}</p>}
            {data.emitente.endereco && <p>{data.emitente.endereco}</p>}
          </div>
        </header>

        <h1 className="font-serif text-xl text-secondary-700 text-center mb-1">{data.titulo}</h1>
        <p className="text-center text-sm text-secondary-400 mb-6">Paciente: {data.pacienteNome}</p>

        <div className="report-body whitespace-pre-wrap text-secondary-700 leading-relaxed text-justify">
          {data.corpo}
        </div>

        <footer className="mt-12 pt-6 text-center text-sm text-secondary-600">
          <p>{data.emitente.endereco ? '' : ''}{dataFmt}</p>
          <div className="mt-10 inline-block border-t border-secondary-400 px-10 pt-1">
            <p className="font-semibold">{data.emitente.nome ?? ''}</p>
            {data.emitente.crp && <p className="text-xs text-secondary-500">CRP: {data.emitente.crp}</p>}
          </div>
        </footer>
      </div>

      <style>{`
        .report-sheet {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          box-sizing: border-box;
        }
        @media print {
          .no-print { display: none !important; }
          .report-print-root { background: white !important; }
          .report-sheet { margin: 0 !important; box-shadow: none !important; width: auto; min-height: auto; padding: 0; }
          @page { size: A4; margin: 18mm; }
        }
      `}</style>
    </div>
  );
};

export default ReportPrint;
