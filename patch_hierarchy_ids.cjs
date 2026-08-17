const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

const acaoDiv = `<div key={acao.IDAcao} className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">`;
const newAcaoDiv = `<div id={\`acao-\${acao.IDAcao}\`} key={acao.IDAcao} className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">`;
code = code.replace(acaoDiv, newAcaoDiv);

const ativDiv = `<div key={ativ.IDAtividade} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-800/20 group/ativ transition-all hover:border-slate-700">`;
const newAtivDiv = `<div id={\`ativ-\${ativ.IDAtividade}\`} key={ativ.IDAtividade} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-800/20 group/ativ transition-all hover:border-slate-700">`;
code = code.replace(ativDiv, newAtivDiv);

const subDiv = `<div key={sub.IDSubatividade} className={\`border-l-4 \${statusBorderColor} bg-slate-800/30 rounded-r-lg p-3 sm:p-4 group/sub hover:bg-slate-800/50 transition-colors\`}>`;
const newSubDiv = `<div id={\`sub-\${sub.IDSubatividade}\`} key={sub.IDSubatividade} className={\`border-l-4 \${statusBorderColor} bg-slate-800/30 rounded-r-lg p-3 sm:p-4 group/sub hover:bg-slate-800/50 transition-colors\`}>`;
code = code.replace(subDiv, newSubDiv);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
