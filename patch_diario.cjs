const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

const targetMap = `          logs.map((log, index) => (
            <div key={index} className="flex flex-col gap-1 border-l-2 border-amber-500/20 pl-3 py-1 relative group">`;
const newMap = `          logs.map((log, index) => (
            <div id={\`comentario-\${log.date}\`} key={index} className="flex flex-col gap-1 border-l-2 border-amber-500/20 pl-3 py-1 relative group">`;
code = code.replace(targetMap, newMap);

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
