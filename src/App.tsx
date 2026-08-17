/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  ListTree,
  Filter,
  Clock,
  Briefcase,
  Users,
  Target,
  AlertTriangle,
  Sun,
  Moon,
  Laptop,
  LogOut,
  Settings
} from 'lucide-react';
import { Acao, Atividade, Subatividade } from './types';
import Dashboard, { isLate } from './components/Dashboard';
import HierarchyView from './components/HierarchyView';
import { ControlePrazos } from './components/ControlePrazos';
import { ControlePrazos } from './components/ControlePrazos';
import { supabase } from './lib/supabaseClient';
import { Login } from './components/Login';
import { UserProfileModal } from './components/UserProfileModal';
import { Notifications } from './components/Notifications';

export interface TargetHighlight {
  acaoId: string | null;
  atividadeId: string | null;
  subatividadeId: string | null;
  comentarioId: string | null;
  timestamp: number;
}

export default function App() {
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [subatividades, setSubatividades] = useState<Subatividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy' | 'prazos'>('dashboard');
  const [targetHighlight, setTargetHighlight] = useState<TargetHighlight | null>(null);

  const handleNotificationClick = (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null, comentarioId: string | null = null) => {
    setActiveTab('hierarchy');
    setTargetHighlight({ acaoId, atividadeId, subatividadeId, comentarioId, timestamp: Date.now() });
  };
  const [theme, setTheme] = useState<'navy' | 'light' | 'oled'>(() => {
    return (localStorage.getItem('app-theme') as 'navy' | 'light' | 'oled') || 'navy';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.body.classList.remove('theme-light', 'theme-oled', 'theme-navy');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);
  
  // Filters
  const [selectedPilares, setSelectedPilares] = useState<string[]>([]);
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedMetas, setSelectedMetas] = useState<string[]>([]);
  const [showAtrasados, setShowAtrasados] = useState(false);

  const METAS_FINEP = [
    "Meta 1: Plano Marechal Inova",
    "Meta 2: Infraestrutura e Marketing",
    "Meta 3: Divulgação Estratégica Universitária",
    "Meta 5: Inovação Aberta",
    "Meta 6: Promoção de Negócios",
    "Meta 7: Inovação no Setor Público",
    "Meta 8: Branding e Conexões",
    "Meta 9: Sensibilização e Engajamento",
    "Meta 10: Prospecção de Parceiros",
    "Meta 11: Incubação e Aceleração"
  ];

  const loadData = async (showLoadingIndicator = true, retryCount = 0) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const [
        { data: acoesData, error: acoesErr },
        { data: ativData, error: ativErr },
        { data: subData, error: subErr }
      ] = await Promise.all([
        supabase.from('acoes').select('*'),
        supabase.from('atividades').select('*'),
        supabase.from('subatividades').select('*')
      ]);

      if (acoesErr) throw acoesErr;
      if (ativErr) throw ativErr;
      if (subErr) throw subErr;

      console.log('Raw Supabase acoesData:', acoesData);
      console.log('Raw Supabase ativData:', ativData);
      console.log('Raw Supabase subData:', subData);

      // Helper function to map lowercased postgres columns to PascalCase expected by our types
      const normalizeKeys = (items: any[], expectedKeys: string[]) => {
        if (!items) return [];
        return items.map(item => {
          const normalized: any = { ...item };
          const itemKeys = Object.keys(item);
          for (const expected of expectedKeys) {
            const foundKey = itemKeys.find(k => k.toLowerCase() === expected.toLowerCase());
            if (foundKey) {
              normalized[expected] = item[foundKey];
            }
          }
          return normalized;
        });
      };

      const acoesKeys = ['IDAcao', 'Pilar', 'NomeAcao', 'Atividade', 'MetaFinep', 'RubricaOrcamentaria', 'ValorEstimado'];
      const ativKeys = ['IDAtividade', 'Acoes', 'Ordem', 'Atividade', 'Descricao', 'IndicadorFisico', 'DataInicio', 'DataFim', 'Responsavel', 'Status', 'Observacao', 'LinkEvidencia'];
      const subKeys = ['IDSubatividade', 'IDAtividade', 'OrdemSub', 'Subatividade', 'Descricao', 'DataInicio', 'DataFim', 'Responsavel', 'Status', 'Observacao', 'LinkEvidencia', 'IndicadorFisico'];

      const mappedAcoes = normalizeKeys(acoesData, acoesKeys) as Acao[];
      const mappedAtividades = normalizeKeys(ativData, ativKeys) as Atividade[];
      const mappedSubatividades = normalizeKeys(subData, subKeys) as Subatividade[];

      console.log('Mapped Ações:', mappedAcoes);
      console.log('Mapped Atividades:', mappedAtividades);
      console.log('Mapped Subatividades:', mappedSubatividades);

      setAcoes(mappedAcoes);
      setAtividades(mappedAtividades);
      setSubatividades(mappedSubatividades);
    } catch (error: any) {
      console.error("Error loading Supabase data:", error);
      
      // Handle JWT issued at future error (clock skew between auth and db)
      if (error.code === 'PGRST303' && retryCount < 3) {
        console.log(`Retrying loadData due to PGRST303 (attempt ${retryCount + 1})...`);
        setTimeout(() => loadData(false, retryCount + 1), 1000);
        return;
      }
      
      alert("Erro ao carregar dados do banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time changes for subatividades
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subatividades' },
        (payload) => {
          console.log('Change received!', payload)
          
          const subKeys = ['IDSubatividade', 'IDAtividade', 'OrdemSub', 'Subatividade', 'Descricao', 'DataInicio', 'DataFim', 'Responsavel', 'Status', 'Observacao', 'LinkEvidencia', 'IndicadorFisico'];
          const normalizeItem = (item: any) => {
            const normalized: any = { ...item };
            const itemKeys = Object.keys(item);
            for (const expected of subKeys) {
              const foundKey = itemKeys.find(k => k.toLowerCase() === expected.toLowerCase());
              if (foundKey) {
                normalized[expected] = item[foundKey];
              }
            }
            return normalized as Subatividade;
          };

          if (payload.eventType === 'UPDATE') {
            const normalizedUpdate = normalizeItem(payload.new);
            setSubatividades(prev => prev.map(s => s.IDSubatividade === normalizedUpdate.IDSubatividade ? normalizedUpdate : s));
          } else if (payload.eventType === 'INSERT') {
            const normalizedInsert = normalizeItem(payload.new);
            setSubatividades(prev => [...prev, normalizedInsert]);
          }
        }
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  const handleUpdateSubatividadeStatus = async (sub: Subatividade, newStatus: string) => {
    // Optimistic UI update
    setSubatividades(prev => prev.map(s => 
      s.IDSubatividade === sub.IDSubatividade ? { ...s, Status: newStatus } : s
    ));

    try {
      const { error } = await supabase
        .from('subatividades')
        .update({ status: newStatus })
        .eq('idsubatividade', sub.IDSubatividade);
        
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Erro ao salvar o status no banco de dados. Recarregando dados.");
      loadData(false); // Revert on failure
    }
  };

  const handleAddSubatividade = async (atividadeId: string, nome: string) => {
    const newId = `SUB-${Math.random().toString(36).substr(2, 9)}`;
    const newSub: Subatividade = {
      IDSubatividade: newId,
      IDAtividade: atividadeId,
      OrdemSub: '',
      Subatividade: nome,
      Descricao: '',
      DataInicio: '',
      DataFim: '',
      Responsavel: 'Usuário',
      Status: 'Pendente',
      Observacao: '',
      LinkEvidencia: '',
      IndicadorFisico: ''
    };

    // Optimistic
    setSubatividades(prev => [...prev, newSub]);

    try {
      const lowercasedSub = {
        idsubatividade: newSub.IDSubatividade,
        idatividade: newSub.IDAtividade,
        ordemsub: newSub.OrdemSub,
        subatividade: newSub.Subatividade,
        descricao: newSub.Descricao,
        datainicio: newSub.DataInicio,
        datafim: newSub.DataFim,
        responsavel: newSub.Responsavel,
        status: newSub.Status,
        observacao: newSub.Observacao,
        linkevidencia: newSub.LinkEvidencia,
        indicadorfisico: newSub.IndicadorFisico
      };

      const { error } = await supabase
        .from('subatividades')
        .insert([lowercasedSub]);
        
      if (error) throw error;
    } catch (err) {
      console.error("Failed to append subatividade:", err);
      alert("Erro ao adicionar nova subatividade.");
      loadData(false); // Revert
    }
  };

  const getResponsaveis = (respString?: string | null) => {
    if (!respString) return ['Sem Responsável'];
    return respString.split(',').map(r => r.trim()).filter(Boolean);
  };

  const pilaresUnicos = Array.from(new Set<string>(acoes.map(a => a.Pilar).filter(Boolean) as string[]));
  
  const responsaveisUnicos = Array.from(new Set<string>(
    [...atividades, ...subatividades].flatMap(item => getResponsaveis(item.Responsavel))
  )).sort();
  
  const statusUnicos = Array.from(new Set<string>(
    [...atividades, ...subatividades].map(a => a.Status?.trim()).filter(Boolean) as string[]
  )).sort();

  const toggleFilter = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Filtering logic
  const checkItemMatch = (item: { Responsavel?: string | null, Status?: string | null }) => {
    const itemResp = getResponsaveis(item.Responsavel);
    const matchResp = selectedResponsaveis.length === 0 || selectedResponsaveis.some(r => itemResp.includes(r));
    
    const itemStatus = (item.Status?.trim() || 'Pendente').toLowerCase();
    const matchStatus = selectedStatus.length === 0 || selectedStatus.some(s => s.toLowerCase() === itemStatus);
    
    return matchResp && matchStatus;
  };

  const acoesByFilters = acoes.filter(a => {
    const matchPilar = selectedPilares.length === 0 || selectedPilares.includes(a.Pilar);
    const matchMeta = selectedMetas.length === 0 || selectedMetas.some(m => {
      const metaName = m.split(':')[0].trim(); // Extract just "Meta 7"
      const regex = new RegExp(`\\b${metaName}\\b`, 'i');
      return regex.test(a.MetaFinep || '');
    });
    return matchPilar && matchMeta;
  });
  const acoesByFiltersIds = new Set(acoesByFilters.map(a => a.IDAcao));

  const filteredAtividades = atividades.filter(a => {
    if (!acoesByFiltersIds.has(a.Acoes)) return false;

    const aMatch = checkItemMatch(a);
    let matchAtraso = true;
    if (showAtrasados) {
      matchAtraso = isLate(a.DataFim, a.Status);
    }

    const subs = subatividades.filter(s => s.IDAtividade === a.IDAtividade);
    const anySubMatch = subs.some(s => {
      let subMatchAtraso = true;
      if (showAtrasados) {
        subMatchAtraso = isLate(s.DataFim, s.Status);
      }
      return checkItemMatch(s) && subMatchAtraso;
    });

    return (aMatch && matchAtraso) || anySubMatch;
  });
  const filteredAtivIds = new Set(filteredAtividades.map(a => a.IDAtividade));

  const filteredSubatividades = subatividades.filter(s => {
    if (!filteredAtivIds.has(s.IDAtividade)) return false;
    let matchAtraso = true;
    if (showAtrasados) {
      matchAtraso = isLate(s.DataFim, s.Status);
    }
    return checkItemMatch(s) && matchAtraso;
  });

  const hasAtividadeFilters = selectedResponsaveis.length > 0 || selectedStatus.length > 0 || showAtrasados;

  const filteredAcoes = acoesByFilters.filter(ac => {
    if (hasAtividadeFilters) {
      return filteredAtividades.some(a => a.Acoes === ac.IDAcao);
    }
    return true; // if no child filters, keep the action even if it has no children
  });

  // Filter available Pilares in sidebar based on whether they have ANY matching actions
  // To avoid removing a pilar that is CURRENTLY selected (which would prevent unselecting it), 
  // we might still show all, OR just show ones that are active in filteredAcoes + currently selected.
  const activePilares = new Set(filteredAcoes.map(a => a.Pilar));
  const visiblePilares = pilaresUnicos.filter(p => activePilares.has(p) || selectedPilares.includes(p));

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800/30 flex flex-col h-screen fixed overflow-y-auto group">
        <div className="p-6 pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tighter text-sky-400 flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            CEI-MCR
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Project Management System</p>
        </div>
        
        <div className="px-4 pt-4">
          <div className="flex bg-slate-900 border border-slate-800 rounded p-1">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${theme === 'light' ? 'bg-sky-500 text-slate-900' : 'text-slate-500 hover:text-sky-400'}`}
              title="Claro / Light"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('navy')}
              className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${theme === 'navy' ? 'bg-sky-500 text-slate-900' : 'text-slate-500 hover:text-sky-400'}`}
              title="Dark Navy"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('oled')}
              className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${theme === 'oled' ? 'bg-sky-500 text-slate-900' : 'text-slate-500 hover:text-sky-400'}`}
              title="Preto / OLED"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-black transition-colors ${
              activeTab === 'dashboard' ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            DASHBOARD
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-black transition-colors ${
              activeTab === 'hierarchy' ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
            }`}
          >
            <ListTree className="w-4 h-4" />
            VISÃO GERAL
          </button>
          <button
            onClick={() => setActiveTab('prazos')}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-black transition-colors ${
              activeTab === 'prazos' ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
            }`}
          >
            <Clock className="w-4 h-4" />
            CONTROLE DE PRAZOS
          </button>
        </div>

        <div className="flex-1 px-4 py-2">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <Filter className="w-3 h-3" />
            Filtros Dinâmicos
          </h2>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-3 flex items-center gap-2"><Target className="w-3 h-3"/> Meta FINEP</label>
              <div className="space-y-2">
                {METAS_FINEP.map(meta => {
                  const isSelected = selectedMetas.includes(meta);
                  return (
                    <div
                      key={meta}
                      onClick={() => toggleFilter(selectedMetas, setSelectedMetas, meta)}
                      className={`text-xs font-black px-3 py-2 rounded-sm cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
                      }`}
                    >
                      {meta}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-3 flex items-center gap-2"><Target className="w-3 h-3"/> Pilar Estratégico</label>
              <div className="space-y-2">
                {visiblePilares.map(pilar => {
                  const isSelected = selectedPilares.includes(pilar);
                  return (
                    <div
                      key={pilar}
                      onClick={() => toggleFilter(selectedPilares, setSelectedPilares, pilar)}
                      className={`text-xs font-black px-3 py-2 rounded-sm cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
                      }`}
                    >
                      {pilar}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-3 flex items-center gap-2"><Users className="w-3 h-3"/> Responsável</label>
              <div className="space-y-2">
                {responsaveisUnicos.map(resp => {
                  const isSelected = selectedResponsaveis.includes(resp);
                  return (
                    <div
                      key={resp}
                      onClick={() => toggleFilter(selectedResponsaveis, setSelectedResponsaveis, resp)}
                      className={`text-xs font-black px-3 py-2 rounded-sm cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
                      }`}
                    >
                      {resp}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-3 flex items-center gap-2"><AlertTriangle className="w-3 h-3"/> Situação de Prazo</label>
              <div className="space-y-2">
                <div
                  onClick={() => setShowAtrasados(!showAtrasados)}
                  className={`text-xs font-black px-3 py-2 rounded-sm cursor-pointer transition-colors ${
                    showAtrasados ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'border border-slate-700 text-slate-400 hover:border-rose-500/50'
                  }`}
                >
                  EM ATRASO
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-3 flex items-center gap-2"><Clock className="w-3 h-3"/> Status Global</label>
              <div className="space-y-2 flex flex-col">
                {statusUnicos.map(status => {
                  const isSelected = selectedStatus.includes(status);
                  let colorClasses = isSelected ? 'bg-sky-500 text-slate-950 border border-sky-500' : 'border border-slate-700 text-slate-400 hover:border-sky-500';
                  
                  if (isSelected) {
                     if (status === 'Realizado') colorClasses = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
                     if (status === 'Pendente') colorClasses = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                     if (status === 'Em andamento') colorClasses = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
                  }

                  return (
                    <div
                      key={status}
                      onClick={() => toggleFilter(selectedStatus, setSelectedStatus, status)}
                      className={`text-[10px] font-black py-2 px-3 text-center rounded cursor-pointer uppercase tracking-widest transition-colors ${colorClasses}`}
                    >
                      {status}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* User / Logout */}
        {/* User / Logout */}
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div 
              className="flex flex-col truncate pr-2 cursor-pointer group" 
              onClick={() => setIsProfileModalOpen(true)}
              title="Meu Perfil"
            >
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1 group-hover:text-sky-400 transition-colors">
                <Settings className="w-3 h-3" /> Meu Perfil
              </span>
              <span className="text-xs text-slate-300 font-bold truncate mt-0.5" title={session?.user?.email}>
                {session?.user?.user_metadata?.full_name || session?.user?.email}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500 hover:text-slate-950 transition-colors shrink-0"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 h-screen overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-hidden p-8 flex flex-col">
        {activeTab === 'prazos' ? (
          <ControlePrazos 
            acoes={filteredAcoes}
            atividades={filteredAtividades}
            subatividades={filteredSubatividades}
            session={session}
            onDataChanged={() => loadData(false)}
            onTaskClick={handleNotificationClick}
            headerAction={
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-sm pl-4 pr-1 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Notificações</span>
                <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
              </div>
            }
          />
        ) : activeTab === 'dashboard' ? (
          <Dashboard 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades} 
            headerAction={
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-sm pl-4 pr-1 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Notificações</span>
                <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
              </div>
            }
          />
        ) : (
          <HierarchyView 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades}
            targetHighlight={targetHighlight} 
            onUpdateSubatividadeStatus={handleUpdateSubatividadeStatus}
            onAddSubatividade={handleAddSubatividade}
            onDataChanged={() => loadData(false)}
            headerAction={
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-sm pl-4 pr-1 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Notificações</span>
                <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
              </div>
            }
          />
        )}
        </div>
      </main>

      <UserProfileModal 
        session={session!} 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onUpdate={() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
          });
        }} 
      />
    </div>
  );
}
