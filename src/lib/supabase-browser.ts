import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase browser client using the anonymous key.
 * Safe for use in Client Components.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
