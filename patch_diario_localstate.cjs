const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

const targetState = `  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const logs = parseObservacao(rawObservacao);`;

const newState = `  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const [localLogs, setLocalLogs] = React.useState<LogEntry[]>(parseObservacao(rawObservacao));

  React.useEffect(() => {
    setLocalLogs(parseObservacao(rawObservacao));
  }, [rawObservacao]);

  const logs = localLogs;`;

code = code.replace(targetState, newState);

const targetDel = `    const updatedLogs = logs.filter((_, i) => i !== indexToDelete);
    const newObservacao = updatedLogs.length > 0 ? JSON.stringify(updatedLogs) : null;
    
    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
      onDataChanged();
    } catch (err) {`;

const newDel = `    const updatedLogs = logs.filter((_, i) => i !== indexToDelete);
    const newObservacao = updatedLogs.length > 0 ? JSON.stringify(updatedLogs) : null;
    
    // Optimistic UI update
    setLocalLogs(updatedLogs);

    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) {
        throw error;
      }
      onDataChanged();
    } catch (err) {
      // Revert on error
      setLocalLogs(logs);
      console.error(err);`;

code = code.replace(targetDel, newDel);

const targetAdd = `    const newLog: LogEntry = {
      date: new Date().toISOString(),
      text: newNote.trim()
    };
    
    const updatedLogs = [newLog, ...logs];
    const newObservacao = JSON.stringify(updatedLogs);
    
    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) throw error;
      setNewNote('');
      onDataChanged();
    } catch (err) {`;

const newAdd = `    const newLog: LogEntry = {
      date: new Date().toISOString(),
      text: newNote.trim()
    };
    
    const updatedLogs = [newLog, ...logs];
    const newObservacao = JSON.stringify(updatedLogs);
    
    // Optimistic UI update
    setLocalLogs(updatedLogs);

    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) throw error;
      setNewNote('');
      onDataChanged();
    } catch (err) {
      setLocalLogs(logs); // revert`;

code = code.replace(targetAdd, newAdd);

const targetEdit = `    const updatedLogs = [...logs];
    updatedLogs[index] = { ...updatedLogs[index], text: editValue.trim() };
    const newObservacao = JSON.stringify(updatedLogs);
    
    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) throw error;
      setEditingIndex(null);
      setEditValue('');
      onDataChanged();
    } catch (err) {`;

const newEdit = `    const updatedLogs = [...logs];
    updatedLogs[index] = { ...updatedLogs[index], text: editValue.trim() };
    const newObservacao = JSON.stringify(updatedLogs);
    
    // Optimistic UI update
    setLocalLogs(updatedLogs);

    try {
      const { error } = await supabase.from(table).update({ observacao: newObservacao }).eq(idField, id);
      if (error) throw error;
      setEditingIndex(null);
      setEditValue('');
      onDataChanged();
    } catch (err) {
      setLocalLogs(logs); // revert`;

code = code.replace(targetEdit, newEdit);

fs.writeFileSync('src/components/DiarioBordo.tsx', code);
