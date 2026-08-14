const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const loadData = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const [`;

const newCode = `  const loadData = async (showLoadingIndicator = true, retryCount = 0) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const [`;

code = code.replace(target, newCode);

const catchTarget = `    } catch (error) {
      console.error("Error loading Supabase data:", error);
      alert("Erro ao carregar dados do banco de dados.");
    } finally {`;

const newCatch = `    } catch (error: any) {
      console.error("Error loading Supabase data:", error);
      
      // Handle JWT issued at future error (clock skew between auth and db)
      if (error.code === 'PGRST303' && retryCount < 3) {
        console.log(\`Retrying loadData due to PGRST303 (attempt \${retryCount + 1})...\`);
        setTimeout(() => loadData(false, retryCount + 1), 1000);
        return;
      }
      
      alert("Erro ao carregar dados do banco de dados.");
    } finally {`;

code = code.replace(catchTarget, newCatch);
fs.writeFileSync('src/App.tsx', code);
