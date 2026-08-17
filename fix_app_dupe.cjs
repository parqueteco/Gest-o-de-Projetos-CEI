const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const doubleNav = `          <button
            onClick={() => setActiveTab('prazos')}
            className={\`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-black transition-colors \${
              activeTab === 'prazos' ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-sky-500'
            }\`}
          >
            <Clock className="w-4 h-4" />
            CONTROLE DE PRAZOS
          </button>`;

code = code.replace(doubleNav + '\n' + doubleNav, doubleNav);
fs.writeFileSync('src/App.tsx', code);
