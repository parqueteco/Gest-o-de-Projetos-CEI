const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

const oldFormatDate = `  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };`;

const newFormatDate = `  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return \`[\${day}/\${month}/\${year} - \${hours}:\${minutes}]\`;
    } catch {
      return isoString;
    }
  };`;

code = code.replace(oldFormatDate, newFormatDate);

// Also replace the timeline rendering:
const oldTimeline = `<span className="text-[9px] font-black text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(log.date)}</span>`;
const newTimeline = `<span className="text-[10px] font-black text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(log.date)}</span>`;
code = code.replace(oldTimeline, newTimeline);

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
