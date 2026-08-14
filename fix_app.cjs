const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const duplicate = `        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col truncate pr-2">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Usuário Logado</span>
              <span className="text-xs text-slate-300 font-bold truncate" title={session?.user?.email}>
                {session?.user?.email}
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
        
        {/* User / Logout */}
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col truncate pr-2">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Usuário Logado</span>
              <span className="text-xs text-slate-300 font-bold truncate" title={session?.user?.email}>
                {session?.user?.email}
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
        </div>`;

const single = `        {/* User / Logout */}
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col truncate pr-2">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Usuário Logado</span>
              <span className="text-xs text-slate-300 font-bold truncate" title={session?.user?.email}>
                {session?.user?.email}
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
        </div>`;

code = code.replace(duplicate, single);
fs.writeFileSync('src/App.tsx', code);
