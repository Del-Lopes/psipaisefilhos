import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Início', href: '#hero' },
    { label: 'Desenvolvimento', href: '#pillars' },
    { label: 'Especialidade', href: '#specialty' },
    { label: 'Sobre Nós', href: '#bio' },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="font-serif font-bold text-xl md:text-2xl text-primary-700 uppercase tracking-tight">
          Psi Pais e Filhos
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href}
              className="text-slate-600 hover:text-primary-600 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a 
            href="https://wa.me/5511999999999" // Placeholder number
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full font-semibold transition-all text-sm shadow-lg hover:shadow-xl"
          >
            Agendar Consulta
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-slate-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl py-6 px-6 flex flex-col space-y-4 border-t border-slate-100">
          {navLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href}
              className="text-slate-700 font-medium text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a 
            href="https://wa.me/5511999999999"
            className="bg-primary-600 text-white text-center py-3 rounded-lg font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Agendar pelo WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navigation;