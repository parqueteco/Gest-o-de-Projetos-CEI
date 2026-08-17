const fs = require('fs');
let code = fs.readFileSync('src/components/ControlePrazos.tsx', 'utf8');

code = code.replace(/\\\`> \\\$\\{task\\.acaoNome\\}\\\`/g, "\`> \${task.acaoNome}\`");
code = code.replace(/\\\`Atrasado \\\$\\{Math\\.abs\\(task\\.daysDiff\\)\\}/g, "\`Atrasado \${Math.abs(task.daysDiff)}");
code = code.replace(/Em \\\$\\{task\\.daysDiff\\} dias\\\`/g, "Em \${task.daysDiff} dias\`");
code = code.replace(/className=\{\\\`(.*?)\\\`\}/g, "className={\`$1\`}");

fs.writeFileSync('src/components/ControlePrazos.tsx', code);
