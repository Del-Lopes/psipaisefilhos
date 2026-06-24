import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setError('E-mail ou senha inválidos.');
      return;
    }
    navigate('/app', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Bárbara Carvalho - Psicologia Infantil"
            className="mx-auto h-72 w-72 object-contain"
          />
          <h1 className="font-serif text-2xl text-secondary-500 -mt-6">Gestão de Consultório</h1>
          <p className="text-sm text-secondary-400 mt-1">Acesso restrito</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-secondary-600 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-secondary-200 px-3 py-2.5 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-secondary-600 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-secondary-200 px-3 py-2.5 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
            />
          </div>

          {error && (
            <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary-600 transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="text-center text-xs text-secondary-400 mt-6">
          Psi Bárbara Carvalho · Psicologia Infantil
        </p>
      </div>
    </div>
  );
};

export default Login;
