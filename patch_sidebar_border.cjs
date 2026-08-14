const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<aside className="w-72 bg-slate-950 border-r border-slate-900/50 flex flex-col h-screen fixed overflow-y-auto">`;
const replacement = `<aside className="w-72 bg-slate-950 border-r border-slate-800/30 flex flex-col h-screen fixed overflow-y-auto group">`; // adding group to try to do group-hover scrollbar if needed, but not strictly necessary

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
