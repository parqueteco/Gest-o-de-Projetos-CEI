const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const targetUnread = `  const unreadNotifications = notifications.filter(n => !readIds.includes(n.id));`;
const newUnread = `  const unreadNotifications = notifications;`;

code = code.replace(targetUnread, newUnread);
fs.writeFileSync('src/components/Notifications.tsx', code);
