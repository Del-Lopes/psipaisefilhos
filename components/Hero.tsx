import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-warm-50">
      <div className="container mx-auto px-6 md:px-12 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-block bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-2">
            Psicologia Infantil & Neurodivergências
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Cuidado Especializado para <span className="text-primary-600">Pequenas Mentes</span>, <br className="hidden md:block" />
            <span className="text-accent-400">Grandes Futuros.</span>
          </h1>
          
          <p className="text-lg text-slate-600 md:pr-10 leading-relaxed">
            Intervenção precoce baseada em evidências para transformar o desenvolvimento do seu filho.
            Acolhimento profissional para neurodivergências, traumas e desafios emocionais.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://wa.me/5511987814483"
              className="group flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Agendar Avaliação Inicial
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </a>
            <a 
              href="#specialty"
              className="flex items-center justify-center px-8 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-primary-600 hover:text-primary-600 transition-colors"
            >
              Conhecer Especialidades
            </a>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://picsum.photos/800/800" // Placeholder for child/therapy image
              alt="Criança brincando de forma terapêutica" 
              className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
            />
            
            {/* Floating Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50">
              <p className="text-sm font-serif italic text-slate-700">
                "O desenvolvimento infantil não espera. A intervenção correta hoje define o adulto de amanhã."
              </p>
              <p className="text-xs font-bold text-primary-600 mt-2 uppercase tracking-wider">
                — Psi Pais e Filhos
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;