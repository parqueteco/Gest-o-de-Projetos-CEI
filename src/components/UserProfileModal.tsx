import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface UserProfileModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function UserProfileModal({ session, isOpen, onClose, onUpdate }: UserProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  
  const [messageName, setMessageName] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [messagePass, setMessagePass] = useState<{type: 'error' | 'success', text: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(session.user.user_metadata?.full_name || '');
      setNewPassword('');
      setConfirmPassword('');
      setMessageName(null);
      setMessagePass(null);
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingName(true);
    setMessageName(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      setMessageName({ type: 'success', text: 'Nome atualizado com sucesso!' });
      onUpdate();
    } catch (err: any) {
      console.error(err);
      setMessageName({ type: 'error', text: err.message || 'Erro ao atualizar nome.' });
    } finally {
      setLoadingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPass(true);
    setMessagePass(null);

    if (newPassword !== confirmPassword) {
      setMessagePass({ type: 'error', text: 'As senhas não coincidem.' });
      setLoadingPass(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessagePass({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      setLoadingPass(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setMessagePass({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setMessagePass({ type: 'error', text: err.message || 'Erro ao atualizar senha.' });
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-sm font-black text-slate-100 flex items-center gap-2 uppercase tracking-wide">
            <User className="w-4 h-4 text-sky-400" /> Meu Perfil
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
          {/* Sessão de Nome */}
          <section>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <User className="w-3 h-3" /> Dados Pessoais
            </h3>
            <form onSubmit={handleUpdateName} className="space-y-4">
              {messageName && (
                <div className={`p-3 rounded text-xs font-bold flex items-start gap-2 ${messageName.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                  {messageName.type === 'error' ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
                  <span>{messageName.text}</span>
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nome de Exibição</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-sm text-slate-100 outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loadingName}
                className="w-full flex items-center justify-center gap-2 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 p-2.5 rounded font-black text-xs uppercase tracking-wide transition-colors disabled:opacity-50"
              >
                {loadingName ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loadingName ? 'Salvando...' : 'Salvar Nome'}
              </button>
            </form>
          </section>

          {/* Sessão de Senha */}
          <section>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Lock className="w-3 h-3" /> Alterar Senha
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {messagePass && (
                <div className={`p-3 rounded text-xs font-bold flex items-start gap-2 ${messagePass.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                  {messagePass.type === 'error' ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
                  <span>{messagePass.text}</span>
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-sm text-slate-100 outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-sm text-slate-100 outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loadingPass || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 p-2.5 rounded font-black text-xs uppercase tracking-wide transition-colors disabled:opacity-50"
              >
                {loadingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loadingPass ? 'Atualizando...' : 'Salvar Nova Senha'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
