import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Wallet,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/pacientes', label: 'Pacientes', icon: Users },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/app/documentos', label: 'Documentos', icon: FileText },
  { to: '/app/financeiro', label: 'Financeiro', icon: Wallet },
];

const AppLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/app/login', { replace: true });
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center text-center">
        <img
          src="/logo.png"
          alt="Bárbara Carvalho - Psicologia Infantil"
          className="w-full object-contain"
        />
        <p className="-mt-6 pb-3 text-xs text-secondary-400">Gestão de Consultório</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-secondary-500 text-white'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-secondary-100 p-3">
        <p className="px-3 pb-2 text-xs text-secondary-400 truncate">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:w-64 md:flex-col bg-white border-r border-secondary-100">
        {SidebarContent}
      </aside>

      {/* Sidebar mobile (overlay) */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-secondary-900/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <div className="md:pl-64">
        <header className="md:hidden flex items-center justify-between bg-white border-b border-secondary-100 px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu className="h-6 w-6 text-secondary-500" />
          </button>
          <span className="font-serif text-secondary-500">Gestão</span>
          <button onClick={handleSignOut} aria-label="Sair">
            <LogOut className="h-5 w-5 text-secondary-500" />
          </button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
