import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-warm-50">
      {/* Background Blurs */}
      <div className="absolute top-20 right-10 w-80 h-80 bg-accent-200 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary-200 rounded-full blur-3xl opacity-30"></div>
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        {/* Text Content - Centered */}
        <div className="max-w-4xl mx-auto space-y-8 text-center animate-fade-in-up">
          <div className="inline-block bg-secondary-100 text-secondary-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-2">
            Psicologia Infantil & Neurodivergências
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-600 leading-tight">
            Cuidado Especializado para <span className="text-secondary-500">Pequenas Mentes</span>, <br className="hidden md:block" />
            <span className="text-accent-400">Grandes Futuros.</span>
          </h1>
          
          <p className="text-lg text-secondary-500 md:px-20 leading-relaxed">
            Intervenção precoce baseada em evidências para transformar o desenvolvimento do seu filho.
            Acolhimento profissional para neurodivergências, traumas e desafios emocionais.
          </p>

          {/* Quote Card */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-secondary-100 max-w-2xl mx-auto">
            <p className="text-base font-serif italic text-secondary-600">
              "O desenvolvimento infantil não espera. A intervenção correta hoje define o adulto de amanhã."
            </p>
            <p className="text-xs font-bold text-secondary-500 mt-3 uppercase tracking-wider">
              — Bárbara Carvalho
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a 
              href="https://wa.me/5511987814483"
              className="group flex items-center justify-center gap-2 bg-secondary-400 hover:bg-secondary-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-secondary-500/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Agendar Avaliação Inicial
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </a>
            <a 
              href="#specialty"
              className="flex items-center justify-center px-8 py-4 rounded-xl border-2 border-secondary-200 text-secondary-600 font-semibold hover:border-secondary-400 hover:text-secondary-400 transition-colors"
            >
              Conhecer Especialidades
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;