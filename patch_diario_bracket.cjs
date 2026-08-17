const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

code = code.replace(/\\\[\{formatDate\\(log\\.date\\)\}\\\]/g, "{formatDate(log.date)}");

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
