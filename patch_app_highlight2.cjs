const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetHighlight = `export interface TargetHighlight {
  acaoId: string | null;
  atividadeId: string | null;
  subatividadeId: string | null;
  timestamp: number;
}`;

const newHighlight = `export interface TargetHighlight {
  acaoId: string | null;
  atividadeId: string | null;
  subatividadeId: string | null;
  comentarioId: string | null;
  timestamp: number;
}`;

code = code.replace(targetHighlight, newHighlight);

const targetHandle = `  const handleNotificationClick = (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null) => {
    setActiveTab('hierarchy');
    setTargetHighlight({ acaoId, atividadeId, subatividadeId, timestamp: Date.now() });
  };`;

const newHandle = `  const handleNotificationClick = (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null, comentarioId: string | null = null) => {
    setActiveTab('hierarchy');
    setTargetHighlight({ acaoId, atividadeId, subatividadeId, comentarioId, timestamp: Date.now() });
  };`;

code = code.replace(targetHandle, newHandle);

fs.writeFileSync('src/App.tsx', code);
