import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bell, AlertCircle, Clock, MessageSquare, Check, CheckCircle2 } from 'lucide-react';
import { Acao, Atividade, Subatividade } from '../types';
import { Session } from '@supabase/supabase-js';

export interface LogEntry {
  date: string;
  text: string;
  author?: string;
}

export function parseObservacao(obs?: string): LogEntry[] {
  if (!obs || obs.trim() === '') return [];
  try {
    const parsed = JSON.parse(obs);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // legacy text
  }
  return [{ date: new Date().toISOString(), text: obs }];
}

const parseDateBR = (dateStr?: string) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.trim();
  const partsBR = cleanStr.split('/');
  if (partsBR.length === 3) {
    return new Date(parseInt(partsBR[2], 10), parseInt(partsBR[1], 10) - 1, parseInt(partsBR[0], 10));
  }
  const partsISO = cleanStr.split('-');
  if (partsISO.length === 3) {
    return new Date(parseInt(partsISO[0], 10), parseInt(partsISO[1], 10) - 1, parseInt(partsISO[2], 10));
  }
  return null;
};

const isDone = (status?: string) => {
  const currentStatus = status?.trim().toLowerCase() || 'pendente';
  return currentStatus === 'realizado' || currentStatus === 'concluído' || currentStatus === 'concluido' || currentStatus === 'finalizado';
};

interface AppNotification {
  id: string;
  type: 'vencido' | 'proximo' | 'comentario';
  title: string;
  description: string;
  date: Date;
  taskId: string;
  acaoId: string | null;
  atividadeId: string | null;
  subatividadeId: string | null;
  comentarioId?: string | null;
}

interface NotificationsProps {
  session: Session | null;
  atividades: Atividade[];
  subatividades: Subatividade[];
  onNotificationClick: (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null, comentarioId?: string | null) => void;
}

