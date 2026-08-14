import React, { useState, useEffect } from 'react';
import { Acao, Atividade, Subatividade } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Trash2 } from 'lucide-react';

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PILARES = [
  'Fortalecer o Empreendedorismo e a Inovação',
  'Viabilizar formação de Talentos',
  'Fomentar Cultura e Inovação',
  'Promover a Inovação Aberta - Público e Privado',
  'Conectar e fortalecer o ecossistema de inovação',
  'Administrativo e Ações Gerais'
];

const METAS_FINEP = [
  'Meta 1: Plano Marechal Inova',
  'Meta 2: Infraestrutura e Marketing',
  'Meta 3: Divulgação Estratégica Universitária',
  'Meta 5: Inovação Aberta',
  'Meta 6: Promoção de Negócios',
  'Meta 7: Inovação no Setor Público',
  'Meta 8: Branding e Conexões',
  'Meta 9: Sensibilização e Engajamento',
  'Meta 10: Prospecção de Parceiros',
  'Meta 11: Incubação e Aceleração'
];

const RUBRICAS = [
  '33.00.14 / 33.00.15 - Diárias',
  '33.00.30 - Material de Consumo',
  '33.00.33 - Passagens e Despesas com Locomoção',
  '33.00.39 - Outros Serviços de Terceiros - Pessoa Jurídica (PJ)',
  '44.00.00 / 44.00.52 - Equipamentos e Material Permanente'
];

