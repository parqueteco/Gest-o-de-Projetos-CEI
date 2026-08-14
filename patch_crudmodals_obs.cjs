const fs = require('fs');
let code = fs.readFileSync('src/components/CrudModals.tsx', 'utf8');

// For AtividadeModal:
const ativBlock = `          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Observação</label>
            <input value={formData.Observacao || ''} onChange={e => setFormData({...formData, Observacao: e.target.value})} placeholder="Diário de bordo (ex: Falei com fulano em 10/06, reunião agendada para...)..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>`;
          
code = code.replace(ativBlock, '');

// For SubatividadeModal:
const subBlock = `          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Observação</label>
            <input value={formData.Observacao || ''} onChange={e => setFormData({...formData, Observacao: e.target.value})} placeholder="Diário de bordo (ex: Falei com fulano em 10/06, reunião agendada para...)..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-100 outline-none focus:border-sky-500" />
          </div>`;

code = code.replace(subBlock, '');

fs.writeFileSync('src/components/CrudModals.tsx', code);
