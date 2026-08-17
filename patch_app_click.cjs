const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetMain = `          <ControlePrazos 
            acoes={filteredAcoes}
            atividades={filteredAtividades}
            subatividades={filteredSubatividades}
            session={session}
            onDataChanged={() => loadData(false)}
            headerAction={`;

const newMain = `          <ControlePrazos 
            acoes={filteredAcoes}
            atividades={filteredAtividades}
            subatividades={filteredSubatividades}
            session={session}
            onDataChanged={() => loadData(false)}
            onTaskClick={handleNotificationClick}
            headerAction={`;

code = code.replace(targetMain, newMain);
fs.writeFileSync('src/App.tsx', code);
