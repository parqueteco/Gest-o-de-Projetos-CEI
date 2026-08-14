import { createClient } from '@supabase/supabase-js';

// We get these from the user's prompt or environment variables
const supabaseUrl = 'https://fyjmiueunzvpbfavxbpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5am1pdWV1bnp2cGJmYXZ4YnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDcwMjAsImV4cCI6MjEwMDIyMzAyMH0.-pLvJsq-9BpLzKCZhXU_V7DYzXluY0PpvwY-CVp4vQM';

export const supabase = createClient(supabaseUrl, supabaseKey);
