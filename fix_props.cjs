const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

const targetProps = `interface HierarchyViewProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  onUpdateSubatividadeStatus?: (sub: Subatividade, newStatus: string) => void;
  onAddSubatividade?: (atividadeId: string, nome: string) => void;
  onDataChanged: () => void;
}`;

const newProps = `import { TargetHighlight } from '../App';

interface HierarchyViewProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  onUpdateSubatividadeStatus?: (sub: Subatividade, newStatus: string) => void;
  onAddSubatividade?: (atividadeId: string, nome: string) => void;
  onDataChanged: () => void;
  targetHighlight?: TargetHighlight | null;
}`;

code = code.replace(targetProps, newProps);

const targetSig = `export default function HierarchyView({ acoes, atividades, subatividades, onUpdateSubatividadeStatus, onDataChanged }: HierarchyViewProps) {`;

const newSig = `export default function HierarchyView({ acoes, atividades, subatividades, onUpdateSubatividadeStatus, onDataChanged, targetHighlight }: HierarchyViewProps) {`;

code = code.replace(targetSig, newSig);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
