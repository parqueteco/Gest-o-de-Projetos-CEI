const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

// Insert new state
const stateTarget = `  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');`;
const newState = `  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);`;
code = code.replace(stateTarget, newState);

// Update handleDelete
const handleDeleteTarget = `  const handleDelete = async (indexToDelete: number) => {
    console.log("Tentando deletar nota index:", indexToDelete, "id do item:", id, "table:", table);
    if (!window.confirm("Deseja realmente excluir este registro?")) return;
    setIsSubmitting(true);`;
const newHandleDelete = `  const handleDelete = async (indexToDelete: number) => {
    console.log("Tentando deletar nota index:", indexToDelete, "id do item:", id, "table:", table);
    setIsSubmitting(true);
    setConfirmDeleteIndex(null);`;
code = code.replace(handleDeleteTarget, newHandleDelete);

// Update delete button
const deleteBtnTarget = `<button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors bg-slate-900/80 rounded"
                      title="Excluir"
                    ><Trash2 className="w-3 h-3" /></button>`;
const newDeleteBtn = `<button 
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteIndex(index); }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors bg-slate-900/80 rounded"
                      title="Excluir"
                    ><Trash2 className="w-3 h-3" /></button>`;
code = code.replace(deleteBtnTarget, newDeleteBtn);

// Insert confirm delete UI
const confirmUITarget = `              {editingIndex === index ? (`;
const newConfirmUI = `              {confirmDeleteIndex === index && (
                <div className="flex items-center gap-2 mt-1 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                  <span className="text-xs text-rose-400 font-bold">Excluir este registro?</span>
                  <div className="ml-auto flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteIndex(null); }} className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200">Não</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(index); }} disabled={isSubmitting} className="px-2 py-1 text-[10px] font-bold bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors disabled:opacity-50">Sim, excluir</button>
                  </div>
                </div>
              )}
              
              {editingIndex === index ? (`;
code = code.replace(confirmUITarget, newConfirmUI);

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
