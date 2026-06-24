import React from 'react';
import { Construction } from 'lucide-react';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-6">
    <h1 className="font-serif text-2xl text-secondary-600">{title}</h1>
    <div className="bg-white rounded-2xl border border-secondary-100 p-10 flex flex-col items-center text-center">
      <Construction className="h-10 w-10 text-secondary-300" />
      <p className="mt-3 text-secondary-500 font-semibold">Módulo em construção</p>
      <p className="text-sm text-secondary-400 max-w-sm mt-1">
        Este módulo será implementado na próxima etapa do projeto.
      </p>
    </div>
  </div>
);

export default Placeholder;
