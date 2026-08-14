const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const targetStr = `                      {acaoAtividades.map(ativ => {
                        const isAtivExpanded = expandedAtividades.has(ativ.IDAtividade);`;

const newStr = `                      {acaoAtividades.map((ativ, idx) => {
                        const isAtivExpanded = expandedAtividades.has(ativ.IDAtividade);`;

code = code.replace(targetStr, newStr);

const targetDiv = `                        return (
                          <div key={ativ.IDAtividade} className={\`border \${isAtivExpanded ? 'border-slate-700' : 'border-slate-800/80'} rounded flex flex-col bg-slate-950/40 transition-colors\`}>
                            {/* Atividade Header */}
                            <div 
                              className={\`p-3 flex items-start gap-3 cursor-pointer group hover:bg-slate-900/80 transition-colors \${isAtivExpanded ? 'border-b border-slate-800/80' : ''}\`}
                              onClick={() => toggleAtividade(ativ.IDAtividade)}
                            >
                              <div className="mt-0.5 text-slate-500 flex-shrink-0">
                                {isAtivExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </div>`;

const newDiv = `                        return (
                          <div key={ativ.IDAtividade} className={\`relative group/row border \${isAtivExpanded ? 'border-slate-700' : 'border-slate-800/80'} rounded flex flex-col bg-slate-950/40 transition-colors\`}>
                            {idx > 0 && (
                              <div className="absolute -top-1.5 left-0 right-0 h-3 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity z-10">
                                <div className="absolute h-[1px] w-full bg-sky-500/50"></div>
                                <button
                                  onClick={() => insertAtividadeAt(idx, acao.IDAcao, acaoAtividades)}
                                  className="relative bg-slate-900 border border-sky-500/50 text-sky-400 hover:bg-sky-500 hover:text-slate-900 rounded-full p-0.5 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            {/* Atividade Header */}
                            <div 
                              className={\`p-3 flex items-start gap-3 cursor-pointer group hover:bg-slate-900/80 transition-colors \${isAtivExpanded ? 'border-b border-slate-800/80' : ''}\`}
                              onClick={() => toggleAtividade(ativ.IDAtividade)}
                            >
                              <div className="mt-0.5 text-slate-500 flex-shrink-0">
                                {isAtivExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </div>
                              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5" onClick={e => e.stopPropagation()}>
                                <button onClick={() => moveAtividade(ativ.IDAtividade, 'up', acaoAtividades)} disabled={idx === 0} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowUp className="w-3.5 h-3.5" /></button>
                                <button onClick={() => moveAtividade(ativ.IDAtividade, 'down', acaoAtividades)} disabled={idx === acaoAtividades.length - 1} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowDown className="w-3.5 h-3.5" /></button>
                              </div>`;

code = code.replace(targetDiv, newDiv);
fs.writeFileSync('src/components/HierarchyView.tsx', code);
