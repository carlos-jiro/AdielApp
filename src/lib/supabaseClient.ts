import { createClient } from '@supabase/supabase-js'

// Usamos "!" al final para decirle a TS: "Confía en mí, estas variables existen"
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)