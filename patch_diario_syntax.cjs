const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

code = code.replace(/const \{ error \} = const \{ error \} = await supabase/g, 'const { error } = await supabase');
code = code.replace(/      if \\(error\\) throw error;\n      if \\(error\\) \{/g, '      if (error) {');

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
