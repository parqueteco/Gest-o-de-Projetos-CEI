const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `      <main className="flex-1 ml-72 h-screen overflow-hidden flex flex-col relative">
        <div className="absolute top-6 right-8 z-50 flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-full shadow-lg pl-4 pr-1 py-1">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Notificações</span>
           <Notifications session={session} atividades={atividades} subatividades={subatividades} onNotificationClick={handleNotificationClick} />
        </div>
        <div className="flex-1 overflow-hidden p-8 flex flex-col">`;

const newStr = `      <main className="flex-1 ml-72 h-screen overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-hidden p-8 flex flex-col">`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/App.tsx', code);
