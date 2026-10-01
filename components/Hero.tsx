import React from 'react';
import { ArrowRight, Sparkles, Heart, Sun } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-warm-50">
      {/* Ludic Background Elements */}
      <div className="absolute top-24 left-10 animate-bounce-slow opacity-20 hidden md:block">
        <Sun className="text-accent-500 w-20 h-20" />
      </div>
      <div className="absolute bottom-20 right-20 animate-pulse opacity-20 hidden md:block">
        <Heart className="text-primary-500 w-16 h-16" />
      </div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-100 rounded-full blur-[120px] -mr-64 -mt-32 opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-nature-100 rounded-full blur-[120px] -ml-48 -mb-32 opacity-40"></div>

      {/* Hero BG Image (Doodles) */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'url("/hero-bg.png")', backgroundSize: '500px' }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 text-left order-2 lg:order-1">
            <div className="inline-flex flex-wrap items-center gap-2 bg-nature-100 text-secondary-500 px-5 py-2 rounded-full text-sm font-bold tracking-wide border border-nature-200 animate-fade-in">
              <Sparkles size={18} className="text-accent-500" />
              <span>Psicóloga Bárbara Carvalho</span>
              <span className="text-secondary-400 font-normal">|</span>
              <span className="text-primary-700">CRP 06/187233</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-secondary-500 leading-[1.1] font-serif">
              Acolhendo o <span className="text-primary-500 italic">Desenvolvimento</span> <br />
              com Amor e <span className="text-accent-500">Ciência</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-secondary-400 max-w-xl leading-relaxed font-medium">
              Atuação dedicada à Psicologia Infantil, apoiando o desenvolvimento do seu filho através de um olhar lúdico, acolhedor e fundamentado na ciência.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <a 
                href="https://wa.me/5511987814483"
                className="group flex items-center justify-center gap-3 bg-primary-500 hover:bg-primary-600 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                Agendar Consulta
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </a>
              <a 
                href="#specialty"
                className="flex items-center justify-center px-10 py-5 rounded-2xl border-2 border-secondary-200 text-secondary-500 font-bold text-lg hover:border-primary-500 hover:text-primary-500 transition-all bg-white/60 backdrop-blur-sm"
              >
                Conhecer Abordagem
              </a>
            </div>
          </div>

          {/* Logo / Image Content */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-in-up">
            <div className="relative max-w-[500px] w-full">
              {/* Playful Frame Decorations */}
              <div className="absolute -inset-6 bg-accent-200 rounded-[50px] rotate-3 opacity-30 animate-pulse"></div>
              <div className="absolute -inset-6 bg-nature-200 rounded-[50px] -rotate-3 opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              
              <div className="relative bg-white p-10 rounded-[50px] shadow-[0_32px_64px_-16px_rgba(75,89,69,0.15)] border border-warm-100 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Bárbara Carvalho - Psicologia Infantil" 
                  className="w-full h-auto object-contain transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/FFFBF5/4B5945?text=Logo+Aqui';
                  }}
                />
              </div>

              {/* Floating Icons */}
              <div className="absolute -top-10 -right-10 bg-white p-4 rounded-3xl shadow-xl animate-bounce-slow border border-warm-100">
                <Heart className="text-primary-500 w-8 h-8 fill-primary-500/20" />
              </div>
              <div className="absolute -bottom-6 -left-8 bg-white p-4 rounded-3xl shadow-xl animate-bounce border border-warm-100" style={{ animationDelay: '2s' }}>
                <Sun className="text-accent-500 w-10 h-10 fill-accent-500/20" />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;