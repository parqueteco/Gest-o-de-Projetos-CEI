const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

// 1. Import DiarioBordo
if (!code.includes("import { DiarioBordo }")) {
  code = code.replace("import { ConfirmModal } from './ConfirmModal';", "import { ConfirmModal } from './ConfirmModal';\nimport { DiarioBordo } from './DiarioBordo';");
}

// 2. Replace Atividade's Observacao block (lines ~537-542)
// Old:
//                                       {ativ.Observacao && (
//                                         <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60">
//                                           <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase mb-1.5"><MessageSquare className="w-3.5 h-3.5" /> Observações</div>
//                                           <div className="text-[11px] font-bold text-slate-300">{ativ.Observacao}</div>
//                                         </div>
//                                       )}
const ativObsRegex = /\{ativ\.Observacao\s*&&\s*\([\s\S]*?<\/div>\s*\)\}/;
if (ativObsRegex.test(code)) {
  code = code.replace(ativObsRegex, `<DiarioBordo id={ativ.IDAtividade} table="atividades" idField="idatividade" rawObservacao={ativ.Observacao} onDataChanged={onDataChanged} />`);
}

// 3. Replace Subatividade's Observacao block when expanded (lines ~713-718)
// Old:
//                                                           {sub.Observacao && (
//                                                             <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
//                                                               <strong className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1 mb-2"><MessageSquare className="w-3 h-3"/> Observação</strong>
//                                                               <p className="text-xs text-slate-300 whitespace-pre-wrap">{sub.Observacao}</p>
//                                                             </div>
//                                                           )}
const subObsRegex = /\{sub\.Observacao\s*&&\s*\(\s*<div className="bg-slate-900\/50 p-3 rounded border border-slate-800">[\s\S]*?<\/div>\s*\)\}/;
if (subObsRegex.test(code)) {
  code = code.replace(subObsRegex, `<DiarioBordo id={sub.IDSubatividade} table="subatividades" idField="idsubatividade" rawObservacao={sub.Observacao} onDataChanged={onDataChanged} />`);
} else {
  // Let's use string replace for safety
  const oldSubObs = `{sub.Observacao && (
                                                            <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                                                              <strong className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1 mb-2"><MessageSquare className="w-3 h-3"/> Observação</strong>
                                                              <p className="text-xs text-slate-300 whitespace-pre-wrap">{sub.Observacao}</p>
                                                            </div>
                                                          )}`;
  if (code.includes(oldSubObs)) {
     code = code.replace(oldSubObs, `<DiarioBordo id={sub.IDSubatividade} table="subatividades" idField="idsubatividade" rawObservacao={sub.Observacao} onDataChanged={onDataChanged} />`);
  }
}

fs.writeFileSync('src/components/HierarchyView.tsx', code);
