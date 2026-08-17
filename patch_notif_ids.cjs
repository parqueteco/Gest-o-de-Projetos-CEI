const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

code = code.replace(/id: \`vencido/g, "id: \`notif-vencido");
code = code.replace(/id: \`proximo/g, "id: \`notif-proximo");
code = code.replace(/id: \`comentario/g, "id: \`notif-comentario");

fs.writeFileSync('src/components/Notifications.tsx', code);
