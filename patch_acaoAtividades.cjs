const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const targetStr = `          const acaoAtividades = atividades.filter(a => a.Acoes === acao.IDAcao);`;

const newStr = `          const acaoAtividades = atividades.filter(a => a.Acoes === acao.IDAcao).sort((a, b) => {
            const orderA = parseInt(a.Ordem || '0') || 0;
            const orderB = parseInt(b.Ordem || '0') || 0;
            return orderA - orderB;
          });`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/HierarchyView.tsx', code);
