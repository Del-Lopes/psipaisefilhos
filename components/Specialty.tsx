import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Specialty: React.FC = () => {
  return (
    <section id="specialty" className="py-24 bg-nature-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Image/Visual Side */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-accent-200 transform rotate-3 rounded-3xl opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800"
              alt="Ambiente de acolhimento e escuta terapêutica infantil" 
              className="relative w-full rounded-3xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-500 object-cover min-h-[400px]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/EFF2E3/4B5945?text=Espa%C3%A7o+Terap%C3%AAutico';
              }}
            />
          </div>

          {/* Text Content Side */}
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-serif font-bold text-secondary-500 mb-6">
              Atuação em <span className="text-primary-500 italic">Neurodivergências</span>
            </h2>
            
            <p className="text-lg text-secondary-500 mb-8 leading-relaxed">
              O desenvolvimento atípico exige fundamentação científica e escuta humanizada. A minha prática na Psicologia Infantil busca olhar além do comportamento observável, compreendendo a singularidade e a arquitetura emocional de cada criança.
            </p>

            <div className="space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-secondary-100">
              <h3 className="font-bold text-secondary-500 mb-4 text-xl">Pilares do Acompanhamento:</h3>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-accent-500 mt-1 flex-shrink-0" size={20} />
                <p className="text-secondary-500">
                  <strong className="text-secondary-500">Olhar Clínico Aprofundado:</strong> Avaliação e acompanhamento do desenvolvimento infantil, atenta aos sinais de TEA (Transtorno do Espectro Autista), TDAH e outras especificidades.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-accent-500 mt-1 flex-shrink-0" size={20} />
                <p className="text-secondary-500">
                  <strong className="text-secondary-500">Planos Terapêuticos Singularizados:</strong> Cada processo respeita o ritmo, a neurobiologia e os interesses únicos de cada paciente.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-accent-500 mt-1 flex-shrink-0" size={20} />
                <p className="text-secondary-500">
                  <strong className="text-secondary-500">Orientação Parental:</strong> Parceria contínua com a família para compreensão das demandas e fortalecimento do suporte no ambiente familiar.
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