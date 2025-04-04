import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Supabase client configuration
 *
 * Server-side uses SUPABASE_URL and SUPABASE_SERVICE_KEY
 * Client-side uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Validate Supabase configuration
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or API key. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
}

/**
 * Initialize Supabase client with connection validation
 */
const initializeSupabase = (): SupabaseClient<Database> => {
  const client = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });

  // Log initialization
  console.log('Supabase client initialized');

  return client;
};

// Create and export the Supabase client
export const supabase = initializeSupabase();

/**
 * Validate Supabase connection
 * Can be used during application startup to ensure Supabase is accessible
 */
export const validateSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test connection using raw HTTP request to health endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      console.error('Supabase connection validation failed:', response.statusText);
      return false;
    }

    console.log('Supabase connection validated successfully');
    return true;
  } catch (error: any) {
    console.error('Supabase connection validation error:', error.message);
    return false;
  }
};