const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const targetStr = `      <AtividadeModal 
        isOpen={atividadeModalOpen} 
        onClose={() => setAtividadeModalOpen(false)} 
        onSuccess={() => { setAtividadeModalOpen(false); onDataChanged(); }} 
        initialData={editingAtiv}
        acaoId={activeAcaoId || ''}
      />`;

const newStr = `      <AtividadeModal 
        isOpen={atividadeModalOpen} 
        onClose={() => { setAtividadeModalOpen(false); setInsertOrderAtiv(null); }} 
        onSuccess={() => { setAtividadeModalOpen(false); setInsertOrderAtiv(null); onDataChanged(); }} 
        initialData={editingAtiv}
        acaoId={activeAcaoId || ''}
        initialOrdem={insertOrderAtiv}
      />`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
