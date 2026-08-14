const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<aside className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col h-screen fixed overflow-y-auto">`;
const replacement = `<aside className="w-72 bg-slate-950 border-r border-slate-900/50 flex flex-col h-screen fixed overflow-y-auto">`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
