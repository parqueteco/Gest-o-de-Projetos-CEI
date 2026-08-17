const fs = require('fs');
let code = fs.readFileSync('src/components/HierarchyView.tsx', 'utf8');

const targetUseEffect = `  useEffect(() => {
    if (targetHighlight) {
      if (targetHighlight.acaoId) {
        setExpandedAcoes(prev => new Set([...prev, targetHighlight.acaoId!]));
      }
      if (targetHighlight.atividadeId) {
        setExpandedAtividades(prev => new Set([...prev, targetHighlight.atividadeId!]));
      }
      if (targetHighlight.subatividadeId) {
        setExpandedSubatividades(prev => new Set([...prev, targetHighlight.subatividadeId!]));
      }

      // Allow React to render expanded items, then scroll
      setTimeout(() => {
        let targetId = null;
        if (targetHighlight.subatividadeId) targetId = \`sub-\${targetHighlight.subatividadeId}\`;
        else if (targetHighlight.atividadeId) targetId = \`ativ-\${targetHighlight.atividadeId}\`;
        else if (targetHighlight.acaoId) targetId = \`acao-\${targetHighlight.acaoId}\`;

        if (targetId) {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add temporary highlight effect
            element.classList.add('ring-2', 'ring-sky-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all', 'duration-500');
            
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-sky-500', 'ring-offset-2', 'ring-offset-slate-900');
            }, 2500);
          }
        }
      }, 150);
    }
  }, [targetHighlight]);`;

const newUseEffect = `  useEffect(() => {
    if (targetHighlight) {
      // 1. Force state expansion
      if (targetHighlight.acaoId) {
        setExpandedAcoes(prev => new Set([...prev, targetHighlight.acaoId!]));
      }
      if (targetHighlight.atividadeId) {
        setExpandedAtividades(prev => new Set([...prev, targetHighlight.atividadeId!]));
      }
      if (targetHighlight.subatividadeId) {
        setExpandedSubatividades(prev => new Set([...prev, targetHighlight.subatividadeId!]));
      }

      // 2. Race condition handler: try to find the element repeatedly until it's mounted
      let targetId = null;
      if (targetHighlight.comentarioId) targetId = \`comentario-\${targetHighlight.comentarioId}\`;
      else if (targetHighlight.subatividadeId) targetId = \`sub-\${targetHighlight.subatividadeId}\`;
      else if (targetHighlight.atividadeId) targetId = \`ativ-\${targetHighlight.atividadeId}\`;
      else if (targetHighlight.acaoId) targetId = \`acao-\${targetHighlight.acaoId}\`;

      if (targetId) {
        let attempts = 0;
        const maxAttempts = 15; // 15 * 100ms = 1.5s max wait
        
        const attemptScroll = () => {
          const element = document.getElementById(targetId);
          if (element) {
            // Found it! Scroll and highlight
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            element.classList.add('ring-2', 'ring-sky-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all', 'duration-500', 'bg-sky-500/10');
            
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-sky-500', 'ring-offset-2', 'ring-offset-slate-900', 'bg-sky-500/10');
            }, 2500);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(attemptScroll, 100);
          }
        };
        
        // Start checking
        setTimeout(attemptScroll, 50);
      }
    }
  }, [targetHighlight]);`;

code = code.replace(targetUseEffect, newUseEffect);

fs.writeFileSync('src/components/HierarchyView.tsx', code);
