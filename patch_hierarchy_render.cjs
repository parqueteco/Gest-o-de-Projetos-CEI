const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const targetStr = `      <div className="space-y-3">
        {acoes.map((acao) => {`;

const newStr = `      <div className="space-y-6">
        {Object.entries(acoesByPilar).map(([pilarName, pilarAcoes]) => (
          <div key={pilarName} className="flex flex-col gap-3">
            {/* Pilar Header - FIXO na tela e sem sanfona */}
            <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-lg flex items-center justify-between shadow-sm">
               <h3 className="text-sm font-black text-sky-400 uppercase tracking-wider">{pilarName}</h3>
               <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">{pilarAcoes.length} Ações</span>
            </div>
            
            {/* Ações listadas diretamente */}
            <div className="space-y-3 pl-4 border-l-2 border-slate-800/50 ml-2">
              {pilarAcoes.map((acao) => {`;

code = code.replace(targetStr, newStr);

// We need to add closing tags for the map
// We know that at the end of acoes mapping, it has:
//               </AnimatePresence>
//             </div>
//           );
//         })}
//       </div>
const endTargetStr = `              </AnimatePresence>
            </div>
          );
        })}
      </div>`;
const newEndStr = `              </AnimatePresence>
            </div>
          );
        })}
            </div>
          </div>
        ))}
      </div>`;

code = code.replace(endTargetStr, newEndStr);
fs.writeFileSync('src/components/HierarchyView.tsx', code);
