const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

const targetDelBtn = `<button 
                      onClick={() => handleDelete(index)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors bg-slate-900/80 rounded"
                      title="Excluir"
                    ><Trash2 className="w-3 h-3" /></button>`;

const newDelBtn = `<button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors bg-slate-900/80 rounded"
                      title="Excluir"
                    ><Trash2 className="w-3 h-3" /></button>`;

code = code.replace(targetDelBtn, newDelBtn);

const targetEditBtn = `<button 
                      onClick={() => { setEditingIndex(index); setEditValue(log.text); }}
                      className="p-1 text-slate-500 hover:text-sky-400 transition-colors bg-slate-900/80 rounded"
                      title="Editar"
                    ><Edit2 className="w-3 h-3" /></button>`;

const newEditBtn = `<button 
                      onClick={(e) => { e.stopPropagation(); setEditingIndex(index); setEditValue(log.text); }}
                      className="p-1 text-slate-500 hover:text-sky-400 transition-colors bg-slate-900/80 rounded"
                      title="Editar"
                    ><Edit2 className="w-3 h-3" /></button>`;

code = code.replace(targetEditBtn, newEditBtn);

// In case they click inside the text area or the timeline, stop propagation so it doesn't trigger parent card
const targetTimeline = `<div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">`;
const newTimeline = `<div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar" onClick={e => e.stopPropagation()}>`;
code = code.replace(targetTimeline, newTimeline);

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
