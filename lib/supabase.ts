import { createClient } from '@supabase/supabase-js'

// Ce client est pour le Navigateur (Frontend). Il n'utilise que les clés PUBLIQUES.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Clés publiques Supabase manquantes. Vérifie .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)