const fs = require('fs');
let code = fs.readFileSync('src/components/ControlePrazos.tsx', 'utf8');

code = code.replace(
  'session: Session | null;\n  onDataChanged: () => void;\n}',
  'session: Session | null;\n  onDataChanged: () => void;\n  headerAction?: React.ReactNode;\n}'
);

code = code.replace(
  'export function ControlePrazos({ acoes, atividades, subatividades, session, onDataChanged }: ControlePrazosProps) {',
  'export function ControlePrazos({ acoes, atividades, subatividades, session, onDataChanged, headerAction }: ControlePrazosProps) {'
);

const targetHeader = `      <div className="flex items-center justify-between shrink-0 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <h2 className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
          <Clock className="w-4 h-4" />
          Controle de Prazos
        </h2>
        
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">`;

const newHeader = `      <div className="flex items-center justify-between shrink-0 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <h2 className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
          <Clock className="w-4 h-4" />
          Controle de Prazos
        </h2>
        
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterMode('minhas')}
              className={\`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors \${
                filterMode === 'minhas' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              Minhas Demandas
            </button>
            <button
              onClick={() => setFilterMode('todas')}
              className={\`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors \${
                filterMode === 'todas' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              Todas as Demandas
            </button>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </div>`;

code = code.replace(
  `      <div className="flex items-center justify-between shrink-0 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <h2 className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
          <Clock className="w-4 h-4" />
          Controle de Prazos
        </h2>
        
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button`,
  `      <div className="flex items-center justify-between shrink-0 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <h2 className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
          <Clock className="w-4 h-4" />
          Controle de Prazos
        </h2>
        
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button`
);

code = code.replace(
  `          </button>
        </div>
      </div>`,
  `          </button>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </div>`
);

fs.writeFileSync('src/components/ControlePrazos.tsx', code);
