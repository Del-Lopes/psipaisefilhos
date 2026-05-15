import React from 'react';
import { Instagram, Linkedin, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-800 text-secondary-100 py-16">
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-3 gap-12">
        
        {/* Brand */}
        <div>
          <h4 className="text-2xl font-serif font-bold text-white mb-4">Bárbara Carvalho</h4>
          <p className="text-sm leading-relaxed opacity-80 mb-6">
            Psicologia Infantil e Neurodivergências.<br/>
            Cuidado ético, técnico e humanizado para o desenvolvimento do seu filho.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-secondary-300 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-secondary-300 transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h5 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contato</h5>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <div className="bg-slate-800 p-2 rounded-full"><MessageCircleWrapper /></div>
              <span>(11) 98781-4483</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="bg-slate-800 p-2 rounded-full"><Mail size={16} /></div>
              <span>contato@psipaisefilhos.com.br</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="bg-slate-800 p-2 rounded-full"><MapPin size={16} /></div>
              <span>São Paulo - SP</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Menu</h5>
          <ul className="space-y-2 text-sm">
              <li><a href="#hero" className="hover:text-secondary-300 transition-colors">Início</a></li>
              <li><a href="#pillars" className="hover:text-secondary-300 transition-colors">Desenvolvimento</a></li>
              <li><a href="#specialty" className="hover:text-secondary-300 transition-colors">Neurodivergências</a></li>
              <li><a href="#bio" className="hover:text-secondary-300 transition-colors">Sobre Nós</a></li>
          </ul>
        </div>

      </div>
      <div className="border-t border-secondary-600 mt-12 pt-8 text-center text-xs opacity-50">
        &copy; {new Date().getFullYear()} Bárbara Carvalho. Todos os direitos reservados.
      </div>
    </footer>
  );
};

// Helper for the icon in footer to avoid import conflict
import { MessageCircle } from 'lucide-react';
const MessageCircleWrapper = () => <MessageCircle size={16} />;

export default Footer;