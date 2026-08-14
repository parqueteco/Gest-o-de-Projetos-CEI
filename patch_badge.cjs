const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

if (!code.includes("import { parseObservacao } from './DiarioBordo';")) {
  code = code.replace(
    "import { DiarioBordo } from './DiarioBordo';",
    "import { DiarioBordo, parseObservacao } from './DiarioBordo';"
  );
}

// Subatividade badge check:
const oldCheck = `{sub.Observacao && (`;
const newCheck = `{(sub.Observacao && parseObservacao(sub.Observacao).length > 0) && (`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
}

fs.writeFileSync('src/components/HierarchyView.tsx', code);
