const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert Sun, Moon, Monitor imports
code = code.replace("import { Briefcase, Filter, Target, Users, AlertTriangle, ListTree, LayoutDashboard, Clock } from 'lucide-react';", "import { Briefcase, Filter, Target, Users, AlertTriangle, ListTree, LayoutDashboard, Clock, Sun, Moon, Laptop } from 'lucide-react';");

// Insert theme state
const stateTarget = `  const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy'>('dashboard');`;
const newState = `  const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy'>('dashboard');
  const [theme, setTheme] = useState<'navy' | 'light' | 'oled'>(() => {
    return (localStorage.getItem('app-theme') as 'navy' | 'light' | 'oled') || 'navy';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.body.classList.remove('theme-light', 'theme-oled', 'theme-navy');
    document.body.classList.add(\`theme-\${theme}\`);
  }, [theme]);`;
code = code.replace(stateTarget, newState);

// Insert theme toggle in sidebar
const sidebarTarget = `        <div className="p-4 flex flex-col gap-2">`;
const themeToggle = `        <div className="px-4 pt-4">
          <div className="flex bg-slate-900 border border-slate-800 rounded p-1">
            <button
              onClick={() => setTheme('light')}
              className={\`flex-1 flex justify-center py-1.5 rounded transition-colors \${theme === 'light' ? 'bg-sky-500 text-slate-900' : 'text-slate-500 hover:text-sky-400'}\`}
              title="Claro / Light"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('navy')}
              className={\`flex-1 flex justify-center py-1.5 rounded transition-colors \${theme === 'navy' ? 'bg-sky-500 text-slate-900' : 'text-slate-500 hover:text-sky-400'}\`}
              title="Dark Navy"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('oled')}
              className={\`flex-1 flex justify-center py-1.5 rounded transition-colors \${theme === 'oled' ? 'bg-sky-500 text-slate-900' : 'text-slate-500 hover:text-sky-400'}\`}
              title="Preto / OLED"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2">`;
// Wait, I imported Laptop, not Monitor. Let's use Laptop.
const themeToggleFixed = themeToggle.replace(/Monitor/g, "Laptop");
code = code.replace(sidebarTarget, themeToggleFixed);

fs.writeFileSync('src/App.tsx', code);
