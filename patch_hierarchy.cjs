const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const useMemoCode = `
  const acoesByPilar = useMemo(() => {
    const groups: Record<string, Acao[]> = {};
    acoes.forEach(acao => {
      const pilar = acao.Pilar?.trim() || 'Sem Pilar';
      if (!groups[pilar]) {
        groups[pilar] = [];
      }
      groups[pilar].push(acao);
    });
    
    // Sort groups alphabetically by pilar name
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, Acao[]>);
  }, [acoes]);
`;

code = code.replace('  return (\n    <section', useMemoCode + '\n  return (\n    <section');
fs.writeFileSync('src/components/HierarchyView.tsx', code);