export function AcaoModal({ isOpen, onClose, onSuccess, initialData, pilares }: CrudModalProps & { initialData?: Acao | null, pilares: string[] }) {
  const [formData, setFormData] = useState<Partial<Acao>>(initialData || {
    Pilar: '',
    NomeAcao: '',
    MetaFinep: '',
    RubricaOrcamentaria: '',
    ValorEstimado: ''
  });

  const [selectedMetas, setSelectedMetas] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedMetas(initialData.MetaFinep ? initialData.MetaFinep.split(',').map(m => m.trim()).filter(Boolean) : []);
    } else {
      setFormData({ Pilar: '', NomeAcao: '', MetaFinep: '', RubricaOrcamentaria: '', ValorEstimado: '' });
      setSelectedMetas([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleMetaToggle = (meta: string) => {
    setSelectedMetas(prev => 
      prev.includes(meta) 
        ? prev.filter(m => m !== meta)
        : [...prev, meta]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        idacao: initialData ? initialData.IDAcao : `ACAO-${Math.random().toString(36).substring(2, 9)}`,
        pilar: formData.Pilar,
        nomeacao: formData.NomeAcao,
        metafinep: selectedMetas.join(', '),
        rubricaorcamentaria: formData.RubricaOrcamentaria,
        valorestimado: formData.ValorEstimado
      };

      let error = null;
      if (initialData) {
        const { error: err } = await supabase.from('acoes').update(payload).eq('idacao', initialData.IDAcao);
        error = err;
      } else {
        const { error: err } = await supabase.from('acoes').insert([payload]);
        error = err;
      }
      
      if (error) {
        console.error('Supabase error:', error);
        alert('Erro ao salvar Ação: ' + error.message);
        return;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert('Erro ao salvar Ação: ' + (error.message || error));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-black text-slate-100 mb-4">{initialData ? 'Editar Ação' : 'Nova Ação'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pilar</label>
            <select required value={formData.Pilar || ''} onChange={e => setFormData({...formData, Pilar: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500">
              <option value="" disabled>Selecione um Pilar</option>
              {PILARES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nome da Ação</label>
            <input required value={formData.NomeAcao || ''} onChange={e => setFormData({...formData, NomeAcao: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Meta Finep</label>
            <div className="space-y-1 max-h-40 overflow-y-auto bg-slate-950 border border-slate-700 p-2 rounded">
              {METAS_FINEP.map(meta => (
                <label key={meta} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedMetas.includes(meta)}
                    onChange={() => handleMetaToggle(meta)}
                    className="w-3 h-3 rounded-sm border-slate-600 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950"
                  />
                  <span className="text-[10px] text-slate-300 group-hover:text-slate-100 transition-colors">{meta}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Rubrica Orçamentária</label>
            <select value={formData.RubricaOrcamentaria || ''} onChange={e => setFormData({...formData, RubricaOrcamentaria: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500">
              <option value="">Selecione uma Rubrica (Opcional)</option>
              {RUBRICAS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Valor Estimado</label>
            <input value={formData.ValorEstimado || ''} onChange={e => setFormData({...formData, ValorEstimado: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 text-slate-300 font-black text-[10px] rounded uppercase hover:bg-slate-800">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 text-slate-950 font-black text-[10px] rounded uppercase hover:bg-sky-400">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const RESPONSAVEIS_OPCOES = ['Arion', 'Bianca', 'Eduardo', 'Henrique', 'Kamila'];

export function AtividadeModal({ isOpen, onClose, onSuccess, initialData, acaoId, initialOrdem }: CrudModalProps & { initialData?: Atividade | null, acaoId: string, initialOrdem?: string | null }) {
  const [formData, setFormData] = useState<Partial<Atividade>>(initialData || {
    Atividade: '',
    Descricao: '',
    Responsavel: '',
    DataInicio: '',
    DataFim: '',
    Status: 'Pendente',
    IndicadorFisico: '',
    Observacao: '',
    LinkEvidencia: ''
  });

  const [selectedResponsaveis, setSelectedResponsaveis] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedResponsaveis(initialData.Responsavel ? initialData.Responsavel.split(',').map(r => r.trim()).filter(Boolean) : []);
    } else {
      setFormData({ Atividade: '', Descricao: '', Responsavel: '', DataInicio: '', DataFim: '', Status: 'Pendente', IndicadorFisico: '', Observacao: '', LinkEvidencia: '' });
      setSelectedResponsaveis([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleRespToggle = (resp: string) => {
    setSelectedResponsaveis(prev => 
      prev.includes(resp)
        ? prev.filter(r => r !== resp)
        : [...prev, resp]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        idatividade: initialData ? initialData.IDAtividade : `ATIV-${Math.random().toString(36).substring(2, 9)}`,
        acoes: acaoId,
        atividade: formData.Atividade,
        descricao: formData.Descricao,
        responsavel: selectedResponsaveis.join(' , '),
        datainicio: formData.DataInicio,
        datafim: formData.DataFim,
        status: formData.Status,
        indicadorfisico: formData.IndicadorFisico,
        observacao: formData.Observacao,
        linkevidencia: formData.LinkEvidencia
      };

      if (initialData) {
        await supabase.from('atividades').update(payload).eq('idatividade', initialData.IDAtividade);
      } else {
        await supabase.from('atividades').insert([payload]);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar Atividade');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-black text-slate-100 mb-4">{initialData ? 'Editar Atividade' : 'Nova Atividade'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Título da Atividade</label>
            <input required value={formData.Atividade || ''} onChange={e => setFormData({...formData, Atividade: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Descrição</label>
            <textarea value={formData.Descricao || ''} onChange={e => setFormData({...formData, Descricao: e.target.value})} placeholder="Escopo da atividade (o que deve ser feito)..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" rows={3}></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Responsável</label>
              <div className="space-y-1 max-h-32 overflow-y-auto bg-slate-950 border border-slate-700 p-2 rounded">
                {RESPONSAVEIS_OPCOES.map(resp => (
                  <label key={resp} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedResponsaveis.includes(resp)}
                      onChange={() => handleRespToggle(resp)}
                      className="w-3 h-3 rounded-sm border-slate-600 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950"
                    />
                    <span className="text-[10px] text-slate-300 group-hover:text-slate-100 transition-colors">{resp}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Status</label>
              <select value={formData.Status || 'Pendente'} onChange={e => setFormData({...formData, Status: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500">
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Realizado">Realizado</option>
                <option value="Travado">Travado</option>
                <option value="Em espera">Em espera</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Data Início</label>
              <input value={formData.DataInicio || ''} onChange={e => setFormData({...formData, DataInicio: e.target.value})} placeholder="DD/MM/AAAA" className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Data Fim</label>
              <input value={formData.DataFim || ''} onChange={e => setFormData({...formData, DataFim: e.target.value})} placeholder="DD/MM/AAAA" className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Indicador Físico</label>
            <input value={formData.IndicadorFisico || ''} onChange={e => setFormData({...formData, IndicadorFisico: e.target.value})} placeholder="Evidência/Documento esperado (ex: Lista de presença, Relatório, Foto)..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Link de Evidência</label>
            <input type="url" value={formData.LinkEvidencia || ''} onChange={e => setFormData({...formData, LinkEvidencia: e.target.value})} placeholder="https://link-do-sharepoint-ou-drive.com..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 text-slate-300 font-black text-[10px] rounded uppercase hover:bg-slate-800">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 text-slate-950 font-black text-[10px] rounded uppercase hover:bg-sky-400">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SubatividadeModal({ isOpen, onClose, onSuccess, initialData, atividadeId, initialOrdemSub }: CrudModalProps & { initialData?: Subatividade | null, atividadeId: string, initialOrdemSub?: string | null }) {
  const [formData, setFormData] = useState<Partial<Subatividade>>(initialData || {
    Subatividade: '',
    Descricao: '',
    Responsavel: '',
    DataInicio: '',
    DataFim: '',
    Status: 'Pendente',
    IndicadorFisico: '',
    Observacao: '',
    LinkEvidencia: ''
  });

  const [selectedResponsaveis, setSelectedResponsaveis] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedResponsaveis(initialData.Responsavel ? initialData.Responsavel.split(',').map(r => r.trim()).filter(Boolean) : []);
    } else {
      setFormData({ Subatividade: '', Descricao: '', Responsavel: '', DataInicio: '', DataFim: '', Status: 'Pendente', IndicadorFisico: '', Observacao: '', LinkEvidencia: '' });
      setSelectedResponsaveis([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleRespToggle = (resp: string) => {
    setSelectedResponsaveis(prev => 
      prev.includes(resp)
        ? prev.filter(r => r !== resp)
        : [...prev, resp]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        idsubatividade: initialData ? initialData.IDSubatividade : `SUB-${Math.random().toString(36).substring(2, 9)}`,
        idatividade: atividadeId,
        subatividade: formData.Subatividade,
        descricao: formData.Descricao,
        responsavel: selectedResponsaveis.join(' , '),
        datainicio: formData.DataInicio,
        datafim: formData.DataFim,
        status: formData.Status,
        indicadorfisico: formData.IndicadorFisico,
        observacao: formData.Observacao,
        linkevidencia: formData.LinkEvidencia,
        ...(initialData ? {} : { ordemsub: initialOrdemSub || Date.now().toString() })
      };

      if (initialData) {
        await supabase.from('subatividades').update(payload).eq('idsubatividade', initialData.IDSubatividade);
      } else {
        await supabase.from('subatividades').insert([payload]);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar Subatividade');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-black text-slate-100 mb-4">{initialData ? 'Editar Subatividade' : 'Nova Subatividade'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Título da Subatividade</label>
            <input required value={formData.Subatividade || ''} onChange={e => setFormData({...formData, Subatividade: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Descrição</label>
            <textarea value={formData.Descricao || ''} onChange={e => setFormData({...formData, Descricao: e.target.value})} placeholder="Escopo da atividade (o que deve ser feito)..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" rows={2}></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Responsável</label>
              <div className="space-y-1 max-h-32 overflow-y-auto bg-slate-950 border border-slate-700 p-2 rounded">
                {RESPONSAVEIS_OPCOES.map(resp => (
                  <label key={resp} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedResponsaveis.includes(resp)}
                      onChange={() => handleRespToggle(resp)}
                      className="w-3 h-3 rounded-sm border-slate-600 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950"
                    />
                    <span className="text-[10px] text-slate-300 group-hover:text-slate-100 transition-colors">{resp}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Status</label>
              <select value={formData.Status || 'Pendente'} onChange={e => setFormData({...formData, Status: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500">
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Realizado">Realizado</option>
                <option value="Travado">Travado</option>
                <option value="Em espera">Em espera</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Data Início</label>
              <input value={formData.DataInicio || ''} onChange={e => setFormData({...formData, DataInicio: e.target.value})} placeholder="DD/MM/AAAA" className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Data Fim</label>
              <input value={formData.DataFim || ''} onChange={e => setFormData({...formData, DataFim: e.target.value})} placeholder="DD/MM/AAAA" className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Indicador Físico</label>
            <input value={formData.IndicadorFisico || ''} onChange={e => setFormData({...formData, IndicadorFisico: e.target.value})} placeholder="Evidência/Documento esperado (ex: Lista de presença, Relatório, Foto)..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Link de Evidência</label>
            <input type="url" value={formData.LinkEvidencia || ''} onChange={e => setFormData({...formData, LinkEvidencia: e.target.value})} placeholder="https://link-do-sharepoint-ou-drive.com..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 text-slate-300 font-black text-[10px] rounded uppercase hover:bg-slate-800">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 text-slate-950 font-black text-[10px] rounded uppercase hover:bg-sky-400">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
