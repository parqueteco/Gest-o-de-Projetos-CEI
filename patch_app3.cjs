const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `        {activeTab === 'dashboard' ? (
          <Dashboard 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades} 
          />
        ) : (
          <HierarchyView 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades}
            targetHighlight={targetHighlight} 
            onUpdateSubatividadeStatus={handleUpdateSubatividadeStatus}
            onAddSubatividade={handleAddSubatividade}
            onDataChanged={() => loadData(false)}
          />
        )}`;

const newStr = `        {activeTab === 'dashboard' ? (
          <Dashboard 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades} 
            headerAction={
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-sm pl-4 pr-1 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Notificações</span>
                <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
              </div>
            }
          />
        ) : (
          <HierarchyView 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades}
            targetHighlight={targetHighlight} 
            onUpdateSubatividadeStatus={handleUpdateSubatividadeStatus}
            onAddSubatividade={handleAddSubatividade}
            onDataChanged={() => loadData(false)}
            headerAction={
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-sm pl-4 pr-1 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Notificações</span>
                <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
              </div>
            }
          />
        )}`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/App.tsx', code);
