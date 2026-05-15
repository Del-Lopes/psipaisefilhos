import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Início', href: '/#hero' },
    { label: 'Desenvolvimento', href: '/#pillars' },
    { label: 'Especialidade', href: '/#specialty' },
    { label: 'Sobre Nós', href: '/#bio' },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    const id = href.replace('/#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="font-serif font-bold text-xl md:text-2xl text-secondary-600 uppercase tracking-tight">
          Psi Bárbara Carvalho
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-secondary-600 hover:text-secondary-400 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a 
            href="https://wa.me/5511987814483"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-secondary-400 hover:bg-secondary-500 text-white px-5 py-2 rounded-full font-semibold transition-all text-sm shadow-lg hover:shadow-xl"
          >
            Agendar Consulta
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-secondary-700"
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
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-secondary-700 font-medium text-lg"
            >
              {link.label}
            </a>
          ))}
          <a 
            href="https://wa.me/5511987814483"
            className="bg-secondary-400 text-white text-center py-3 rounded-lg font-bold"
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