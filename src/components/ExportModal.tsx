import React, { useState, useMemo } from 'react';
import { X, FileText, Table, Download, CheckCircle2 } from 'lucide-react';
import { Acao, Atividade, Subatividade } from '../types';
import * as XLSX from 'xlsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  onGenerateReport: (printData: any, pilarFilter: string, metaFilter: string, respFilter: string, includeLogs: boolean) => void;
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

const getLatestLogFormatted = (obs?: string) => {
  if (!obs) return '';
  try {
    const parsed = JSON.parse(obs);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sorted = parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      const d = new Date(latest.date);
      const dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
      let author = '';
      if (latest.user) author = ` - ${latest.user}`;
      return `Nota [${dStr}${author}]: ${latest.text}`;
    }
  } catch (e) {
    return `Nota: ${obs}`;
  }
  return '';
};

export function ExportModal({ isOpen, onClose, acoes, atividades, subatividades, onGenerateReport }: ExportModalProps) {
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [pilarFilter, setPilarFilter] = useState<string>('all');
  const [metaFilter, setMetaFilter] = useState<string>('all');
  const [respFilter, setRespFilter] = useState<string>('all');
  const [includeLogs, setIncludeLogs] = useState<boolean>(true);

  const { pilares, metas, responsaveis } = useMemo(() => {
    const pilarSet = new Set<string>();
    const metaSet = new Set<string>();
    acoes.forEach(a => { 
      if (a.Pilar) pilarSet.add(a.Pilar.trim());
      if (a.MetaFinep) {
        a.MetaFinep.split(',').forEach(m => {
          const metaName = m.trim();
          if (metaName) metaSet.add(metaName);
        });
      }
    });
    
    const respSet = new Set<string>();
    const addResp = (r?: string) => {
      if (!r) return;
      r.split(',').forEach(x => {
        const name = x.trim();
        if (name && name.toLowerCase() !== 'sem responsável' && name.toLowerCase() !== 'pendente') {
          respSet.add(name);
        }
      });
    };
    atividades.forEach(a => addResp(a.Responsavel));
    subatividades.forEach(s => addResp(s.Responsavel));
    
    return {
      pilares: Array.from(pilarSet).sort(),
      metas: Array.from(metaSet).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
      }),
      responsaveis: Array.from(respSet).sort((a, b) => a.localeCompare(b))
    };
  }, [acoes, atividades, subatividades]);

  const handleExport = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const filteredAtividades = atividades.filter(a => {
      const acao = acoes.find(ac => ac.IDAcao === a.Acoes);
      if (respFilter !== 'all') {
        const resps = (a.Responsavel || '').toLowerCase();
        if (!resps.includes(respFilter.toLowerCase())) return false;
      }
      if (pilarFilter !== 'all') {
        if (acao?.Pilar?.trim() !== pilarFilter) return false;
      }
      if (metaFilter !== 'all') {
        const metasStr = acao?.MetaFinep || '';
        const hasMeta = metasStr.split(',').map(m => m.trim()).includes(metaFilter);
        if (!hasMeta) return false;
      }
      return true;
    });

    const filteredSubatividades = subatividades.filter(s => {
      const parentAtiv = atividades.find(a => a.IDAtividade === s.IDAtividade);
      const acao = acoes.find(ac => ac.IDAcao === parentAtiv?.Acoes);

      if (respFilter !== 'all') {
        const resps = (s.Responsavel || '').toLowerCase();
        if (!resps.includes(respFilter.toLowerCase())) return false;
      }
      if (pilarFilter !== 'all') {
        if (acao?.Pilar?.trim() !== pilarFilter) return false;
      }
      if (metaFilter !== 'all') {
        const metasStr = acao?.MetaFinep || '';
        const hasMeta = metasStr.split(',').map(m => m.trim()).includes(metaFilter);
        if (!hasMeta) return false;
      }
      return true;
    });

    if (format === 'excel') {
      exportToExcel(filteredAtividades, filteredSubatividades);
    } else {
      const data = preparePrintData(filteredAtividades, filteredSubatividades, today);
      onGenerateReport(data, pilarFilter, metaFilter, respFilter, includeLogs);
    }
  };

  const preparePrintData = (fAtividades: Atividade[], fSubatividades: Subatividade[], today: Date) => {
    let concluidas = 0;
    let emAndamento = 0;
    let atrasadas = 0;
    const allTasks: any[] = [];

    const processItem = (task: any, isSub: boolean) => {
      let acaoObj = null;
      let atividadeObj = null;
      
      if (isSub) {
        atividadeObj = atividades.find(a => String(a.IDAtividade) === String(task.IDAtividade));
        if (atividadeObj) acaoObj = acoes.find(a => String(a.IDAcao) === String(atividadeObj.Acoes));
      } else {
        acaoObj = acoes.find(a => String(a.IDAcao) === String(task.Acoes));
      }

      const isDoneStatus = isDone(task.Status);
      const dataFim = parseDateBR(task.DataFim);
      
      let diasAtraso = 0;
      let dueInNext7Days = false;

      if (dataFim && !isDoneStatus) {
        const diffDays = Math.floor((dataFim.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 0) {
          diasAtraso = Math.abs(diffDays);
        } else if (diffDays <= 7) {
          dueInNext7Days = true;
        }
      }

      const isOverdue = diasAtraso > 0;
      const isTravado = (task.Status || '').toLowerCase().includes('travad');
      const isCritical = isOverdue || isTravado || (task.Status || '').toLowerCase().includes('atrasad');

      if (isDoneStatus) {
        concluidas++;
      } else if (isCritical) {
        atrasadas++;
      } else {
        emAndamento++;
      }
      
      let finalMeta = acaoObj?.Pilar?.trim();
      if (!finalMeta || finalMeta === '0') finalMeta = 'OUTRAS DEMANDAS';

      let finalAcao = acaoObj?.NomeAcao?.trim();
      if (!finalAcao) finalAcao = 'Ações Gerais';

      allTasks.push({
        metaRaw: finalMeta,
        acaoRaw: finalAcao,
        ativSub: isSub ? task.Subatividade : (task.Atividade || ''),
        resp: task.Responsavel || '',
        prazo: task.DataFim || '',
        status: task.Status || 'Pendente',
        indicador: task.IndicadorFisico || '',
        log: getLatestLogFormatted(task.Observacao),
        isSub,
        isCritical,
        isDone: isDoneStatus,
        dueInNext7Days,
        diasAtraso,
        id: isSub ? task.IDSubatividade : task.IDAtividade,
        parentAtivId: isSub ? task.IDAtividade : null,
      });
    };

    fAtividades.forEach(a => processItem(a, false));
    fSubatividades.forEach(s => processItem(s, true));

    allTasks.sort((a, b) => {
      if (a.metaRaw !== b.metaRaw) return a.metaRaw.localeCompare(b.metaRaw);
      if (a.acaoRaw !== b.acaoRaw) return a.acaoRaw.localeCompare(b.acaoRaw);
      
      if (a.isSub && !b.isSub && a.parentAtivId === b.id) return 1;
      if (!a.isSub && b.isSub && a.id === b.parentAtivId) return -1;
      
      return 0;
    });

    const metaGroups: Record<string, any[]> = {};
    allTasks.forEach(t => {
      if (!metaGroups[t.metaRaw]) metaGroups[t.metaRaw] = [];
      metaGroups[t.metaRaw].push(t);
    });

    return {
      metaGroups,
      stats: {
        total: allTasks.length,
        concluidas,
        emAndamento,
        atrasadas,
        percConc: allTasks.length > 0 ? Math.round((concluidas / allTasks.length) * 100) : 0
      }
    };
  };

  const exportToExcel = (fAtividades: Atividade[], fSubatividades: Subatividade[]) => {
    const rows: any[] = [];
    
    const processRow = (task: any, isSub: boolean) => {
      let acaoObj = null;
      let atividadeObj = null;
      
      if (isSub) {
        atividadeObj = atividades.find(a => String(a.IDAtividade) === String(task.IDAtividade));
        if (atividadeObj) acaoObj = acoes.find(a => String(a.IDAcao) === String(atividadeObj.Acoes));
      } else {
        acaoObj = acoes.find(a => String(a.IDAcao) === String(task.Acoes));
      }
      
      let finalMeta = acaoObj?.Pilar?.trim();
      if (!finalMeta || finalMeta === '0') finalMeta = 'OUTRAS DEMANDAS';

      rows.push({
        'Nível': isSub ? 'Subatividade' : 'Atividade',
        'Pilar Temático': finalMeta,
        'Meta(s)': acaoObj?.MetaFinep || 'N/A',
        'Ação': acaoObj?.NomeAcao || 'Ações Gerais',
        'Tarefa': isSub ? task.Subatividade : task.Atividade,
        'Descrição': task.Descricao || '',
        'Responsável': task.Responsavel || '',
        'Status': task.Status || 'Pendente',
        'Prazo Final': task.DataFim || '',
        'Entregável': task.IndicadorFisico || '',
        'Diário de Bordo': getLatestLogFormatted(task.Observacao)
      });
    };

    fAtividades.forEach(a => processRow(a, false));
    fSubatividades.forEach(s => processRow(s, true));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    XLSX.writeFile(workbook, 'relatorio_gestao_projetos.xlsx');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative z-10">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">Exportar Relatório</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          {/* Formato */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Formato de Exportação</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('pdf')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors font-bold text-sm ${
                  format === 'pdf' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <FileText className="w-5 h-5" /> Visualizar Relatório
              </button>
              <button
                onClick={() => setFormat('excel')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors font-bold text-sm ${
                  format === 'excel' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <Table className="w-5 h-5" /> Planilha Excel
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Filtrar por Pilar</label>
              <select 
                value={pilarFilter}
                onChange={(e) => setPilarFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">Todos os Pilares</option>
                {pilares.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Filtrar por Meta</label>
              <select 
                value={metaFilter}
                onChange={(e) => setMetaFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">Todas as Metas</option>
                {metas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Filtrar por Responsável</label>
              <select 
                value={respFilter}
                onChange={(e) => setRespFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">Todos os Membros</option>
                {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Opções */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={includeLogs}
                  onChange={(e) => setIncludeLogs(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  includeLogs ? 'bg-sky-500 border-sky-500' : 'bg-slate-950 border-slate-700 group-hover:border-slate-600'
                }`}>
                  {includeLogs && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-300">Incluir Diário de Bordo</span>
                <span className="text-[10px] text-slate-500">Adiciona o último comentário registrado na atividade</span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleExport}
            className={`px-6 py-2 rounded font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-2 ${
              format === 'pdf' ? 'bg-sky-500 hover:bg-sky-400 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            <>
              {format === 'pdf' ? <FileText className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {format === 'pdf' ? 'VISUALIZAR RELATÓRIO' : 'BAIXAR EXCEL'}
            </>
          </button>
        </div>
      </div>
    </div>
  );
}
