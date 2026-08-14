const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

code = code.replace(/const newObservacao = updatedLogs\.length > 0 \? JSON\.stringify\(updatedLogs\) : null;/g, 
"const newObservacao = updatedLogs.length > 0 ? JSON.stringify(updatedLogs) : '';");

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
