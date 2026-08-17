const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

const targetRender = `              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(log.date)}</span>
                {editingIndex !== index && (`;

const newRender = `              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {log.author && (
                    <span className="text-[10px] font-black text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                      👤 {log.author}
                    </span>
                  )}
                  <span className="text-[10px] font-black text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> [{formatDate(log.date)}]
                  </span>
                </div>
                {editingIndex !== index && (`;

code = code.replace(targetRender, newRender);
fs.writeFileSync('src/components/DiarioBordo.tsx', code);
