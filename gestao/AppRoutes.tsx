import React from 'react';
import { Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Agenda from './pages/Agenda';
import Financeiro from './pages/Financeiro';
import Documentos from './pages/Documentos';

/** Envolve toda a subárvore /app com o contexto de autenticação. */
const AppShell: React.FC = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

/**
 * Rotas do sistema de gestão (área logada), montadas sob /app.
 * Exportadas como elemento <Route> para serem injetadas no <Routes> principal.
 */
export const appRoutes = (
  <Route path="/app" element={<AppShell />}>
    <Route path="login" element={<Login />} />
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="pacientes" element={<Patients />} />
      <Route path="pacientes/:id" element={<PatientDetail />} />
      <Route path="agenda" element={<Agenda />} />
      <Route path="documentos" element={<Documentos />} />
      <Route path="financeiro" element={<Financeiro />} />
    </Route>
  </Route>
);
