import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Acao, Atividade, Subatividade } from '../types';

interface DashboardProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  headerAction?: React.ReactNode;
}

const getResponsaveis = (respString?: string | null) => {
  if (!respString) return ['Sem Responsável'];
  return respString.split(',').map(r => r.trim()).filter(Boolean);
};

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

export const isLate = (dataFim?: string, status?: string) => {
  const currentStatus = status?.trim().toLowerCase() || 'pendente';
  if (currentStatus === 'realizado' || currentStatus === 'concluído' || currentStatus === 'concluido' || currentStatus === 'finalizado') return false;
  
  const date = parseDateBR(dataFim);
  if (!date) return false;
  date.setHours(23, 59, 59, 999);
  return date.getTime() < new Date().getTime();
};

export default function Dashboard({ acoes, atividades, subatividades, headerAction }: DashboardProps) {
  const [viewMode, setViewMode] = useState<'Atividades' | 'Subatividades' | 'Todas'>('Todas');

  const combinedTasks = useMemo(() => {
    if (viewMode === 'Atividades') return atividades;
    if (viewMode === 'Subatividades') return subatividades;
    return [...atividades, ...subatividades];
  }, [atividades, subatividades, viewMode]);

  const statusCounts = useMemo(() => {
    const counts = combinedTasks.reduce((acc, task) => {
      const status = task.Status?.trim() || 'Desconhecido';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [combinedTasks]);

  const respData = useMemo(() => {
    const respMap = combinedTasks.reduce((acc, task) => {
      const responsaveis = getResponsaveis(task.Responsavel);
      const status = task.Status?.trim() || 'Desconhecido';
      
      responsaveis.forEach(resp => {
        if (!acc[resp]) acc[resp] = { Responsavel: resp, Total: 0, Realizado: 0, Pendente: 0, Outros: 0 };
        
        acc[resp].Total++;
        if (status === 'Realizado') acc[resp].Realizado++;
        else if (status === 'Pendente') acc[resp].Pendente++;
        else acc[resp].Outros++;
      });
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(respMap).sort((a, b) => b.Total - a.Total);
  }, [combinedTasks]);

  const STATUS_COLORS: Record<string, string> = {
    'Realizado': '#10b981',
    'Em andamento': '#38bdf8',
    'Pendente': '#f59e0b',
    'Travado': '#ef4444',
    'Em espera': '#d946ef',
    'Desconhecido': '#64748b'
  };

  const totalAtividades = atividades.length;
  const realizadas = atividades.filter(a => a.Status?.trim() === 'Realizado').length;
  const progressPercent = totalAtividades ? Math.round((realizadas / totalAtividades) * 100) : 0;
  
  const atrasadasAtividades = atividades.filter(a => isLate(a.DataFim, a.Status)).length;
  const atrasadasSubatividades = subatividades.filter(s => isLate(s.DataFim, s.Status)).length;
  const totalAtrasadas = atrasadasAtividades + atrasadasSubatividades;

  // Global counts for all tasks (Atividades + Subatividades) to display on cards
  const allTasks = [...atividades, ...subatividades];
  const totalConcluidas = allTasks.filter(t => t.Status?.trim() === 'Realizado').length;
  const totalPendentes = allTasks.filter(t => t.Status?.trim() === 'Pendente').length;
  const totalAndamento = allTasks.filter(t => t.Status?.trim() === 'Em andamento').length;
  const totalTravadas = allTasks.filter(t => t.Status?.trim() === 'Travado').length;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header: Dashboard KPIs */}
      <header className="flex flex-col gap-6 flex-shrink-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-12 items-end flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Ações Totais</p>
              <p className="text-4xl font-black text-slate-100">{acoes.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Total Atividades</p>
              <p className="text-4xl font-black text-slate-100">{atividades.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Total Subatividades</p>
              <p className="text-4xl font-black text-slate-100">{subatividades.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Tarefas Atrasadas</p>
              <p className={`text-4xl font-black ${totalAtrasadas > 0 ? 'text-rose-500' : 'text-slate-100'}`}>{totalAtrasadas}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Progresso Geral</p>
              <p className="text-4xl font-black text-sky-400">{progressPercent}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400">Dashboard de Gestão</p>
            <div className="h-1 w-24 bg-sky-500 ml-auto mt-2"></div>
          </div>
        </div>
        
        {/* Quick Status Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-500">Concluídas</span>
            <span className="text-2xl font-black text-emerald-400">{totalConcluidas}</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-500">Pendentes</span>
            <span className="text-2xl font-black text-amber-400">{totalPendentes}</span>
          </div>
          <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-lg flex items-center justify-between">
            <span className="text-xs font-black uppercase text-sky-500">Em Andamento</span>
            <span className="text-2xl font-black text-sky-400">{totalAndamento}</span>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg flex items-center justify-between">
            <span className="text-xs font-black uppercase text-rose-500">Travadas</span>
            <span className="text-2xl font-black text-rose-400">{totalTravadas}</span>
          </div>
        </div>
      </header>

      {/* Charts Section */}
      <section className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('Atividades')}
              className={`px-4 py-1.5 text-xs font-black uppercase rounded-md transition-colors ${viewMode === 'Atividades' ? 'bg-slate-700 text-slate-50' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Apenas Atividades
            </button>
            <button
              onClick={() => setViewMode('Subatividades')}
              className={`px-4 py-1.5 text-xs font-black uppercase rounded-md transition-colors ${viewMode === 'Subatividades' ? 'bg-slate-700 text-slate-50' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Apenas Subatividades
            </button>
            <button
              onClick={() => setViewMode('Todas')}
              className={`px-4 py-1.5 text-xs font-black uppercase rounded-md transition-colors ${viewMode === 'Todas' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Todas (Ativ. + Subativ.)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-lg flex flex-col min-h-0">
            <h3 className="text-xs font-black uppercase tracking-tighter mb-4 text-slate-400">Status</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS['Desconhecido']} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} itemStyle={{ color: '#f1f5f9' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-lg flex flex-col min-h-0">
            <h3 className="text-xs font-black uppercase tracking-tighter mb-4 text-slate-400">Conclusão por Responsável</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={respData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="Responsavel" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Bar dataKey="Realizado" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Pendente" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Outros" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
