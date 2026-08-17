const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const targetProps = `interface NotificationsProps {
  session: Session | null;
  atividades: Atividade[];
  subatividades: Subatividade[];
}`;

const newProps = `interface NotificationsProps {
  session: Session | null;
  atividades: Atividade[];
  subatividades: Subatividade[];
  onNotificationClick: (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null) => void;
}`;
code = code.replace(targetProps, newProps);

const targetType = `interface AppNotification {
  id: string;
  type: 'vencido' | 'proximo' | 'comentario';
  title: string;
  description: string;
  date: Date;
  taskId: string;
}`;

const newType = `interface AppNotification {
  id: string;
  type: 'vencido' | 'proximo' | 'comentario';
  title: string;
  description: string;
  date: Date;
  taskId: string;
  acaoId: string | null;
  atividadeId: string | null;
  subatividadeId: string | null;
}`;
code = code.replace(targetType, newType);

// Update component signature
const targetSig = `export function Notifications({ session, atividades, subatividades }: NotificationsProps) {`;
const newSig = `export function Notifications({ session, atividades, subatividades, onNotificationClick }: NotificationsProps) {`;
code = code.replace(targetSig, newSig);

// Update isUserTask logic to use full object 
const oldCheckTask = `    const checkTask = (task: Atividade | Subatividade, isSub: boolean) => {
      if (!isUserTask(task.Responsavel)) return;

      const title = isSub ? (task as Subatividade).Subatividade : (task as Atividade).Atividade;
      const taskId = isSub ? (task as Subatividade).IDSubatividade : (task as Atividade).IDAtividade;`;

const newCheckTask = `    const checkTask = (task: Atividade | Subatividade, isSub: boolean) => {
      if (!isUserTask(task.Responsavel)) return;

      const title = isSub ? (task as Subatividade).Subatividade : (task as Atividade).Atividade;
      const taskId = isSub ? (task as Subatividade).IDSubatividade : (task as Atividade).IDAtividade;
      
      let acaoId = null;
      let atividadeId = null;
      let subatividadeId = null;
      
      if (isSub) {
        subatividadeId = taskId;
        atividadeId = (task as Subatividade).IDAtividade;
        const parentAtiv = atividades.find(a => a.IDAtividade === atividadeId);
        if (parentAtiv) acaoId = parentAtiv.Acoes;
      } else {
        atividadeId = taskId;
        acaoId = (task as Atividade).Acoes;
      }
`;
code = code.replace(oldCheckTask, newCheckTask);

// Update alerts.push to include these properties
code = code.replace(/taskId\n            }\);/g, "taskId,\n              acaoId,\n              atividadeId,\n              subatividadeId\n            });");

fs.writeFileSync('src/components/Notifications.tsx', code);
