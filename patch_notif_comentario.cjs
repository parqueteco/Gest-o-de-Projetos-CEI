const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const targetProps = `interface NotificationsProps {
  session: Session | null;
  atividades: Atividade[];
  subatividades: Subatividade[];
  onNotificationClick: (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null) => void;
}`;

const newProps = `interface NotificationsProps {
  session: Session | null;
  atividades: Atividade[];
  subatividades: Subatividade[];
  onNotificationClick: (acaoId: string | null, atividadeId: string | null, subatividadeId: string | null, comentarioId?: string | null) => void;
}`;
code = code.replace(targetProps, newProps);

const targetType = `interface AppNotification {
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
  comentarioId?: string | null;
}`;
code = code.replace(targetType, newType);

const targetHandle = `  const handleNotificationClick = (notification: AppNotification) => {
    saveReadIds([...readIds, notification.id]);
    setIsOpen(false);
    onNotificationClick(notification.acaoId, notification.atividadeId, notification.subatividadeId);
  };`;

const newHandle = `  const handleNotificationClick = (notification: AppNotification) => {
    saveReadIds([...readIds, notification.id]);
    setIsOpen(false);
    onNotificationClick(notification.acaoId, notification.atividadeId, notification.subatividadeId, notification.comentarioId);
  };`;
code = code.replace(targetHandle, newHandle);

const targetComentario = `            id: \`notif-comentario-\${taskId}-\${log.date}\`,
            type: 'comentario',
            title: title,
            description: \`Novo comentário: "\${log.text.substring(0, 40)}\${log.text.length > 40 ? '...' : ''}"\`,
            date: logDate,
            taskId,
            acaoId,
            atividadeId,
            subatividadeId
          };`;

const newComentario = `            id: \`notif-comentario-\${taskId}-\${log.date}\`,
            type: 'comentario',
            title: title,
            description: \`Novo comentário: "\${log.text.substring(0, 40)}\${log.text.length > 40 ? '...' : ''}"\`,
            date: logDate,
            taskId,
            acaoId,
            atividadeId,
            subatividadeId,
            comentarioId: log.date
          };`;
code = code.replace(targetComentario, newComentario);

fs.writeFileSync('src/components/Notifications.tsx', code);
