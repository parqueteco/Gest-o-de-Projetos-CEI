const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');
code = code.replace(/<Clock className="w-3 h-3" \/> \\[\{formatDate\\(log\\.date\\)\\}\\]/g, '<Clock className="w-3 h-3" /> {formatDate(log.date)}');
// Actually just replace with string methods
code = code.split('<Clock className="w-3 h-3" /> [{formatDate(log.date)}]').join('<Clock className="w-3 h-3" /> {formatDate(log.date)}');
fs.writeFileSync('src/components/DiarioBordo.tsx', code);
