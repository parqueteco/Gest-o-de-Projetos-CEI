const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const targetCheck = `    const checkTask = (task: Atividade | Subatividade, isSub: boolean) => {
      if (!isUserTask(task.Responsavel)) return;`;

const newCheck = `    const checkTask = (task: Atividade | Subatividade, isSub: boolean) => {
      if (!isUserTask(task.Responsavel)) return;`;
      // Actually, I can just do this in alerts.push or inside checkTask

// Wait, I will just filter them right before alerts.push
code = code.replace(/alerts\.push\(\{/g, "const alertObj = {");
code = code.replace(/taskId,\n              acaoId,\n              atividadeId,\n              subatividadeId\n            \}\);/g, "taskId,\n              acaoId,\n              atividadeId,\n              subatividadeId\n            };\n            if (!readIds.includes(alertObj.id)) alerts.push(alertObj);");

fs.writeFileSync('src/components/Notifications.tsx', code);
