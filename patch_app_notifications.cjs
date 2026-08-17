const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import Notifications
code = code.replace(
  "import { UserProfileModal } from './components/UserProfileModal';",
  "import { UserProfileModal } from './components/UserProfileModal';\nimport { Notifications } from './components/Notifications';"
);

// Update Main Content structure
const mainTarget = `      {/* Main Content */}
      <main className="flex-1 ml-72 h-screen overflow-hidden flex flex-col p-8">
        {activeTab === 'dashboard' ? (`;

const newMain = `      {/* Main Content */}
      <main className="flex-1 ml-72 h-screen overflow-hidden flex flex-col relative">
        <div className="absolute top-6 right-8 z-50 flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-lg pl-4 pr-1 py-1">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Central de Alertas</span>
           <Notifications session={session} atividades={atividades} subatividades={subatividades} />
        </div>
        <div className="flex-1 overflow-hidden p-8 flex flex-col">
        {activeTab === 'dashboard' ? (`;

code = code.replace(mainTarget, newMain);

// We need to close the inner div added above
const mainEnd = `        )}
      </main>`;
const newMainEnd = `        )}
        </div>
      </main>`;
code = code.replace(mainEnd, newMainEnd);

fs.writeFileSync('src/App.tsx', code);
