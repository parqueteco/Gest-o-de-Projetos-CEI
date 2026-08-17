const fs = require('fs');

const code = `import React, { useState, useMemo } from 'react';
import { Acao, Atividade, Subatividade } from '../types';
import { Session } from '@supabase/supabase-js';
import { Clock, AlertTriangle, MessageSquare, X } from 'lucide-react';
import { DiarioBordo } from './DiarioBordo';

interface ControlePrazosProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  session: Session | null;
  onDataChanged: () => void;
  headerAction?: React.ReactNode;
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

const diffDays = (date1: Date, date2: Date) => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
};

export function ControlePrazos({ acoes, atividades, subatividades, session, onDataChanged, headerAction }: ControlePrazosProps) {
  const [activeFilter, setActiveFilter] = useState<string>('minhas');
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string, table: 'atividades' | 'subatividades', idField: 'idatividade' | 'idsubatividade', title: string } | null>(null);

  const teamMembers = useMemo(() => {
    const members = new Set<string>();
    const addMembers = (respStr?: string) => {
      if (!respStr) return;
      respStr.split(',').forEach(r => {
        const name = r.trim();
        if (name && name.toLowerCase() !== 'sem responsável' && name.toLowerCase() !== 'sem responsavel' && name.toLowerCase() !== 'pendente') {
          members.add(name);
        }
      });
    };
    atividades.forEach(a => addMembers(a.Responsavel));
    subatividades.forEach(s => addMembers(s.Responsavel));
    return Array.from(members).sort((a, b) => a.localeCompare(b));
  }, [atividades, subatividades]);

  const parsedData = useMemo(() => {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const userName = session?.user?.user_metadata?.full_name?.trim().toLowerCase() || '';
    const userEmail = session?.user?.email?.trim().toLowerCase() || '';

    const isUserTask = (responsavelStr?: string, targetName?: string) => {
      if (!responsavelStr) return false;
      const respList = responsavelStr.split(',').map(r => r.trim().toLowerCase());
      
      if (targetName) {
        return respList.includes(targetName.trim().toLowerCase());
      }
      return (userName && respList.includes(userName)) || (userEmail && respList.includes(userEmail));
    };

    let atrasadas: any[] = [];
    let proximas: any[] = [];

    const processTask = (task: Atividade | Subatividade, isSub: boolean) => {
      if (isDone(task.Status)) return;
      
      if (activeFilter !== 'todas') {
        if (activeFilter === 'minhas') {
          if (!isUserTask(task.Responsavel)) return;
        } else {
          if (!isUserTask(task.Responsavel, activeFilter)) return;
        }
      }

      const dataFim = parseDateBR(task.DataFim);
      if (!dataFim) return;

      const title = isSub ? (task as Subatividade).Subatividade : (task as Atividade).Atividade;
      const id = isSub ? (task as Subatividade).IDSubatividade : (task as Atividade).IDAtividade;
      
      let acaoNome = '';
      let metaNome = '';
      
      let acaoId = isSub ? null : (task as Atividade).Acoes;
      if (isSub) {
        const parentAtiv = atividades.find(a => a.IDAtividade === (task as Subatividade).IDAtividade);
        acaoId = parentAtiv?.Acoes || null;
      }
      
      if (acaoId) {
        const acao = acoes.find(a => a.IDAcao === acaoId);
        if (acao) {
          acaoNome = acao.Acao || '';
          metaNome = acao.IDMeta || '';
        }
      }

      const daysDiff = diffDays(today, dataFim);
      
      const item = {
        ...task,
        isSub,
        title,
        id,
        acaoNome,
        metaNome,
        dataFimObj: dataFim,
        daysDiff
      };

      if (dataFim < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        atrasadas.push(item);
      } else if (dataFim <= next7Days) {
        proximas.push(item);
      }
    };

    atividades.forEach(a => processTask(a, false));
    subatividades.forEach(s => processTask(s, true));

    atrasadas.sort((a, b) => a.dataFimObj.getTime() - b.dataFimObj.getTime());
    proximas.sort((a, b) => a.dataFimObj.getTime() - b.dataFimObj.getTime());

    return { atrasadas, proximas };
  }, [acoes, atividades, subatividades, session, activeFilter]);

  const openLog = (task: any) => {
    setSelectedTask({
      id: task.id,
      table: task.isSub ? 'subatividades' : 'atividades',
      idField: task.isSub ? 'idsubatividade' : 'idatividade',
      title: task.title
    });
    setLogModalOpen(true);
  };

  const renderCard = (task: any, isAtrasada: boolean) => (
    <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-bold mb-1 truncate">{task.metaNome} {task.acaoNome ? \`> \${task.acaoNome}\` : ''}</p>
          <h4 className="text-sm font-black text-slate-200 line-clamp-2">{task.title}</h4>
        </div>
        <span className={\`shrink-0 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 \${
          isAtrasada ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' : 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
        }\`}>
          {isAtrasada ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {isAtrasada ? \`Atrasado \${Math.abs(task.daysDiff)} dias\` : (task.daysDiff === 0 ? 'Vence Hoje' : \`Em \${task.daysDiff} dias\`)}
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mt-auto pt-3 border-t border-slate-800/50">
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-bold max-w-[150px] truncate">
          👤 {task.Responsavel || 'Sem responsável'}
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-bold">
          {task.Status || 'Pendente'}
        </span>
        <span className="text-[10px] font-bold text-slate-500 ml-auto">
          {task.DataFim}
        </span>
      </div>
      
      <button 
        onClick={() => openLog(task)}
        className="w-full mt-2 py-2 flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-sky-500/10 hover:text-sky-400 text-slate-400 rounded transition-colors text-xs font-black uppercase"
      >
        <MessageSquare className="w-4 h-4" /> Diário de Bordo
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden gap-4">
      <div className="flex items-start justify-between shrink-0 bg-slate-900/50 p-4 rounded-lg border border-slate-800 gap-4">
        
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <h2 className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap mr-2">
            <Clock className="w-4 h-4" />
            Prazos
          </h2>
          
          <button
            onClick={() => setActiveFilter('todas')}
            className={\`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors \${
              activeFilter === 'todas' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }\`}
          >
            Todas as Demandas
          </button>
          
          <button
            onClick={() => setActiveFilter('minhas')}
            className={\`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors \${
              activeFilter === 'minhas' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }\`}
          >
            Minhas Demandas
          </button>

          {teamMembers.map(member => (
            <button
              key={member}
              onClick={() => setActiveFilter(member)}
              className={\`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors \${
                activeFilter === member ? 'bg-sky-500 text-slate-950 shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }\`}
            >
              {member}
            </button>
          ))}
        </div>

        {headerAction && <div className="shrink-0 pt-0.5">{headerAction}</div>}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Coluna Atrasadas */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-rose-500/20">
              <AlertTriangle className="w-4 h-4" /> 
              Atividades Atrasadas
              <span className="bg-rose-500/20 px-2 py-0.5 rounded-full text-[10px] ml-auto">
                {parsedData.atrasadas.length}
              </span>
            </h3>
            
            <div className="flex flex-col gap-3">
              {parsedData.atrasadas.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/30 rounded-lg border border-slate-800 border-dashed text-slate-500 text-sm font-bold">
                  Nenhuma atividade atrasada. Bom trabalho!
                </div>
              ) : (
                parsedData.atrasadas.map(t => renderCard(t, true))
              )}
            </div>
          </div>

          {/* Coluna Vencendo em breve */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-amber-500/20">
              <Clock className="w-4 h-4" /> 
              Vencendo em breve (7 dias)
              <span className="bg-amber-500/20 px-2 py-0.5 rounded-full text-[10px] ml-auto">
                {parsedData.proximas.length}
              </span>
            </h3>
            
            <div className="flex flex-col gap-3">
              {parsedData.proximas.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/30 rounded-lg border border-slate-800 border-dashed text-slate-500 text-sm font-bold">
                  Nenhum prazo próximo nos próximos 7 dias.
                </div>
              ) : (
                parsedData.proximas.map(t => renderCard(t, false))
              )}
            </div>
          </div>
        </div>
      </div>

      {logModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-sky-500" />
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">Diário de Bordo</h3>
              </div>
              <button 
                onClick={() => setLogModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-800/30 border-b border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tarefa</p>
              <p className="text-sm font-black text-slate-200">{selectedTask.title}</p>
            </div>
            
            <div className="flex-1 overflow-hidden p-6 bg-slate-950/20">
              <DiarioBordo
                id={selectedTask.id}
                table={selectedTask.table}
                idField={selectedTask.idField}
                onDataChanged={onDataChanged}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/ControlePrazos.tsx', code);
