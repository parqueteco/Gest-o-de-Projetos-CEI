const fs = require('fs');
let code = fs.readFileSync('src/components/CrudModals.tsx', 'utf-8');

const targetStr = `export function AtividadeModal({ isOpen, onClose, onSuccess, initialData, acaoId }: CrudModalProps & { initialData?: Atividade | null, acaoId: string }) {`;

const newStr = `export function AtividadeModal({ isOpen, onClose, onSuccess, initialData, acaoId, initialOrdem }: CrudModalProps & { initialData?: Atividade | null, acaoId: string, initialOrdem?: string | null }) {`;

code = code.replace(targetStr, newStr);

const targetSubmit = `      const payload = { 
        ...formData, 
        Acoes: acaoId,
        Responsavel: selectedResponsaveis.join(', ')
      };`;

const newSubmit = `      const payload = { 
        ...formData, 
        Acoes: acaoId,
        Responsavel: selectedResponsaveis.join(', ')
      };
      if (initialOrdem && !initialData) {
        payload.Ordem = initialOrdem;
      }`;

code = code.replace(targetSubmit, newSubmit);

fs.writeFileSync('src/components/CrudModals.tsx', code);
