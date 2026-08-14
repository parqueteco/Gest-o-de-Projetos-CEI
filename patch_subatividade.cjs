const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

// 1. Add expandedSubatividades state
const stateTarget = `  const [expandedAtividades, setExpandedAtividades] = useState<Set<string>>(new Set());`;
const newState = stateTarget + `
  const [expandedSubatividades, setExpandedSubatividades] = useState<Set<string>>(new Set());`;
code = code.replace(stateTarget, newState);

// 2. Add toggleSubatividade
const toggleTarget = `  const toggleAtividade = (id: string) => {
    setExpandedAtividades(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };`;
const newToggle = toggleTarget + `

  const toggleSubatividade = (id: string) => {
    setExpandedSubatividades(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };`;
code = code.replace(toggleTarget, newToggle);

// 3. Update the subatividade render
const subMapTarget = `                                        {ativSubatividades.map((sub, idx) => {
                                          const isDone = sub.Status?.trim() === 'Realizado';`;

const subMapNew = `                                        {ativSubatividades.map((sub, idx) => {
                                          const isDone = sub.Status?.trim() === 'Realizado';
                                          const isSubExpanded = expandedSubatividades.has(sub.IDSubatividade);`;

code = code.replace(subMapTarget, subMapNew);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
