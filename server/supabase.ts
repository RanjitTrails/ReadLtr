import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Use VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for client-side
// Use SUPABASE_URL and SUPABASE_SERVICE_KEY for server-side
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or API key. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
});