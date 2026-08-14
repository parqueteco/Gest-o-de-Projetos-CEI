const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const target = \`<div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-lg flex items-center justify-between sticky top-[72px] z-10 backdrop-blur-sm shadow-sm">\`;
const replacement = \`<div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-lg flex items-center justify-between shadow-sm">\`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
