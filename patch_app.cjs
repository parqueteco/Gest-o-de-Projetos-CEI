const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetMain = `      {/* Main Content */}
      <main className="flex-1 ml-72 h-screen overflow-hidden flex flex-col relative">
        <div className="absolute top-6 right-8 z-50 flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-lg pl-4 pr-1 py-1">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Central de Alertas</span>
           <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
        </div>
        <div className="flex-1 overflow-hidden p-8 flex flex-col">
        {activeTab === 'dashboard' ? (
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
            onDataChanged={fetchData}
            targetHighlight={targetHighlight}
          />
        )}`;

const newMain = `      {/* Main Content */}
      <main className="flex-1 ml-72 h-screen overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-hidden p-8 flex flex-col">
        {activeTab === 'dashboard' ? (
          <Dashboard 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades} 
            headerAction={
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-lg pl-4 pr-1 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Central de Alertas</span>
                <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
              </div>
            }
          />
        ) : (
          <HierarchyView 
            acoes={filteredAcoes} 
            atividades={filteredAtividades} 
            subatividades={filteredSubatividades}
            onDataChanged={fetchData}
            targetHighlight={targetHighlight}
            headerAction={
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-lg pl-4 pr-1 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Central de Alertas</span>
                <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
              </div>
            }
          />
        )}`;

code = code.replace(targetMain, newMain);

fs.writeFileSync('src/App.tsx', code);
