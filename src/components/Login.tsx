import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Briefcase, Loader2, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mb-4 border border-slate-800 shadow-inner">
            <Briefcase className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-sky-400 text-center">
            CEI-MCR
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1 text-center">
            Project Management System
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-sm text-slate-100 outline-none focus:border-sky-500/50 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-sm text-slate-100 outline-none focus:border-sky-500/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 p-3 rounded font-black text-sm uppercase tracking-wide transition-colors disabled:opacity-50 disabled:hover:bg-sky-500 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
