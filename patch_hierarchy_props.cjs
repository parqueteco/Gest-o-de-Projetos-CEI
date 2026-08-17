const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

const targetProps = `interface HierarchyViewProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  onUpdateSubatividadeStatus: (id: string, newStatus: string) => void;
  onAddSubatividade: (atividadeId: string) => void;
  onDataChanged: () => void;
}`;

const newProps = `import { TargetHighlight } from '../App';

interface HierarchyViewProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  onUpdateSubatividadeStatus: (id: string, newStatus: string) => void;
  onAddSubatividade: (atividadeId: string) => void;
  onDataChanged: () => void;
  targetHighlight?: TargetHighlight | null;
}`;
code = code.replace(targetProps, newProps);

const targetSig = `export default function HierarchyView({
  acoes,
  atividades,
  subatividades,
  onUpdateSubatividadeStatus,
  onAddSubatividade,
  onDataChanged
}: HierarchyViewProps) {`;

const newSig = `export default function HierarchyView({
  acoes,
  atividades,
  subatividades,
  onUpdateSubatividadeStatus,
  onAddSubatividade,
  onDataChanged,
  targetHighlight
}: HierarchyViewProps) {`;
code = code.replace(targetSig, newSig);

const targetUseEffect = `  const [activeAcaoId, setActiveAcaoId] = useState<string | null>(null);`;

const newUseEffect = `  const [activeAcaoId, setActiveAcaoId] = useState<string | null>(null);

  useEffect(() => {
    if (targetHighlight) {
      if (targetHighlight.acaoId) {
        setExpandedAcoes(prev => new Set([...prev, targetHighlight.acaoId!]));
      }
      if (targetHighlight.atividadeId) {
        setExpandedAtividades(prev => new Set([...prev, targetHighlight.atividadeId!]));
      }
      if (targetHighlight.subatividadeId) {
        setExpandedSubatividades(prev => new Set([...prev, targetHighlight.subatividadeId!]));
      }

      // Allow React to render expanded items, then scroll
      setTimeout(() => {
        let targetId = null;
        if (targetHighlight.subatividadeId) targetId = \`sub-\${targetHighlight.subatividadeId}\`;
        else if (targetHighlight.atividadeId) targetId = \`ativ-\${targetHighlight.atividadeId}\`;
        else if (targetHighlight.acaoId) targetId = \`acao-\${targetHighlight.acaoId}\`;

        if (targetId) {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add temporary highlight effect
            element.classList.add('ring-2', 'ring-sky-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all', 'duration-500');
            
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-sky-500', 'ring-offset-2', 'ring-offset-slate-900');
            }, 2500);
          }
        }
      }, 150);
    }
  }, [targetHighlight]);`;
code = code.replace(targetUseEffect, newUseEffect);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
