const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const targetSaveRead = `  const saveReadIds = (ids: string[]) => {
    setReadIds(ids);
    if (session?.user?.email) {
      localStorage.setItem(\`read_notifications_\${session.user.email}\`, JSON.stringify(ids));
    }
  };`;

const newSaveRead = `  const saveReadIds = (ids: string[]) => {
    setReadIds(prev => {
      const next = Array.from(new Set([...prev, ...ids]));
      if (session?.user?.email) {
        localStorage.setItem(\`read_notifications_\${session.user.email}\`, JSON.stringify(next));
      }
      return next;
    });
  };`;

code = code.replace(targetSaveRead, newSaveRead);

// I also need to update the calls to pass arrays, because saveReadIds now merges with prev.
// Wait, if saveReadIds merges with prev, then passing `[...readIds, id]` is redundant but safe because of Set.
// Let's change the calls to just pass the new IDs.
code = code.replace(/saveReadIds\(\[\.\.\.readIds, \.\.\.allIds\]\);/g, "saveReadIds(allIds);");
code = code.replace(/saveReadIds\(\[\.\.\.readIds, id\]\);/g, "saveReadIds([id]);");
code = code.replace(/saveReadIds\(\[\.\.\.readIds, notification\.id\]\);/g, "saveReadIds([notification.id]);");

fs.writeFileSync('src/components/Notifications.tsx', code);
