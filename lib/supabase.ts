import { createClient } from '@supabase/supabase-js'

// On récupère les variables d'environnement.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// On vérifie si les variables sont bien présentes.
// C'est la cause la plus probable de l'erreur client-side.
if (!supabaseUrl || !supabaseAnonKey) {
  // On affiche une erreur claire dans la console du navigateur (F12)
  console.error(
    'Supabase URL or Anon Key is missing. Check your .env.local file (for local dev) or Environment Variables on Vercel (for production).'
  )
}

// On exporte un client Supabase initialisé.
// S'il manque une clé, l'application plantera ici, mais l'erreur sera claire.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)