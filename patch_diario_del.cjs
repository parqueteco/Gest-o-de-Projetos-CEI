const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

const targetDel = `  const handleDelete = async (indexToDelete: number) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) return;
    setIsSubmitting(true);
    
    const updatedLogs = logs.filter((_, i) => i !== indexToDelete);
    const newObservacao = updatedLogs.length > 0 ? JSON.stringify(updatedLogs) : null;
    
    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
      onDataChanged();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir nota: ' + (err.message || 'Falha na comunicação com o banco'));
    } finally {
      setIsSubmitting(false);
    }
  };`;

const oldDelRegex = /const handleDelete = async \([\s\S]*?finally {\s*setIsSubmitting\(false\);\s*}\s*};/;
code = code.replace(oldDelRegex, targetDel);

const oldAdd = /await supabase\.from\(table\)\.update\({ observacao: newObservacao }\)\.eq\(idField, id\);/g;
code = code.replace(oldAdd, `const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);\n      if (error) throw error;`);

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
