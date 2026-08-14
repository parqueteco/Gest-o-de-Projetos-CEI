const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/AlertTriangle\n\} from 'lucide-react';/, "AlertTriangle,\n  Sun,\n  Moon,\n  Laptop\n} from 'lucide-react';");
fs.writeFileSync('src/App.tsx', code);
