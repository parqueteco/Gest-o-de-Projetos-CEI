const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const calcTarget = `                        const ativSubatividades = subatividades.filter(s => s.IDAtividade === ativ.IDAtividade).sort((a, b) => {
                          const orderA = parseInt(a.OrdemSub || '0') || 0;
                          const orderB = parseInt(b.OrdemSub || '0') || 0;
                          return orderA - orderB;
                        });`;

const newCalcTarget = calcTarget + `

                        const totalSub = ativSubatividades.length;
                        const doneSub = ativSubatividades.filter(s => s.Status?.trim() === 'Realizado').length;
                        const progressoSub = totalSub === 0 ? 0 : Math.round((doneSub / totalSub) * 100);`;

code = code.replace(calcTarget, newCalcTarget);


const titleTarget = `                                <div className="text-xs font-black text-slate-200">
                                  {ativ.Atividade}
                                </div>`;

const newTitleTarget = `                                <div className="flex items-center gap-4">
                                  <div className="text-xs font-black text-slate-200">
                                    {ativ.Atividade}
                                  </div>
                                  {totalSub > 0 && (
                                    <div className="flex items-center gap-3 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/50">
                                      <span className="text-[9px] uppercase font-black text-slate-400">{totalSub} Subativ.</span>
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-sky-500 transition-all" style={{ width: \`\${progressoSub}%\` }} />
                                        </div>
                                        <span className="text-[9px] font-black text-sky-400 w-6">{progressoSub}%</span>
                                      </div>
                                    </div>
                                  )}
                                </div>`;

code = code.replace(titleTarget, newTitleTarget);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
