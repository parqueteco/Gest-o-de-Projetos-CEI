const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const targetProps = `interface DashboardProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
}`;
const newProps = `interface DashboardProps {
  acoes: Acao[];
  atividades: Atividade[];
  subatividades: Subatividade[];
  headerAction?: React.ReactNode;
}`;
code = code.replace(targetProps, newProps);

const targetComp = `export default function Dashboard({ acoes, atividades, subatividades }: DashboardProps) {`;
const newComp = `export default function Dashboard({ acoes, atividades, subatividades, headerAction }: DashboardProps) {`;
code = code.replace(targetComp, newComp);

const targetHeader = `      <header className="flex flex-col gap-6 flex-shrink-0">
        <div className="flex justify-between items-end">
          <div className="flex gap-12">`;
const newHeader = `      <header className="flex flex-col gap-6 flex-shrink-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-12 items-end flex-wrap">`;
code = code.replace(targetHeader, newHeader);

const targetAtrasadas = `            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Tarefas Atrasadas</p>
              <p className="text-4xl font-black text-rose-500">{totalLate}</p>
            </div>
          </div>
        </div>`;
const newAtrasadas = `            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Tarefas Atrasadas</p>
              <p className="text-4xl font-black text-rose-500">{totalLate}</p>
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>`;
code = code.replace(targetAtrasadas, newAtrasadas);

fs.writeFileSync('src/components/Dashboard.tsx', code);
