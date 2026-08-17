const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const target = `            date: logDate,
            taskId
          });`;

const replacement = `            date: logDate,
            taskId,
            acaoId,
            atividadeId,
            subatividadeId
          };
          if (!readIds.includes(alertObj.id)) alerts.push(alertObj);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/Notifications.tsx', code);
