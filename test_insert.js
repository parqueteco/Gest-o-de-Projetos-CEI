import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://fyjmiueunzvpbfavxbpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5am1pdWV1bnp2cGJmYXZ4YnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDcwMjAsImV4cCI6MjEwMDIyMzAyMH0.-pLvJsq-9BpLzKCZhXU_V7DYzXluY0PpvwY-CVp4vQM';
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  const payload = {
        idacao: `ACAO-${Math.random().toString(36).substring(2, 9)}`,
        pilar: 'test',
        nomeacao: 'test',
        metafinep: 'test',
        rubricaorcamentaria: 'test',
        valorestimado: 'test'
  };
  const { data, error } = await supabase.from('acoes').insert([payload]);
  console.log('Error:', error);
}
run();
