const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const targetHandleClick = `  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveReadIds([...readIds, id]);
  };

  const handleNotificationClick = (notification: AppNotification) => {
    saveReadIds([...readIds, notification.id]);
    setIsOpen(false);
    onNotificationClick(notification.acaoId, notification.atividadeId, notification.subatividadeId, notification.comentarioId);
  };`;

const newHandleClick = `  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveReadIds([...readIds, id]);
  };

  const handleNotificationClick = (notification: AppNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Clique na notificação disparado:", notification);
    
    // 1. Marcar como lida primeiro
    saveReadIds([...readIds, notification.id]);
    setIsOpen(false);
    
    // 2. Chamar o handler de navegação protegido por try/catch
    try {
      onNotificationClick(notification.acaoId, notification.atividadeId, notification.subatividadeId, notification.comentarioId);
    } catch (err) {
      console.error("Erro ao navegar para a notificação:", err);
    }
  };`;

code = code.replace(targetHandleClick, newHandleClick);

const targetDiv = `<div key={notification.id} onClick={() => handleNotificationClick(notification)} className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors group relative pr-10">`;
const newDiv = `<div key={notification.id} onClick={(e) => handleNotificationClick(notification, e)} className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors group relative pr-10">`;

code = code.replace(targetDiv, newDiv);

fs.writeFileSync('src/components/Notifications.tsx', code);
