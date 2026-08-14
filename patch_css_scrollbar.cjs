const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/background: #1e293b;/g, 'background: var(--color-slate-800, #1e293b);');
code = code.replace(/background: #334155;/g, 'background: var(--color-slate-700, #334155);');

fs.writeFileSync('src/index.css', code);
