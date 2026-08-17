const fs = require('fs');
let code = fs.readFileSync('src/components/ControlePrazos.tsx', 'utf8');

const targetCheck = `    const isUserTask = (responsavelStr?: string, targetName?: string) => {
      if (!responsavelStr) return false;
      const respList = responsavelStr.split(',').map(r => r.trim().toLowerCase());
      
      if (targetName) {
        return respList.includes(targetName.trim().toLowerCase());
      }
      return (userName && respList.includes(userName)) || (userEmail && respList.includes(userEmail));
    };`;

const newCheck = `    const isUserTask = (responsavelStr?: string, targetName?: string) => {
      if (!responsavelStr) return false;
      const respList = responsavelStr.split(',').map(r => r.trim().toLowerCase());
      
      if (targetName) {
        return respList.includes(targetName.trim().toLowerCase());
      }
      
      const userFirstNames = new Set<string>();
      if (userName) userFirstNames.add(userName.split(' ')[0]);
      if (userEmail) userFirstNames.add(userEmail.split('@')[0].split('.')[0]);

      for (const r of respList) {
        if (userName && r === userName) return true;
        if (userEmail && r === userEmail) return true;
        if (userFirstNames.has(r.split(' ')[0])) return true;
      }
      return false;
    };`;

code = code.replace(targetCheck, newCheck);
fs.writeFileSync('src/components/ControlePrazos.tsx', code);
