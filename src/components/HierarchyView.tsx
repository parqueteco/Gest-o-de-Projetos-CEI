import React, { useState, useMemo, useEffect } from 'react';
import { Acao, Atividade, Subatividade } from '../types';
import { ExternalLink, AlertTriangle, Edit2, Trash2, Plus, ChevronDown, ChevronRight, CheckCircle2, Circle, FileText, Target, MessageSquare, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { isLate } from './Dashboard';
import { AcaoModal, AtividadeModal, SubatividadeModal } from './CrudModals';
import { ConfirmModal } from './ConfirmModal';
import { DiarioBordo, parseObservacao } from './DiarioBordo';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';

import { TargetHighlight } from '../App';

interface HierarchyViewProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  onUpdateSubatividadeStatus?: (sub: Subatividade, newStatus: string) => void;
  onAddSubatividade?: (atividadeId: string, nome: string) => void;
  onDataChanged: () => void;
  targetHighlight?: TargetHighlight | null;
  headerAction?: React.ReactNode;
}

export default function HierarchyView({ acoes, atividades, subatividades, onUpdateSubatividadeStatus, onDataChanged, targetHighlight, headerAction }: HierarchyViewProps) {
  const [expandedAcoes, setExpandedAcoes] = useState<Set<string>>(new Set());
  const [expandedAtividades, setExpandedAtividades] = useState<Set<string>>(new Set());
  const [expandedSubatividades, setExpandedSubatividades] = useState<Set<string>>(new Set());
  
  const [acaoModalOpen, setAcaoModalOpen] = useState(false);
  const [atividadeModalOpen, setAtividadeModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  
  const [editingAcao, setEditingAcao] = useState<Acao | null>(null);
  const [editingAtiv, setEditingAtiv] = useState<Atividade | null>(null);
  const [editingSub, setEditingSub] = useState<Subatividade | null>(null);

  const [activeAcaoId, setActiveAcaoId] = useState<string | null>(null);

  useEffect(() => {
    if (targetHighlight) {
      try {
        // 1. Force state expansion
        if (targetHighlight.acaoId) {
          setExpandedAcoes(prev => {
            const next = new Set(prev);
            next.add(targetHighlight.acaoId!);
            return next;
          });
        }
        if (targetHighlight.atividadeId) {
          setExpandedAtividades(prev => {
            const next = new Set(prev);
            next.add(targetHighlight.atividadeId!);
            return next;
          });
        }
        if (targetHighlight.subatividadeId) {
          setExpandedSubatividades(prev => {
            const next = new Set(prev);
            next.add(targetHighlight.subatividadeId!);
            return next;
          });
        }

        // 2. Simple navigation with basic delay
        let targetId = null;
        if (targetHighlight.comentarioId) targetId = `comentario-${targetHighlight.comentarioId}`;
        else if (targetHighlight.subatividadeId) targetId = `sub-${targetHighlight.subatividadeId}`;
        else if (targetHighlight.atividadeId) targetId = `ativ-${targetHighlight.atividadeId}`;
        else if (targetHighlight.acaoId) targetId = `acao-${targetHighlight.acaoId}`;

        if (targetId) {
          setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('ring-2', 'ring-sky-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all', 'duration-500', 'bg-sky-500/10');
              setTimeout(() => {
                element.classList.remove('ring-2', 'ring-sky-500', 'ring-offset-2', 'ring-offset-slate-900', 'bg-sky-500/10');
              }, 2500);
            }
          }, 300); // Allow React time to render expanded items
        }
      } catch (err) {
        console.error("Erro ao expandir hierarquia:", err);
      }
    }
  }, [targetHighlight]);
  const [activeAtividadeId, setActiveAtividadeId] = useState<string | null>(null);
  const [insertOrderSub, setInsertOrderSub] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, type: 'acao' | 'atividade' | 'subatividade', id: string, title: string, message: string }>({
    isOpen: false,
    type: 'acao',
    id: '',
    title: '',
    message: ''
  });

  const toggleAcao = (id: string) => {
    setExpandedAcoes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAtividade = (id: string) => {
    setExpandedAtividades(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSubatividade = (id: string) => {
    setExpandedSubatividades(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const requestDeleteAcao = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'acao',
      id,
      title: 'Excluir Ação',
      message: 'Deseja realmente excluir esta Ação? Todas as atividades e subatividades vinculadas também serão removidas permanentemente.'
    });
  };

  const requestDeleteAtiv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'atividade',
      id,
      title: 'Excluir Atividade',
      message: 'Deseja excluir esta Atividade? Todas as subatividades vinculadas também serão removidas permanentemente.'
    });
  };

  const requestDeleteSub = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'subatividade',
      id,
      title: 'Excluir Subatividade',
      message: 'Deseja realmente excluir esta Subatividade permanentemente?'
    });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteConfirm;
    setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
    
    try {
      if (type === 'acao') {
        const { data: ativs } = await supabase.from('atividades').select('idatividade').eq('acoes', id);
        if (ativs && ativs.length > 0) {
          for (const ativ of ativs) {
            await supabase.from('subatividades').delete().eq('idatividade', ativ.idatividade);
          }
          await supabase.from('atividades').delete().eq('acoes', id);
        }
        await supabase.from('acoes').delete().eq('idacao', id);
      } else if (type === 'atividade') {
        await supabase.from('subatividades').delete().eq('idatividade', id);
        await supabase.from('atividades').delete().eq('idatividade', id);
      } else if (type === 'subatividade') {
        await supabase.from('subatividades').delete().eq('idsubatividade', id);
      }
      onDataChanged();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir item');
    }
  };

  const handleStatusChange = async (ativId: string, newStatus: string) => {
    try {
      await supabase.from('atividades').update({ status: newStatus }).eq('idatividade', ativId);
      onDataChanged();
    } catch (err) { console.error(err); alert('Erro ao atualizar status'); }
  };

  const moveAtividade = async (ativId: string, direction: 'up' | 'down', currentList: Atividade[]) => {
    const currentIndex = currentList.findIndex(a => a.IDAtividade === ativId);
    if (currentIndex < 0) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === currentList.length - 1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    const updates = currentList.map((ativ, index) => {
      let order = index;
      if (index === currentIndex) order = newIndex;
      if (index === newIndex) order = currentIndex;
      return { idatividade: ativ.IDAtividade, ordem: order.toString() };
    });

    try {
      await Promise.all(
        updates.map(update => 
          supabase.from('atividades').update({ ordem: update.ordem }).eq('idatividade', update.idatividade)
        )
      );
      onDataChanged();
    } catch (err) {
      console.error(err);
      alert('Erro ao reordenar atividade');
    }
  };

  const [insertOrderAtiv, setInsertOrderAtiv] = useState<string | null>(null);

  const insertAtividadeAt = async (index: number, acaoId: string, currentList: Atividade[]) => {
    const updates = currentList.map((ativ, i) => {
      let order = i < index ? i : i + 1;
      return { idatividade: ativ.IDAtividade, ordem: order.toString() };
    });

    try {
      await Promise.all(
        updates.map(update => 
          supabase.from('atividades').update({ ordem: update.ordem }).eq('idatividade', update.idatividade)
        )
      );
      setInsertOrderAtiv(index.toString());
      setActiveAcaoId(acaoId);
      setEditingAtiv(null);
      setAtividadeModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao preparar inserção');
    }
  };

  const moveSubatividade = async (subId: string, direction: 'up' | 'down', currentList: Subatividade[]) => {
    const currentIndex = currentList.findIndex(s => s.IDSubatividade === subId);
    if (currentIndex < 0) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === currentList.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Create updates array where we swap order
    const updates = currentList.map((sub, index) => {
      let order = index; // Fallback to index if no ordemsub exists, establishes baseline
      if (index === currentIndex) order = newIndex;
      if (index === newIndex) order = currentIndex;
      return { idsubatividade: sub.IDSubatividade, ordemsub: order.toString() };
    });

    try {
      // Execute all updates
      await Promise.all(
        updates.map(update => 
          supabase.from('subatividades').update({ ordemsub: update.ordemsub }).eq('idsubatividade', update.idsubatividade)
        )
      );
      onDataChanged();
    } catch (err) {
      console.error(err);
      alert('Erro ao reordenar subatividade');
    }
  };

  const insertSubatividadeAt = async (index: number, ativId: string, currentList: Subatividade[]) => {
    const updates = currentList.map((sub, i) => {
      let order = i < index ? i : i + 1;
      return { idsubatividade: sub.IDSubatividade, ordemsub: order.toString() };
    });

    try {
      await Promise.all(
        updates.map(update => 
          supabase.from('subatividades').update({ ordemsub: update.ordemsub }).eq('idsubatividade', update.idsubatividade)
        )
      );
      setInsertOrderSub(index.toString());
      setActiveAtividadeId(ativId);
      setEditingSub(null);
      setSubModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao preparar inserção de subatividade');
    }
  };

  const handleSubStatusChange = async (subId: string, newStatus: string) => {
    try {
      await supabase.from('subatividades').update({ status: newStatus }).eq('idsubatividade', subId);
      onDataChanged();
    } catch (err) { console.error(err); alert('Erro ao atualizar status da subatividade'); }
  };

  const handleDateChange = async (id: string, table: 'atividades' | 'subatividades', field: 'datainicio' | 'datafim', newDateStr: string) => {
    try {
      if (table === 'atividades') {
        await supabase.from('atividades').update({ [field]: newDateStr }).eq('idatividade', id);
      } else {
        await supabase.from('subatividades').update({ [field]: newDateStr }).eq('idsubatividade', id);
      }
      onDataChanged();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar a data');
    }
  };


  const acoesByPilar = useMemo(() => {
    const groups: Record<string, Acao[]> = {};
    acoes.forEach(acao => {
      const pilar = acao.Pilar?.trim() || 'Sem Pilar';
      if (!groups[pilar]) {
        groups[pilar] = [];
      }
      groups[pilar].push(acao);
    });
    
    // Sort groups alphabetically by pilar name
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, Acao[]>);
  }, [acoes]);

  return (
    <section className="flex-1 overflow-y-auto pr-2 pb-12 flex flex-col gap-3 relative">
      <div className="flex items-start justify-between gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
        <h2 className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap mt-2">
          Visão Geral
        </h2>
        <div className="flex flex-col items-end gap-2 ml-auto">
          {headerAction && <div className="shrink-0">{headerAction}</div>}
          <button 
            onClick={() => { setEditingAcao(null); setAcaoModalOpen(true); }} 
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded font-black text-[10px] uppercase transition-colors border border-sky-500/20 shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-3 h-3" /> Nova Ação
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(acoesByPilar).map(([pilarName, pilarAcoes]: [string, Acao[]]) => (
          <div key={pilarName} className="flex flex-col gap-3">
            {/* Pilar Header - FIXO na tela e sem sanfona */}
            <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-lg flex items-center justify-between shadow-sm">
               <h3 className="text-sm font-black text-sky-400 uppercase tracking-wider">{pilarName}</h3>
               <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">{pilarAcoes.length} Ação(ões)</span>
            </div>
            
            {/* Ações listadas diretamente */}
            <div className="space-y-3 pl-4 border-l-2 border-slate-800/50 ml-2">
              {pilarAcoes.map((acao) => {
          const isExpanded = expandedAcoes.has(acao.IDAcao);
          const acaoAtividades = atividades.filter(a => a.Acoes === acao.IDAcao).sort((a, b) => {
            const orderA = parseInt(a.Ordem || '0') || 0;
            const orderB = parseInt(b.Ordem || '0') || 0;
            return orderA - orderB;
          });
          const totalAtiv = acaoAtividades.length;
          const doneAtiv = acaoAtividades.filter(a => a.Status?.trim() === 'Realizado').length;
          const progresso = totalAtiv === 0 ? 0 : Math.round((doneAtiv / totalAtiv) * 100);

          return (
            <div id={`acao-${acao.IDAcao}`} key={acao.IDAcao} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
              {/* Ação Header */}
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors group ${isExpanded ? 'bg-slate-800/80 border-b border-slate-800' : 'hover:bg-slate-800/50'}`}
                onClick={() => toggleAcao(acao.IDAcao)}
              >
                <div className="flex-1 flex items-center gap-4 pr-4">
                  <div className="text-slate-500">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase mb-1 text-slate-500 flex items-center gap-2">
                      <span className="truncate">{acao.Pilar}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700 flex-shrink-0"></span>
                      <span className="flex-shrink-0">{totalAtiv} Atividade{totalAtiv !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-sm font-black text-slate-100 truncate">
                      {acao.NomeAcao}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-40 flex-shrink-0">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${progresso}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-sky-400 w-8 text-right">{progresso}%</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingAcao(acao); setAcaoModalOpen(true); }}
                    className="p-1.5 rounded bg-slate-800/80 hover:bg-sky-500 hover:text-slate-950 text-slate-400 transition-all shadow-sm"
                    title="Editar Ação"
                  ><Edit2 className="w-4 h-4" /></button>
                  <button 
                    onClick={(e) => requestDeleteAcao(acao.IDAcao, e)}
                    className="p-1.5 rounded bg-slate-800/80 hover:bg-rose-500 hover:text-white text-rose-400 transition-all shadow-sm"
                    title="Excluir Ação"
                  ><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Ação Body (Atividades) */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="bg-slate-900/50"
                  >
                    <div className="p-4 pl-12 flex flex-col gap-3">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase">Atividades ({totalAtiv})</h3>
                        <button 
                          onClick={() => { setActiveAcaoId(acao.IDAcao); setEditingAtiv(null); setAtividadeModalOpen(true); }}
                          className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-sky-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Nova Atividade
                        </button>
                      </div>

                      {acaoAtividades.length === 0 && (
                        <div className="text-xs text-slate-500 font-bold bg-slate-950/30 p-4 rounded text-center border border-slate-800/50 border-dashed">
                          Nenhuma atividade vinculada.
                        </div>
                      )}

                      {acaoAtividades.map((ativ, idx) => {
                        const isAtivExpanded = expandedAtividades.has(ativ.IDAtividade);
                        const ativSubatividades = subatividades.filter(s => s.IDAtividade === ativ.IDAtividade).sort((a, b) => {
                          const orderA = parseInt(a.OrdemSub || '0') || 0;
                          const orderB = parseInt(b.OrdemSub || '0') || 0;
                          return orderA - orderB;
                        });

                        const totalSub = ativSubatividades.length;
                        const doneSub = ativSubatividades.filter(s => s.Status?.trim() === 'Realizado').length;
                        const progressoSub = totalSub === 0 ? 0 : Math.round((doneSub / totalSub) * 100);
                        
                        let statusBorderColor = 'border-slate-700';
                        let statusColor = 'text-slate-400';
                        if (ativ.Status?.trim() === 'Realizado') { statusBorderColor = 'border-emerald-500/50'; statusColor = 'text-emerald-400'; }
                        else if (ativ.Status?.trim() === 'Pendente') { statusBorderColor = 'border-amber-500/50'; statusColor = 'text-amber-400'; }
                        else if (ativ.Status?.trim() === 'Em andamento') { statusBorderColor = 'border-sky-500/50'; statusColor = 'text-sky-400'; }
                        else if (ativ.Status?.trim() === 'Travado') { statusBorderColor = 'border-rose-500/50'; statusColor = 'text-rose-400'; }
                        else if (ativ.Status?.trim() === 'Em espera') { statusBorderColor = 'border-fuchsia-500/50'; statusColor = 'text-fuchsia-400'; }
                        
                        const late = isLate(ativ.DataFim, ativ.Status);

                        return (
                          <div id={`ativ-${ativ.IDAtividade}`} key={ativ.IDAtividade} className={`relative group/row border ${isAtivExpanded ? 'border-slate-700' : 'border-slate-800/80'} rounded flex flex-col bg-slate-950/40 transition-colors`}>
                            {idx > 0 && (
                              <div className="absolute -top-1.5 left-0 right-0 h-3 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity z-10">
                                <div className="absolute h-[1px] w-full bg-sky-500/50"></div>
                                <button
                                  onClick={() => insertAtividadeAt(idx, acao.IDAcao, acaoAtividades)}
                                  className="relative bg-slate-900 border border-sky-500/50 text-sky-400 hover:bg-sky-500 hover:text-slate-900 rounded-full p-0.5 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            {/* Atividade Header */}
                            <div 
                              className={`p-3 flex items-start gap-3 cursor-pointer group hover:bg-slate-900/80 transition-colors ${isAtivExpanded ? 'border-b border-slate-800/80' : ''}`}
                              onClick={() => toggleAtividade(ativ.IDAtividade)}
                            >
                              <div className="mt-0.5 text-slate-500 flex-shrink-0">
                                {isAtivExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </div>
                              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5" onClick={e => e.stopPropagation()}>
                                <button onClick={() => moveAtividade(ativ.IDAtividade, 'up', acaoAtividades)} disabled={idx === 0} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowUp className="w-3.5 h-3.5" /></button>
                                <button onClick={() => moveAtividade(ativ.IDAtividade, 'down', acaoAtividades)} disabled={idx === acaoAtividades.length - 1} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowDown className="w-3.5 h-3.5" /></button>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  {late && <span className="inline-flex items-center gap-1 text-[8px] uppercase font-black text-rose-500 bg-rose-500/20 px-1.5 py-0.5 rounded"><AlertTriangle className="w-2.5 h-2.5"/> Atrasado</span>}
                                  
                                  {/* Direct Status Selector */}
                                  <select 
                                    value={ativ.Status || 'Pendente'}
                                    onChange={(e) => { e.stopPropagation(); handleStatusChange(ativ.IDAtividade, e.target.value); }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border outline-none bg-slate-950/80 appearance-none cursor-pointer ${statusBorderColor} ${statusColor}`}
                                  >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Em andamento">Em andamento</option>
                                    <option value="Realizado">Realizado</option>
                                    <option value="Travado">Travado</option>
                                    <option value="Em espera">Em espera</option>
                                  </select>

                                  <span className="bg-slate-900 border border-slate-700 text-sky-400 px-2 py-0.5 rounded text-sm font-semibold uppercase">
                                    Resp: {ativ.Responsavel || '-'}
                                  </span>
                                  <div className="bg-slate-900 border border-slate-700 text-sky-400 px-2 py-0.5 rounded text-sm font-semibold uppercase flex items-center gap-1">
                                    <input 
                                      type="date" 
                                      value={ativ.DataInicio?.split('/').reverse().join('-') || ''} 
                                      onChange={e => {
                                        const dateVal = e.target.value;
                                        const newDate = dateVal ? dateVal.split('-').reverse().join('/') : '';
                                        handleDateChange(ativ.IDAtividade, 'atividades', 'datainicio', newDate);
                                      }}
                                      onClick={e => e.stopPropagation()}
                                      className="bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                    /> 
                                    até 
                                    <input 
                                      type="date" 
                                      value={ativ.DataFim?.split('/').reverse().join('-') || ''} 
                                      onChange={e => {
                                        const dateVal = e.target.value;
                                        const newDate = dateVal ? dateVal.split('-').reverse().join('/') : '';
                                        handleDateChange(ativ.IDAtividade, 'atividades', 'datafim', newDate);
                                      }}
                                      onClick={e => e.stopPropagation()}
                                      className="bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-xs font-black text-slate-200">
                                    {ativ.Atividade}
                                  </div>
                                  {totalSub > 0 && (
                                    <div className="flex items-center gap-3 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/50">
                                      <span className="text-[9px] uppercase font-black text-slate-400">{totalSub} Subativ.</span>
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-sky-500 transition-all" style={{ width: `${progressoSub}%` }} />
                                        </div>
                                        <span className="text-[9px] font-black text-sky-400 w-6">{progressoSub}%</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 transition-opacity flex-shrink-0">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveAcaoId(acao.IDAcao); setEditingAtiv(ativ); setAtividadeModalOpen(true); }}
                                  className="p-1.5 rounded bg-slate-800/50 hover:bg-sky-500 hover:text-slate-950 text-slate-400 transition-all shadow-sm"
                                  title="Editar Atividade"
                                ><Edit2 className="w-4 h-4" /></button>
                                <button 
                                  onClick={(e) => requestDeleteAtiv(ativ.IDAtividade, e)}
                                  className="p-1.5 rounded bg-slate-800/50 hover:bg-rose-500 hover:text-white text-rose-400 transition-all shadow-sm"
                                  title="Excluir Atividade"
                                ><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>

                            {/* Atividade Body (Subatividades & Detalhes) */}
                            <AnimatePresence initial={false}>
                              {isAtivExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                  className="bg-slate-900/30 overflow-hidden"
                                >
                                  <div className="p-4 flex flex-col lg:flex-row gap-6 border-t border-slate-800/50">
                                    {/* Left: Detalhes */}
                                    <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-3 auto-rows-min">
                                      {ativ.Descricao && (
                                        <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60 col-span-1 xl:col-span-2">
                                          <div className="flex items-center gap-1.5 text-[10px] font-black text-sky-500 uppercase mb-1.5"><FileText className="w-3.5 h-3.5" /> Descrição</div>
                                          <div className="text-[11px] font-bold text-slate-300 whitespace-pre-wrap leading-relaxed">{ativ.Descricao}</div>
                                        </div>
                                      )}
                                      {ativ.IndicadorFisico && (
                                        <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60">
                                          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase mb-1.5"><Target className="w-3.5 h-3.5" /> Indicador Físico</div>
                                          <div className="text-[11px] font-bold text-slate-300">{ativ.IndicadorFisico}</div>
                                        </div>
                                      )}
                                      <DiarioBordo id={ativ.IDAtividade} table="atividades" idField="idatividade" rawObservacao={ativ.Observacao} onDataChanged={onDataChanged} />
                                      {ativ.LinkEvidencia && (
                                        <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60 flex items-center col-span-1 xl:col-span-2">
                                          <a 
                                            href={ativ.LinkEvidencia} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-[11px] font-black text-sky-400 hover:text-sky-300 uppercase transition-colors"
                                          >
                                            <div className="p-1.5 bg-sky-500/10 rounded-full"><LinkIcon className="w-3.5 h-3.5" /></div> Ver Evidência
                                          </a>
                                        </div>
                                      )}
                                    </div>

                                    {/* Right: Subatividades Checklist */}
                                    <div className="flex-1 bg-slate-950/50 p-4 rounded border border-slate-800/80">
                                      <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-black text-slate-100 uppercase">Subatividades ({ativSubatividades.length})</h4>
                                        <button 
                                          onClick={() => { setActiveAtividadeId(ativ.IDAtividade); setEditingSub(null); setSubModalOpen(true); }}
                                          className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-sky-400 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" /> Add
                                        </button>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        {ativSubatividades.map((sub, idx) => {
                                          const isDone = sub.Status?.trim() === 'Realizado';
                                          const isSubExpanded = expandedSubatividades.has(sub.IDSubatividade);
                                          const subLate = isLate(sub.DataFim, sub.Status);
                                          
                                          let statusBorderColor = 'border-slate-700';
                                          let statusColor = 'text-slate-400';
                                          if (sub.Status?.trim() === 'Realizado') { statusBorderColor = 'border-emerald-500/50'; statusColor = 'text-emerald-400'; }
                                          else if (sub.Status?.trim() === 'Pendente') { statusBorderColor = 'border-amber-500/50'; statusColor = 'text-amber-400'; }
                                          else if (sub.Status?.trim() === 'Em andamento') { statusBorderColor = 'border-sky-500/50'; statusColor = 'text-sky-400'; }
                                          else if (sub.Status?.trim() === 'Travado') { statusBorderColor = 'border-rose-500/50'; statusColor = 'text-rose-400'; }
                                          else if (sub.Status?.trim() === 'Em espera') { statusBorderColor = 'border-fuchsia-500/50'; statusColor = 'text-fuchsia-400'; }

                                          return (
                                            <div id={`sub-${sub.IDSubatividade}`} key={sub.IDSubatividade} className="relative group/row">
                                              {idx > 0 && (
                                                <div className="absolute -top-1.5 left-0 right-0 h-3 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity z-10">
                                                  <div className="absolute h-[1px] w-full bg-sky-500/50"></div>
                                                  <button 
                                                    onClick={() => insertSubatividadeAt(idx, ativ.IDAtividade, ativSubatividades)}
                                                    className="relative bg-slate-900 border border-sky-500/50 text-sky-400 hover:bg-sky-500 hover:text-slate-900 rounded-full p-0.5 transition-colors"
                                                  >
                                                    <Plus className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              )}
                                              <div 
                                                className={`flex flex-col group p-3 rounded bg-slate-950/40 hover:bg-slate-900/80 transition-colors border ${isSubExpanded ? 'border-slate-700' : 'border-slate-800/80 hover:border-slate-700'}`}
                                                onClick={() => toggleSubatividade(sub.IDSubatividade)}
                                                style={{ cursor: 'pointer' }}
                                              >
                                                <div className="flex items-start gap-3">
                                                  <div className="mt-1 text-slate-500 flex-shrink-0">
                                                    {isSubExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                  </div>
                                                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => moveSubatividade(sub.IDSubatividade, 'up', ativSubatividades)} disabled={idx === 0} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowUp className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => moveSubatividade(sub.IDSubatividade, 'down', ativSubatividades)} disabled={idx === ativSubatividades.length - 1} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowDown className="w-3.5 h-3.5" /></button>
                                                  </div>
                                                  
                                                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      {subLate && <span className="inline-flex items-center gap-1 text-[8px] uppercase font-black text-rose-500 bg-rose-500/20 px-1.5 py-0.5 rounded"><AlertTriangle className="w-2.5 h-2.5"/> Atrasado</span>}
                                                      
                                                      <select
                                                        value={sub.Status || 'Pendente'}
                                                        onChange={(e) => { e.stopPropagation(); handleSubStatusChange(sub.IDSubatividade, e.target.value); }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border outline-none bg-slate-950/80 appearance-none cursor-pointer ${statusBorderColor} ${statusColor}`}
                                                      >
                                                        <option value="Pendente">Pendente</option>
                                                        <option value="Em andamento">Em andamento</option>
                                                        <option value="Realizado">Realizado</option>
                                                        <option value="Travado">Travado</option>
                                                        <option value="Cancelado">Cancelado</option>
                                                        <option value="Em espera">Em espera</option>
                                                      </select>
                    
                                                      <span className="bg-slate-900 border border-slate-700 text-sky-400 px-2 py-0.5 rounded text-xs font-semibold uppercase">
                                                        Resp: {sub.Responsavel || '-'}
                                                      </span>
                                                      <div className="bg-slate-900 border border-slate-700 text-sky-400 px-2 py-0.5 rounded text-xs font-semibold uppercase flex items-center gap-1">
                                                        <input 
                                                          type="date" 
                                                          value={sub.DataInicio?.split('/').reverse().join('-') || ''} 
                                                          onChange={e => {
                                                            const dateVal = e.target.value;
                                                            const newDate = dateVal ? dateVal.split('-').reverse().join('/') : '';
                                                            handleDateChange(sub.IDSubatividade, 'subatividades', 'datainicio', newDate);
                                                          }}
                                                          onClick={e => e.stopPropagation()}
                                                          className="bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                                        />
                                                        até 
                                                        <input 
                                                          type="date" 
                                                          value={sub.DataFim?.split('/').reverse().join('-') || ''} 
                                                          onChange={e => {
                                                            const dateVal = e.target.value;
                                                            const newDate = dateVal ? dateVal.split('-').reverse().join('/') : '';
                                                            handleDateChange(sub.IDSubatividade, 'subatividades', 'datafim', newDate);
                                                          }}
                                                          onClick={e => e.stopPropagation()}
                                                          className="bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                                        />
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      <div className={`text-sm md:text-base font-bold leading-tight mt-1 ${isDone ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                                                        {sub.Subatividade}
                                                      </div>
                                                      {!isSubExpanded && (
                                                        <div className="flex items-center gap-1.5 mt-1 ml-2">
                                                          {sub.LinkEvidencia && (
                                                            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded flex items-center gap-1" title="Contém Evidência">🔗 Evidência</span>
                                                          )}
                                                          {(sub.Observacao && parseObservacao(sub.Observacao).length > 0) && (
                                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1" title="Contém Observação">💬 Observação</span>
                                                          )}
                                                          {sub.IndicadorFisico && (
                                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1" title="Contém Indicador Físico">🎯 Ind. Físico</span>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); setActiveAtividadeId(ativ.IDAtividade); setEditingSub(sub); setSubModalOpen(true); }}
                                                      className="p-1.5 rounded bg-slate-900/50 hover:bg-sky-500 hover:text-slate-950 text-slate-400 transition-all shadow-sm"
                                                      title="Editar Subatividade"
                                                    ><Edit2 className="w-4 h-4" /></button>
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); requestDeleteSub(sub.IDSubatividade, e); }}
                                                      className="p-1.5 rounded bg-slate-900/50 hover:bg-rose-500 hover:text-white text-rose-400 transition-all shadow-sm"
                                                      title="Excluir Subatividade"
                                                    ><Trash2 className="w-4 h-4" /></button>
                                                  </div>
                                                </div>

                                                <AnimatePresence>
                                                  {isSubExpanded && (
                                                    <motion.div
                                                      initial={{ height: 0, opacity: 0 }}
                                                      animate={{ height: 'auto', opacity: 1 }}
                                                      exit={{ height: 0, opacity: 0 }}
                                                      transition={{ duration: 0.2 }}
                                                      className="overflow-hidden"
                                                    >
                                                      <div className="pt-4 pl-10 pr-2 pb-2 space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
                                                        {sub.Descricao && (
                                                          <div className="text-xs text-slate-300">
                                                            <strong className="text-slate-500 block mb-1">Descrição</strong>
                                                            <p className="whitespace-pre-wrap">{sub.Descricao}</p>
                                                          </div>
                                                        )}
                                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                          {sub.IndicadorFisico && (
                                                            <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                                                              <strong className="text-[10px] uppercase font-black text-emerald-400 flex items-center gap-1 mb-2"><Target className="w-3 h-3"/> Indicador Físico</strong>
                                                              <p className="text-xs text-slate-300 whitespace-pre-wrap">{sub.IndicadorFisico}</p>
                                                            </div>
                                                          )}
                                                          <DiarioBordo id={sub.IDSubatividade} table="subatividades" idField="idsubatividade" rawObservacao={sub.Observacao} onDataChanged={onDataChanged} />
                                                        </div>
                                                        {sub.LinkEvidencia && (
                                                          <div className="mt-2">
                                                            <a href={sub.LinkEvidencia} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-900 rounded border border-sky-500/30 font-bold text-xs transition-colors">
                                                              <LinkIcon className="w-3 h-3" /> Abrir Link de Evidência <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </div>
                                            </div>
                                          );
                                        })}
                                        {ativSubatividades.length === 0 && (
                                          <div className="text-[9px] text-slate-500 font-bold text-center py-2 opacity-50">
                                            Nenhuma subatividade.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
            </div>
          </div>
        ))}
        {acoes.length === 0 && (
          <div className="text-sm font-bold text-slate-500 text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
            Nenhuma Ação cadastrada. Clique em "+ Nova Ação" para começar.
          </div>
        )}
      </div>

      <AcaoModal 
        isOpen={acaoModalOpen} 
        onClose={() => setAcaoModalOpen(false)} 
        onSuccess={() => { setAcaoModalOpen(false); onDataChanged(); }} 
        initialData={editingAcao}
        pilares={Array.from(new Set(acoes.map(a => a.Pilar).filter(Boolean) as string[]))}
      />
      <AtividadeModal 
        isOpen={atividadeModalOpen} 
        onClose={() => { setAtividadeModalOpen(false); setInsertOrderAtiv(null); }} 
        onSuccess={() => { setAtividadeModalOpen(false); setInsertOrderAtiv(null); onDataChanged(); }} 
        initialData={editingAtiv}
        acaoId={activeAcaoId || ''}
        initialOrdem={insertOrderAtiv}
      />
      <SubatividadeModal 
        isOpen={subModalOpen} 
        onClose={() => { setSubModalOpen(false); setInsertOrderSub(null); }} 
        onSuccess={() => { setSubModalOpen(false); setInsertOrderSub(null); onDataChanged(); }} 
        initialData={editingSub}
        atividadeId={activeAtividadeId || ''}
        initialOrdemSub={insertOrderSub}
      />

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
      />
    </section>
  );
}
