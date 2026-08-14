const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf-8');

const targetStr = `  const moveSubatividade = async (subId: string, direction: 'up' | 'down', currentList: Subatividade[]) => {`;

const newStr = `  const moveAtividade = async (ativId: string, direction: 'up' | 'down', currentList: Atividade[]) => {
    const currentIndex = currentList.findIndex(a => a.IDAtividade === ativId);
    if (currentIndex < 0) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === currentList.length - 1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    const updates = currentList.map((ativ, index) => {
      let order = index;
      if (index === currentIndex) order = newIndex;
      if (index === newIndex) order = currentIndex;
      return { idatividade: ativ.IDAtividade, ordem: order.toString() };
    });

    try {
      await Promise.all(
        updates.map(update => 
          supabase.from('atividades').update({ ordem: update.ordem }).eq('idatividade', update.idatividade)
        )
      );
      onDataChanged();
    } catch (err) {
      console.error(err);
      alert('Erro ao reordenar atividade');
    }
  };

  const [insertOrderAtiv, setInsertOrderAtiv] = useState<string | null>(null);

  const insertAtividadeAt = async (index: number, acaoId: string, currentList: Atividade[]) => {
    const updates = currentList.map((ativ, i) => {
      let order = i < index ? i : i + 1;
      return { idatividade: ativ.IDAtividade, ordem: order.toString() };
    });

    try {
      await Promise.all(
        updates.map(update => 
          supabase.from('atividades').update({ ordem: update.ordem }).eq('idatividade', update.idatividade)
        )
      );
      setInsertOrderAtiv(index.toString());
      setActiveAcaoId(acaoId);
      setEditingAtiv(null);
      setAtividadeModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao preparar inserção');
    }
  };

  const moveSubatividade = async (subId: string, direction: 'up' | 'down', currentList: Subatividade[]) => {`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/HierarchyView.tsx', code);
