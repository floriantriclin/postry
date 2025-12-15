import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERREUR CRITIQUE : Les clés Supabase sont manquantes ! Vérifie le .env.local");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey)