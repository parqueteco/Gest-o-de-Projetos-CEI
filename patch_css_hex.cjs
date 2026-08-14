const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const target = `body.theme-light {
  --color-slate-950: var(--color-slate-50);
  --color-slate-900: #ffffff;
  --color-slate-800: var(--color-slate-200);
  --color-slate-700: var(--color-slate-300);
  --color-slate-600: var(--color-slate-400);
  --color-slate-500: var(--color-slate-500);
  --color-slate-400: var(--color-slate-700);
  --color-slate-300: var(--color-slate-800);
  --color-slate-200: var(--color-slate-900);
  --color-slate-100: var(--color-slate-950);
  --color-slate-50:  #000000;
}`;

const hex = `body.theme-light {
  --color-slate-950: #f8fafc;
  --color-slate-900: #ffffff;
  --color-slate-800: #e2e8f0;
  --color-slate-700: #cbd5e1;
  --color-slate-600: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-400: #475569;
  --color-slate-300: #334155;
  --color-slate-200: #1e293b;
  --color-slate-100: #0f172a;
  --color-slate-50:  #000000;
}`;

code = code.replace(target, hex);
fs.writeFileSync('src/index.css', code);
