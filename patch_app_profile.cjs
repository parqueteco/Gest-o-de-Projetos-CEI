const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Settings import
code = code.replace("LogOut\n} from 'lucide-react';", "LogOut,\n  Settings\n} from 'lucide-react';");

// 2. Add UserProfileModal import
code = code.replace("import { Login } from './components/Login';", "import { Login } from './components/Login';\nimport { UserProfileModal } from './components/UserProfileModal';");

// 3. Add state for modal
const targetState = `  const [authChecking, setAuthChecking] = useState(true);`;
const newState = `  const [authChecking, setAuthChecking] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);`;
code = code.replace(targetState, newState);

// 4. Update sidebar bottom
const sidebarBottom = `        {/* User / Logout */}
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

const newSidebarBottom = `        {/* User / Logout */}
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
        </div>`;

code = code.replace(sidebarBottom, newSidebarBottom);

// 5. Add modal component
const mainEnd = `        )}
      </main>
    </div>
  );
}`;

const newMainEnd = `        )}
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
}`;

code = code.replace(mainEnd, newMainEnd);

fs.writeFileSync('src/App.tsx', code);
