const fs = require('fs');

['src/components/DiarioBordo.tsx', 'src/components/Notifications.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/export interface LogEntry \{[\s\S]*?\}/g, "export interface LogEntry {\n  date: string;\n  text: string;\n  author?: string;\n}");
  fs.writeFileSync(file, code);
});
