const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetImport = `import { Notifications } from './components/Notifications';`;
const newImport = `import { Notifications } from './components/Notifications';

export interface TargetHighlight {
  acaoId: string | null;
  atividadeId: string | null;
  subatividadeId: string | null;
  timestamp: number;
}`;
code = code.replace(targetImport, newImport);

const targetState = `  const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy'>('dashboard');`;
const newState = `  const [activeTab, setActiveTab] = useState<'dashboard' | 'hierarchy'>('dashboard');
  const [targetHighlight, setTargetHighlight] = useState<TargetHighlight | null>(null);

  const handleNotificationClick = (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null) => {
    setActiveTab('hierarchy');
    setTargetHighlight({ acaoId, atividadeId, subatividadeId, timestamp: Date.now() });
  };`;
code = code.replace(targetState, newState);

const targetNotifications = `<Notifications session={session} atividades={atividades} subatividades={subatividades} />`;
const newNotifications = `<Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />`;
code = code.replace(targetNotifications, newNotifications);

const targetHierarchy = `<HierarchyView 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades}`;
const newHierarchy = `<HierarchyView 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades}
            targetHighlight={targetHighlight}`;
code = code.replace(targetHierarchy, newHierarchy);

fs.writeFileSync('src/App.tsx', code);
