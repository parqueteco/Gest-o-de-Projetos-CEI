import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MessageSquare, Plus, Clock, Edit2, Trash2 } from 'lucide-react';

export interface LogEntry {
  date: string;
  text: string;
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

interface DiarioBordoProps {
  id: string;
  table: 'atividades' | 'subatividades';
  idField: 'idatividade' | 'idsubatividade';
  rawObservacao?: string;
  onDataChanged: () => void;
}

export function DiarioBordo({ id, table, idField, rawObservacao, onDataChanged }: DiarioBordoProps) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const [localLogs, setLocalLogs] = React.useState<LogEntry[]>(parseObservacao(rawObservacao));

  React.useEffect(() => {
    setLocalLogs(parseObservacao(rawObservacao));
  }, [rawObservacao]);

  const logs = localLogs;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    
    const newLog: LogEntry = {
      date: new Date().toISOString(),
      text: newNote.trim()
    };
    
    const updatedLogs = [newLog, ...logs];
    const newObservacao = JSON.stringify(updatedLogs);
    
    // Optimistic UI update
    setLocalLogs(updatedLogs);

    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) throw error;
      setNewNote('');
      onDataChanged();
    } catch (err) {
      setLocalLogs(logs); // revert
      console.error(err);
      alert('Erro ao adicionar nota.');
    } finally {
      setIsSubmitting(false);
    }
  };

    const handleDelete = async (indexToDelete: number) => {
    console.log("Tentando deletar nota index:", indexToDelete, "id do item:", id, "table:", table);
    setIsSubmitting(true);
    setConfirmDeleteIndex(null);
    
    const updatedLogs = logs.filter((_, i) => i !== indexToDelete);
    const newObservacao = updatedLogs.length > 0 ? JSON.stringify(updatedLogs) : '';
    
    // Atualização otimista do state
    setLocalLogs(updatedLogs);
    
    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) {
        console.error("Erro ao deletar no Supabase:", error);
        throw error;
      }
      onDataChanged();
    } catch (err: any) {
      // Reverte alteração otimista
      setLocalLogs(logs);
      console.error("Erro ao deletar no Supabase:", err);
      alert('Erro ao excluir nota: ' + (err.message || 'Falha na comunicação com o banco'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (index: number) => {
    if (!editValue.trim()) return;
    setIsSubmitting(true);
    
    const updatedLogs = [...logs];
    updatedLogs[index] = { ...updatedLogs[index], text: editValue.trim() };
    const newObservacao = JSON.stringify(updatedLogs);
    
    // Optimistic UI update
    setLocalLogs(updatedLogs);

    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) throw error;
      setEditingIndex(null);
      setEditValue('');
      onDataChanged();
    } catch (err) {
      setLocalLogs(logs); // revert
      console.error(err);
      alert('Erro ao editar nota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `[${day}/${month}/${year} - ${hours}:${minutes}]`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-slate-950/40 p-4 rounded border border-slate-800/60 mt-3 flex flex-col col-span-1 xl:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase"><MessageSquare className="w-3.5 h-3.5" /> Diário de Bordo / Histórico</div>
      </div>
      
      {/* Input area */}
      <div className="flex gap-2 mb-4">
        <input 
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Adicione uma atualização (ex: Reunião realizada hoje...)"
          className="flex-1 bg-slate-900 border border-slate-700/50 p-2 rounded text-xs text-slate-200 outline-none focus:border-amber-500/50 transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddNote();
          }}
        />
        <button 
          onClick={handleAddNote}
          disabled={isSubmitting || !newNote.trim()}
          className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-900 border border-amber-500/30 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:hover:bg-amber-500/10 disabled:hover:text-amber-500"
        >
          {isSubmitting ? 'Enviando...' : <><Plus className="w-3 h-3" /> Adicionar</>}
        </button>
      </div>
      
      {/* Timeline */}
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar" onClick={e => e.stopPropagation()}>
        {logs.length === 0 ? (
          <div className="text-xs text-slate-500 italic">Nenhuma observação registrada.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex flex-col gap-1 border-l-2 border-amber-500/20 pl-3 py-1 relative group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(log.date)}</span>
                {editingIndex !== index && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingIndex(index); setEditValue(log.text); }}
                      className="p-1 text-slate-500 hover:text-sky-400 transition-colors bg-slate-900/80 rounded"
                      title="Editar"
                    ><Edit2 className="w-3 h-3" /></button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteIndex(index); }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors bg-slate-900/80 rounded"
                      title="Excluir"
                    ><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
              
              {confirmDeleteIndex === index && (
                <div className="flex items-center gap-2 mt-1 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                  <span className="text-xs text-rose-400 font-bold">Excluir este registro?</span>
                  <div className="ml-auto flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteIndex(null); }} className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200">Não</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(index); }} disabled={isSubmitting} className="px-2 py-1 text-[10px] font-bold bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors disabled:opacity-50">Sim, excluir</button>
                  </div>
                </div>
              )}
              
              {editingIndex === index ? (
                <div className="flex flex-col gap-2 mt-1">
                  <textarea 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/50 p-2 rounded text-xs text-slate-200 outline-none focus:border-sky-500/50 resize-y min-h-[60px]"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button 
                      onClick={() => setEditingIndex(null)}
                      className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200"
                    >Cancelar</button>
                    <button 
                      onClick={() => handleSaveEdit(index)}
                      disabled={isSubmitting}
                      className="px-3 py-1 text-[10px] font-bold bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-900 rounded border border-sky-500/30 transition-colors disabled:opacity-50"
                    >{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300 whitespace-pre-wrap">{log.text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
