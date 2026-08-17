const fs = require('fs');
let code = fs.readFileSync('src/components/ControlePrazos.tsx', 'utf8');

const targetProps = `  onDataChanged: () => void;
  headerAction?: React.ReactNode;
}`;

const newProps = `  onDataChanged: () => void;
  headerAction?: React.ReactNode;
  onTaskClick?: (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null) => void;
}`;

code = code.replace(targetProps, newProps);

const targetComp = `export function ControlePrazos({ acoes, atividades, subatividades, session, onDataChanged, headerAction }: ControlePrazosProps) {`;
const newComp = `export function ControlePrazos({ acoes, atividades, subatividades, session, onDataChanged, headerAction, onTaskClick }: ControlePrazosProps) {`;

code = code.replace(targetComp, newComp);

const targetProcess = `      let acaoNome = '';
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
      }`;

const newProcess = `      let acaoNome = '';
      let metaNome = '';
      
      let acaoId = isSub ? null : (task as Atividade).Acoes;
      let atividadeId = isSub ? (task as Subatividade).IDAtividade : (task as Atividade).IDAtividade;

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
      }`;

code = code.replace(targetProcess, newProcess);

const targetItem = `      const item = {
        ...task,
        isSub,
        title,
        id,
        acaoNome,
        metaNome,
        dataFimObj: dataFim,
        daysDiff
      };`;

const newItem = `      const item = {
        ...task,
        isSub,
        title,
        id,
        acaoId,
        atividadeId,
        subatividadeId: isSub ? id : null,
        acaoNome,
        metaNome,
        dataFimObj: dataFim,
        daysDiff
      };`;

code = code.replace(targetItem, newItem);

const targetCard = `  const renderCard = (task: any, isAtrasada: boolean) => (
    <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:border-slate-700 transition-colors">`;

const newCard = `  const renderCard = (task: any, isAtrasada: boolean) => (
    <div 
      key={task.id} 
      onClick={() => onTaskClick?.(task.acaoId, task.atividadeId, task.subatividadeId)}
      className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:border-slate-700 transition-colors cursor-pointer group hover:bg-slate-800/80"
    >`;

code = code.replace(targetCard, newCard);

const targetButton = `      <button 
        onClick={() => openLog(task)}
        className="w-full mt-2 py-2 flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-sky-500/10 hover:text-sky-400 text-slate-400 rounded transition-colors text-xs font-black uppercase"
      >
        <MessageSquare className="w-4 h-4" /> Diário de Bordo
      </button>`;

const newButton = `      <button 
        onClick={(e) => { e.stopPropagation(); openLog(task); }}
        className="w-full mt-2 py-2 flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-sky-500/10 hover:text-sky-400 text-slate-400 rounded transition-colors text-xs font-black uppercase"
      >
        <MessageSquare className="w-4 h-4" /> Diário de Bordo
      </button>`;

code = code.replace(targetButton, newButton);

fs.writeFileSync('src/components/ControlePrazos.tsx', code);
