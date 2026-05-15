import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Specialty: React.FC = () => {
  return (
    <section id="specialty" className="py-24 bg-secondary-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Image/Visual Side */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-accent-200 transform rotate-3 rounded-3xl opacity-50"></div>
            <img 
              src="https://picsum.photos/600/800" // Placeholder for specialized therapy session
              alt="Sessão de terapia focada" 
              className="relative w-full rounded-3xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-500"
            />
          </div>

          {/* Text Content Side */}
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-serif font-bold text-secondary-600 mb-6">
              Especialidade em <span className="text-secondary-500">Neurodivergências</span>
            </h2>
            
            <p className="text-lg text-secondary-500 mb-8 leading-relaxed">
              O desenvolvimento atípico exige mais do que intuição; exige ciência e técnica apurada. Nossa especialização em Psicologia Infantil e Neurodivergências nos capacita a olhar além do comportamento visível, entendendo a arquitetura cerebral única de cada criança.
            </p>

            <div className="space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-secondary-100">
              <h3 className="font-bold text-secondary-600 mb-4 text-xl">Diferenciais do Tratamento:</h3>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-accent-500 mt-1 flex-shrink-0" size={20} />
                <p className="text-secondary-500">
                  <strong className="text-secondary-600">Olhar Clínico Refinado:</strong> Identificação precoce de sinais sutis de TEA (Transtorno do Espectro Autista) e TDAH.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-accent-500 mt-1 flex-shrink-0" size={20} />
                <p className="text-secondary-500">
                  <strong className="text-secondary-600">Protocolos Individualizados:</strong> Não existe "receita de bolo". Cada plano terapêutico respeita a neurobiologia específica do paciente.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-accent-500 mt-1 flex-shrink-0" size={20} />
                <p className="text-secondary-500">
                  <strong className="text-secondary-600">Orientação Parental:</strong> Acolhimento e treinamento para pais entenderem o funcionamento do filho neurodivergente.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Specialty;