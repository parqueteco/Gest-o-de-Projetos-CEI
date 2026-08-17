const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

const targetProps = `interface HierarchyViewProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  onUpdateSubatividadeStatus?: (sub: Subatividade, newStatus: string) => void;
  onAddSubatividade?: (atividadeId: string, nome: string) => void;
  onDataChanged: () => void;
  targetHighlight?: TargetHighlight | null;
}`;
const newProps = `interface HierarchyViewProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  onUpdateSubatividadeStatus?: (sub: Subatividade, newStatus: string) => void;
  onAddSubatividade?: (atividadeId: string, nome: string) => void;
  onDataChanged: () => void;
  targetHighlight?: TargetHighlight | null;
  headerAction?: React.ReactNode;
}`;
code = code.replace(targetProps, newProps);

const targetComp = `export default function HierarchyView({ acoes, atividades, subatividades, onUpdateSubatividadeStatus, onDataChanged, targetHighlight }: HierarchyViewProps) {`;
const newComp = `export default function HierarchyView({ acoes, atividades, subatividades, onUpdateSubatividadeStatus, onDataChanged, targetHighlight, headerAction }: HierarchyViewProps) {`;
code = code.replace(targetComp, newComp);

const targetHeader = `    <section className="flex-1 overflow-y-auto pr-2 pb-12 flex flex-col gap-3 relative">
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
        <h2 className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2">
          Visão Geral
        </h2>
        <button 
          onClick={() => { setEditingAcao(null); setAcaoModalOpen(true); }} 
          className="flex items-center gap-1 px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded font-black text-[10px] uppercase transition-colors border border-sky-500/20"
        >
          <Plus className="w-3 h-3" /> Nova Ação
        </button>
      </div>`;
const newHeader = `    <section className="flex-1 overflow-y-auto pr-2 pb-12 flex flex-col gap-3 relative">
      <div className="flex items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
        <h2 className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
          Visão Geral
        </h2>
        <div className="flex items-center gap-4 ml-auto">
          {headerAction && <div className="shrink-0">{headerAction}</div>}
          <button 
            onClick={() => { setEditingAcao(null); setAcaoModalOpen(true); }} 
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded font-black text-[10px] uppercase transition-colors border border-sky-500/20 shrink-0"
          >
            <Plus className="w-3 h-3" /> Nova Ação
          </button>
        </div>
      </div>`;
code = code.replace(targetHeader, newHeader);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
