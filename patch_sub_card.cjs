const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const target = `                                              <div className="flex items-start gap-3 group p-3 rounded bg-slate-950/40 hover:bg-slate-900/80 transition-colors border border-slate-800/80 hover:border-slate-700">
                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                                                  <button onClick={() => moveSubatividade(sub.IDSubatividade, 'up', ativSubatividades)} disabled={idx === 0} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowUp className="w-3.5 h-3.5" /></button>
                                                  <button onClick={() => moveSubatividade(sub.IDSubatividade, 'down', ativSubatividades)} disabled={idx === ativSubatividades.length - 1} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowDown className="w-3.5 h-3.5" /></button>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    {subLate && <span className="inline-flex items-center gap-1 text-[8px] uppercase font-black text-rose-500 bg-rose-500/20 px-1.5 py-0.5 rounded"><AlertTriangle className="w-2.5 h-2.5"/> Atrasado</span>}
                                                    
                                                    <select
                                                      value={sub.Status || 'Pendente'}
                                                      onChange={(e) => { e.stopPropagation(); handleSubStatusChange(sub.IDSubatividade, e.target.value); }}
                                                      onClick={(e) => e.stopPropagation()}
                                                      className={\`text-[9px] font-black uppercase px-2 py-0.5 rounded border outline-none bg-slate-950/80 appearance-none cursor-pointer \${statusBorderColor} \${statusColor}\`}
                                                    >
                                                      <option value="Pendente">Pendente</option>
                                                      <option value="Em andamento">Em andamento</option>
                                                      <option value="Realizado">Realizado</option>
                                                      <option value="Travado">Travado</option>
                                                      <option value="Cancelado">Cancelado</option>
                                                      <option value="Em espera">Em espera</option>
                                                    </select>
                  
                                                    <span className="bg-slate-900 border border-slate-700 text-sky-400 px-2 py-0.5 rounded text-xs font-semibold uppercase">
                                                      Resp: {sub.Responsavel || '-'}
                                                    </span>
                                                    <div className="bg-slate-900 border border-slate-700 text-sky-400 px-2 py-0.5 rounded text-xs font-semibold uppercase flex items-center gap-1">
                                                      <input 
                                                        type="date" 
                                                        value={sub.DataInicio?.split('/').reverse().join('-') || ''} 
                                                        onChange={e => {
                                                          const dateVal = e.target.value;
                                                          const newDate = dateVal ? dateVal.split('-').reverse().join('/') : '';
                                                          handleDateChange(sub.IDSubatividade, 'subatividades', 'datainicio', newDate);
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                        className="bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                                      />
                                                      até 
                                                      <input 
                                                        type="date" 
                                                        value={sub.DataFim?.split('/').reverse().join('-') || ''} 
                                                        onChange={e => {
                                                          const dateVal = e.target.value;
                                                          const newDate = dateVal ? dateVal.split('-').reverse().join('/') : '';
                                                          handleDateChange(sub.IDSubatividade, 'subatividades', 'datafim', newDate);
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                        className="bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className={\`text-sm md:text-base font-bold leading-tight mt-1 \${isDone ? 'text-slate-500 line-through' : 'text-slate-100'}\`}>
                                                    {sub.Subatividade}
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2 transition-opacity flex-shrink-0">
                                                  <button 
                                                    onClick={() => { setActiveAtividadeId(ativ.IDAtividade); setEditingSub(sub); setSubModalOpen(true); }}
                                                    className="p-1.5 rounded bg-slate-900/50 hover:bg-sky-500 hover:text-slate-950 text-slate-400 transition-all shadow-sm"
                                                    title="Editar Subatividade"
                                                  ><Edit2 className="w-4 h-4" /></button>
                                                  <button 
                                                    onClick={(e) => requestDeleteSub(sub.IDSubatividade, e)}
                                                    className="p-1.5 rounded bg-slate-900/50 hover:bg-rose-500 hover:text-white text-rose-400 transition-all shadow-sm"
                                                    title="Excluir Subatividade"
                                                  ><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                              </div>`;

