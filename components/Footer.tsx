import React from 'react';
import { Instagram, Linkedin, Mail, MapPin, Heart, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const MessageCircleWrapper = () => <MessageCircle size={16} />;
  
  return (
    <footer className="bg-secondary-900 text-secondary-100 py-16">
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-3 gap-12">
        
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-primary-500 p-1.5 rounded-lg">
                <Heart size={20} className="text-white fill-white" />
             </div>
             <h4 className="text-2xl font-serif font-bold text-white">Bárbara Carvalho</h4>
          </div>
          <p className="text-sm leading-relaxed opacity-80 mb-6">
            Psicologia Infantil e Neurodivergências.<br/>
            Cuidado ético, técnico e humanizado para o desenvolvimento do seu filho.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-500 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-primary-500 transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h5 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contato</h5>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <div className="bg-secondary-800 p-2.5 rounded-xl"><MessageCircleWrapper /></div>
              <span className="font-medium">(11) 98781-4483</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-secondary-800 p-2.5 rounded-xl"><Mail size={18} /></div>
              <span className="font-medium">contato@psipaisefilhos.com.br</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-secondary-800 p-2.5 rounded-xl"><MapPin size={18} /></div>
              <span className="font-medium">São Paulo - SP</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Menu</h5>
          <ul className="space-y-3 text-sm">
              <li><a href="#hero" className="hover:text-primary-500 transition-colors">Início</a></li>
              <li><a href="#pillars" className="hover:text-primary-500 transition-colors">Desenvolvimento</a></li>
              <li><a href="#specialty" className="hover:text-primary-500 transition-colors">Neurodivergências</a></li>
              <li><a href="#bio" className="hover:text-primary-500 transition-colors">Sobre Nós</a></li>
          </ul>
        </div>

      </div>
      <div className="border-t border-secondary-800 mt-12 pt-8 text-center text-xs opacity-40">
        &copy; {new Date().getFullYear()} Bárbara Carvalho. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;