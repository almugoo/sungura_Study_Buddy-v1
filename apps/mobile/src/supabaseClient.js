import { createClient } from '@supabase/supabase-js';

// Using EXPO_PUBLIC_ for client-side keys
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('WARNING: Supabase URL or Anon Key is missing in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
