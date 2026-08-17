const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetImport = `import HierarchyView from './components/HierarchyView';`;
const newImport = `import HierarchyView from './components/HierarchyView';\nimport { ControlePrazos } from './components/ControlePrazos';`;
code = code.replace(targetImport, newImport);

const targetState = `const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy'>('dashboard');`;
const newState = `const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy' | 'prazos'>('dashboard');`;
code = code.replace(targetState, newState);

const targetNav = `          <button
            onClick={() => setActiveTab('hierarchy')}
            className={\`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-black transition-colors \${
              activeTab === 'hierarchy' ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
            }\`}
          >
            <ListTree className="w-4 h-4" />
            VISÃO GERAL
          </button>`;
const newNav = `          <button
            onClick={() => setActiveTab('hierarchy')}
            className={\`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-black transition-colors \${
              activeTab === 'hierarchy' ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
            }\`}
          >
            <ListTree className="w-4 h-4" />
            VISÃO GERAL
          </button>
          <button
            onClick={() => setActiveTab('prazos')}
            className={\`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-black transition-colors \${
              activeTab === 'prazos' ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
            }\`}
          >
            <Clock className="w-4 h-4" />
            CONTROLE DE PRAZOS
          </button>`;
code = code.replace(targetNav, newNav);

const targetMain = `        {activeTab === 'dashboard' ? (`;
const newMain = `        {activeTab === 'prazos' ? (
          <div className="flex flex-col h-full relative">
            <div className="absolute top-0 right-0 z-50 flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-sm pl-4 pr-1 py-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Notificações</span>
              <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
            </div>
            <ControlePrazos 
              acoes={filteredAcoes}
              atividades={filteredAtividades}
              subatividades={filteredSubatividades}
              session={session}
              onDataChanged={() => loadData(false)}
            />
          </div>
        ) : activeTab === 'dashboard' ? (`;
code = code.replace(targetMain, newMain);

fs.writeFileSync('src/App.tsx', code);
