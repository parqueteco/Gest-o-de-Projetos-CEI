const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(/Central de Alertas/g, 'Notificações');
fs.writeFileSync('src/App.tsx', appCode);

let hierCode = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

const targetHeader = `      <div className="flex items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
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

const newHeader = `      <div className="flex items-start justify-between gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
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
      </div>`;

hierCode = hierCode.replace(targetHeader, newHeader);
fs.writeFileSync('src/components/HierarchyView.tsx', hierCode);
