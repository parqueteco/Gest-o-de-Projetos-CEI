const fs = require('fs');
let code = fs.readFileSync('src/components/DiarioBordo.tsx', 'utf8');

const targetAdd = `  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    
    const newLog: LogEntry = {
      date: new Date().toISOString(),
      text: newNote.trim()
    };`;

const newAdd = `  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    
    let author = 'Usuário';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        author = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário';
      }
    } catch(e) {}
    
    const newLog: LogEntry = {
      date: new Date().toISOString(),
      text: newNote.trim(),
      author: author
    };`;

code = code.replace(targetAdd, newAdd);
fs.writeFileSync('src/components/DiarioBordo.tsx', code);
