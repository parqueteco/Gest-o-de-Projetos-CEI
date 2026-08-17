const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const oldBadge = `{unreadNotifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900"></span>
        )}`;

const newBadge = `{unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 rounded-full border-2 border-slate-900 text-[9px] font-black text-white px-1">
            {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
          </span>
        )}`;

code = code.replace(oldBadge, newBadge);
fs.writeFileSync('src/components/Notifications.tsx', code);