const replacement = `                                              <div 
                                                className={\`flex flex-col group p-3 rounded bg-slate-950/40 hover:bg-slate-900/80 transition-colors border \${isSubExpanded ? 'border-slate-700' : 'border-slate-800/80 hover:border-slate-700'}\`}
                                                onClick={() => toggleSubatividade(sub.IDSubatividade)}
                                                style={{ cursor: 'pointer' }}
                                              >
                                                <div className="flex items-start gap-3">
                                                  <div className="mt-1 text-slate-500 flex-shrink-0">
                                                    {isSubExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                  </div>
                                                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => moveSubatividade(sub.IDSubatividade, 'up', ativSubatividades)} disabled={idx === 0} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowUp className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => moveSubatividade(sub.IDSubatividade, 'down', ativSubatividades)} disabled={idx === ativSubatividades.length - 1} className="text-slate-500 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-slate-500"><ArrowDown className="w-3.5 h-3.5" /></button>
                                                  </div>
                                                  
                                                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      {subLate && <span className="inline-flex items-center gap-1 text-[8px] uppercase font-black text-rose-500 bg-rose-500/20 px-1.5 py-0.5 rounded"><AlertTriangle className="w-2.5 h-2.5"/> Atrasado</span>}
                                                      
                                                      <select
                                                        value={sub.Status || 'Pendente'}
                                                        onChange={(e) => { e.stopPropagation(); handleSubStatusChange(sub.IDSubatividade, e.target.value); }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={\`text-[9px] font-black uppercase px-2 py-0.5 rounded border outline-none bg-slate-950/80 appearance-none cursor-pointer \${statusBorderColor} \${statusColor}\`}
                                                      >
                                                        <option value="Pendente">Pendente</option>
                                                        <option value="Em andamento">Em andamento</option>
                                                        <option value="Realizado">Realizado</option>
                                                        <option value="Travado">Travado</option>
                                                        <option value="Cancelado">Cancelado</option>
                                                        <option value="Em espera">Em espera</option>
                                                      </select>
                    
                                                      <span className="bg-slate-900 border border-slate-700 text-sky-400 px-2 py-0.5 rounded text-xs font-semibold uppercase">
                                                        Resp: {sub.Responsavel || '-'}
                                                      </span>
                                                      <div className="bg-slate-900 border border-slate-700 text-sky-400 px-2 py-0.5 rounded text-xs font-semibold uppercase flex items-center gap-1">
                                                        <input 
                                                          type="date" 
                                                          value={sub.DataInicio?.split('/').reverse().join('-') || ''} 
                                                          onChange={e => {
                                                            const dateVal = e.target.value;
                                                            const newDate = dateVal ? dateVal.split('-').reverse().join('/') : '';
                                                            handleDateChange(sub.IDSubatividade, 'subatividades', 'datainicio', newDate);
                                                          }}
                                                          onClick={e => e.stopPropagation()}
                                                          className="bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                                        />
                                                        até 
                                                        <input 
                                                          type="date" 
                                                          value={sub.DataFim?.split('/').reverse().join('-') || ''} 
                                                          onChange={e => {
                                                            const dateVal = e.target.value;
                                                            const newDate = dateVal ? dateVal.split('-').reverse().join('/') : '';
                                                            handleDateChange(sub.IDSubatividade, 'subatividades', 'datafim', newDate);
                                                          }}
                                                          onClick={e => e.stopPropagation()}
                                                          className="bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                                        />
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      <div className={\`text-sm md:text-base font-bold leading-tight mt-1 \${isDone ? 'text-slate-500 line-through' : 'text-slate-100'}\`}>
                                                        {sub.Subatividade}
                                                      </div>
                                                      {!isSubExpanded && (
                                                        <div className="flex items-center gap-1.5 mt-1 ml-2">
                                                          {sub.LinkEvidencia && (
                                                            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded flex items-center gap-1" title="Contém Evidência">🔗 Evidência</span>
                                                          )}
                                                          {sub.Observacao && (
                                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1" title="Contém Observação">💬 Observação</span>
                                                          )}
                                                          {sub.IndicadorFisico && (
                                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1" title="Contém Indicador Físico">🎯 Ind. Físico</span>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); setActiveAtividadeId(ativ.IDAtividade); setEditingSub(sub); setSubModalOpen(true); }}
                                                      className="p-1.5 rounded bg-slate-900/50 hover:bg-sky-500 hover:text-slate-950 text-slate-400 transition-all shadow-sm"
                                                      title="Editar Subatividade"
                                                    ><Edit2 className="w-4 h-4" /></button>
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); requestDeleteSub(sub.IDSubatividade, e); }}
                                                      className="p-1.5 rounded bg-slate-900/50 hover:bg-rose-500 hover:text-white text-rose-400 transition-all shadow-sm"
                                                      title="Excluir Subatividade"
                                                    ><Trash2 className="w-4 h-4" /></button>
                                                  </div>
                                                </div>

                                                <AnimatePresence>
                                                  {isSubExpanded && (
                                                    <motion.div
                                                      initial={{ height: 0, opacity: 0 }}
                                                      animate={{ height: 'auto', opacity: 1 }}
                                                      exit={{ height: 0, opacity: 0 }}
                                                      transition={{ duration: 0.2 }}
                                                      className="overflow-hidden"
                                                    >
                                                      <div className="pt-4 pl-10 pr-2 pb-2 space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
                                                        {sub.Descricao && (
                                                          <div className="text-xs text-slate-300">
                                                            <strong className="text-slate-500 block mb-1">Descrição</strong>
                                                            <p className="whitespace-pre-wrap">{sub.Descricao}</p>
                                                          </div>
                                                        )}
                                                        <div className="grid grid-cols-2 gap-4">
                                                          {sub.IndicadorFisico && (
                                                            <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                                                              <strong className="text-[10px] uppercase font-black text-emerald-400 flex items-center gap-1 mb-2"><Target className="w-3 h-3"/> Indicador Físico</strong>
                                                              <p className="text-xs text-slate-300 whitespace-pre-wrap">{sub.IndicadorFisico}</p>
                                                            </div>
                                                          )}
                                                          {sub.Observacao && (
                                                            <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                                                              <strong className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1 mb-2"><MessageSquare className="w-3 h-3"/> Observação</strong>
                                                              <p className="text-xs text-slate-300 whitespace-pre-wrap">{sub.Observacao}</p>
                                                            </div>
                                                          )}
                                                        </div>
                                                        {sub.LinkEvidencia && (
                                                          <div className="mt-2">
                                                            <a href={sub.LinkEvidencia} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-900 rounded border border-sky-500/30 font-bold text-xs transition-colors">
                                                              <LinkIcon className="w-3 h-3" /> Abrir Link de Evidência <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                          </div>
                                                        )}
                                                        {!sub.Descricao && !sub.IndicadorFisico && !sub.Observacao && !sub.LinkEvidencia && (
                                                          <div className="text-xs text-slate-500 italic">Nenhum detalhe adicional preenchido.</div>
                                                        )}
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