export function Notifications({ session, atividades, subatividades, onNotificationClick }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`read_notifications_${session?.user?.email}`);
    if (stored) {
      try {
        setReadIds(JSON.parse(stored));
      } catch (e) {}
    }
  }, [session?.user?.email]);

  const saveReadIds = (ids: string[]) => {
    setReadIds(prev => {
      const next = Array.from(new Set([...prev, ...ids]));
      if (session?.user?.email) {
        localStorage.setItem(`read_notifications_${session.user.email}`, JSON.stringify(next));
      }
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const todasNotificacoes = useMemo(() => {
    if (!session?.user) return [];
    
    // Normalize user names for robust comparison
    const userName = session.user.user_metadata?.full_name?.trim().toLowerCase() || '';
    const userEmail = session.user.email?.trim().toLowerCase() || '';

    const isUserTask = (responsavelStr?: string) => {
      if (!responsavelStr) return false;
      const respList = responsavelStr.split(',').map(r => r.trim().toLowerCase());
      
      const userFirstNames = new Set<string>();
      if (userName) userFirstNames.add(userName.split(' ')[0]);
      if (userEmail) userFirstNames.add(userEmail.split('@')[0].split('.')[0]);

      for (const r of respList) {
        if (userName && r === userName) return true;
        if (userEmail && r === userEmail) return true;
        if (userFirstNames.has(r.split(' ')[0])) return true;
      }
      return false;
    };

    const alerts: AppNotification[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const next5Days = new Date(today);
    next5Days.setDate(today.getDate() + 5);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const checkTask = (task: Atividade | Subatividade, isSub: boolean) => {
      if (!isUserTask(task.Responsavel)) return;

      const title = isSub ? (task as Subatividade).Subatividade : (task as Atividade).Atividade;
      const taskId = isSub ? (task as Subatividade).IDSubatividade : (task as Atividade).IDAtividade;
      
      let acaoId = null;
      let atividadeId = null;
      let subatividadeId = null;
      
      if (isSub) {
        subatividadeId = taskId;
        atividadeId = (task as Subatividade).IDAtividade;
        const parentAtiv = atividades.find(a => a.IDAtividade === atividadeId);
        if (parentAtiv) acaoId = parentAtiv.Acoes;
      } else {
        atividadeId = taskId;
        acaoId = (task as Atividade).Acoes;
      }

      // 1. Prazos
      if (!isDone(task.Status)) {
        const dataFim = parseDateBR(task.DataFim);
        if (dataFim) {
          if (dataFim < today) {
            alerts.push({
              id: `notif-prazo-vencido-${taskId}`,
              type: 'vencido',
              title: title,
              description: `Prazo vencido em ${task.DataFim}`,
              date: dataFim,
              taskId,
              acaoId,
              atividadeId,
              subatividadeId
            });
          } else if (dataFim >= today && dataFim <= next5Days) {
            alerts.push({
              id: `notif-prazo-proximo-${taskId}`,
              type: 'proximo',
              title: title,
              description: `Vence em breve (${task.DataFim})`,
              date: dataFim,
              taskId,
              acaoId,
              atividadeId,
              subatividadeId
            });
          }
        }
      }

      // 2. Diário de Bordo
      const logs = parseObservacao(task.Observacao);
      logs.forEach((log, index) => {
        const logDate = new Date(log.date);
        if (logDate >= sevenDaysAgo) {
          alerts.push({
            id: `notif-comment-${taskId}-${index}`,
            type: 'comentario',
            title: title,
            description: `Novo comentário: "${log.text.substring(0, 40)}${log.text.length > 40 ? '...' : ''}"`,
            date: logDate,
            taskId,
            acaoId,
            atividadeId,
            subatividadeId,
            comentarioId: log.date // keeping the actual date id for DOM scrolling
          });
        }
      });
    };

    atividades.forEach(a => checkTask(a, false));
    subatividades.forEach(s => checkTask(s, true));

    return alerts.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [atividades, subatividades, session]);

  // Atualização reativa de estado, filtrando as que estão lidas
  const unreadNotifications = todasNotificacoes.filter(n => !readIds.includes(n.id));

  const handleMarkAllAsRead = () => {
    const allIds = todasNotificacoes.map(n => n.id);
    const newReadIds = Array.from(new Set([...readIds, ...allIds]));
    saveReadIds(newReadIds);
    setIsOpen(false);
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveReadIds([id]);
  };

  const handleNotificationClick = (notification: AppNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Clique na notificação disparado:", notification);
    
    // 1. Marcar como lida primeiro e forçar fechamento
    saveReadIds([notification.id]);
    setIsOpen(false);
    
    // 2. Chamar o handler de navegação protegido por try/catch
    try {
      onNotificationClick(notification.acaoId, notification.atividadeId, notification.subatividadeId, notification.comentarioId);
    } catch (err) {
      console.error("Erro ao navegar para a notificação:", err);
    }
  };

  const getRelativeTime = (date: Date) => {
    const diffDays = Math.round((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 0) {
      if (diffDays === -1) return 'Amanhã';
      return `Em ${Math.abs(diffDays)} dias`;
    }
    return `Há ${diffDays} dias`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800/50 rounded-full transition-colors focus:outline-none"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 rounded-full border-2 border-slate-900 text-[9px] font-black text-white px-1">
            {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              Notificações
              {unreadNotifications.length > 0 && (
                <span className="bg-sky-500/20 text-sky-400 py-0.5 px-2 rounded-full text-[10px]">
                  {unreadNotifications.length}
                </span>
              )}
            </h3>
            {unreadNotifications.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[10px] uppercase font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Lidas
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {unreadNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-3" />
                <p className="text-xs font-bold uppercase tracking-wide">Tudo em dia por aqui!</p>
                <p className="text-[10px] mt-1 opacity-70">Nenhuma notificação pendente.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-800">
                {unreadNotifications.map(notification => (
                  <div key={notification.id} onClick={(e) => handleNotificationClick(notification, e)} className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors group relative pr-10">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {notification.type === 'vencido' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                        {notification.type === 'proximo' && <Clock className="w-4 h-4 text-amber-500" />}
                        {notification.type === 'comentario' && <MessageSquare className="w-4 h-4 text-sky-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-200 truncate">{notification.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {notification.description}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-2">
                          {getRelativeTime(notification.date)}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/10 rounded opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Marcar como lida"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
