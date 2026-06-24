import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('SEU_PROJETO')) {
  // Aviso em desenvolvimento — o app de gestão não funciona sem isso.
  console.warn(
    '[Supabase] Variáveis SUPABASE_URL / SUPABASE_ANON_KEY não configuradas em .env.local.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
