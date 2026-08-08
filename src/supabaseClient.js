import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjfvmbpkqrhvvwukgmow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZnZtYnBrcXJodnZ3dWtnbW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjY3ODMsImV4cCI6MjEwMTcwMjc4M30.zeLNrpz0lCC0pm1ZefUT8-7LdtGNYmzJuVrXRRPsfEs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
