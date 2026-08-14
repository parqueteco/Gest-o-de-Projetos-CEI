const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add LogOut import and Session
code = code.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';\nimport { Session } from '@supabase/supabase-js';");
code = code.replace("Laptop\n} from 'lucide-react';", "Laptop,\n  LogOut\n} from 'lucide-react';");
code = code.replace("import { supabase } from './lib/supabaseClient';", "import { supabase } from './lib/supabaseClient';\nimport { Login } from './components/Login';");

// 2. Add state
const targetState = `  const [loading, setLoading] = useState(true);`;
const newState = `  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);`;
code = code.replace(targetState, newState);

// 3. Add auth effect inside App
const targetEffect = `  const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy'>('dashboard');`;
const newEffect = `  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy'>('dashboard');`;
code = code.replace(targetEffect, newEffect);

// 4. Update initial render logic for auth
const targetRenderLoading = `  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }`;
const newRenderLoading = `  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }`;
code = code.replace(targetRenderLoading, newRenderLoading);

// 5. Add logout to sidebar
const sidebarBottom = `          </div>
        </div>
      </aside>`;
const newSidebarBottom = `          </div>
        </div>
        
        {/* User / Logout */}
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col truncate pr-2">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Usuário Logado</span>
              <span className="text-xs text-slate-300 font-bold truncate" title={session.user.email}>
                {session.user.email}
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
      </aside>`;
code = code.replace(sidebarBottom, newSidebarBottom);

fs.writeFileSync('src/App.tsx', code);
