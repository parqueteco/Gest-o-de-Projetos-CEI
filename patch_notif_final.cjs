const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

// We need to fix the useMemo dependencies to include readIds
const targetDeps = `  }, [atividades, subatividades, session]);`;
const newDeps = `  }, [atividades, subatividades, session, readIds]);`;
code = code.replace(targetDeps, newDeps);

fs.writeFileSync('src/components/Notifications.tsx', code);
