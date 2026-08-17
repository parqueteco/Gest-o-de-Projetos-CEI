const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

const targetAcao = `<div key={acao.IDAcao} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">`;
const newAcao = `<div id={\`acao-\${acao.IDAcao}\`} key={acao.IDAcao} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">`;
code = code.replace(targetAcao, newAcao);

const targetAtiv = `<div key={ativ.IDAtividade} className={\`relative group/row border \${isAtivExpanded ? 'border-slate-700' : 'border-slate-800/80'} rounded flex flex-col bg-slate-950/40 transition-colors\`}>`;
const newAtiv = `<div id={\`ativ-\${ativ.IDAtividade}\`} key={ativ.IDAtividade} className={\`relative group/row border \${isAtivExpanded ? 'border-slate-700' : 'border-slate-800/80'} rounded flex flex-col bg-slate-950/40 transition-colors\`}>`;
code = code.replace(targetAtiv, newAtiv);

const targetSub = `<div key={sub.IDSubatividade} className="relative group/row">`;
const newSub = `<div id={\`sub-\${sub.IDSubatividade}\`} key={sub.IDSubatividade} className="relative group/row">`;
code = code.replace(targetSub, newSub);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
