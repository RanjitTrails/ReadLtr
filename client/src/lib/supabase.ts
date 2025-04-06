import { createClient } from '@supabase/supabase-js';

// Check if we're in minimal mode
const urlParams = new URLSearchParams(window.location.search);
const isMinimalMode = import.meta.env.VITE_MINIMAL_MODE === 'true' || urlParams.has('minimal');

// Get Supabase URL and key from environment variables
// Use fallback values for development or if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

// Log configuration
console.log('Supabase configuration:');
console.log('- URL:', supabaseUrl);
console.log('- Key:', supabaseAnonKey ? (supabaseAnonKey.substring(0, 10) + '...') : 'missing');
console.log('- Minimal mode:', isMinimalMode ? 'enabled' : 'disabled');

// Log warning instead of throwing error to prevent app from crashing
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or anon key is missing. Using fallback values which may not work in production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).catch(err => {
        console.error('Supabase fetch error:', err);
        throw err;
      });
    }
  }
});

// Types for Supabase tables
export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  title: string;
  url: string;
  excerpt?: string;
  content?: string;
  author?: string;
  published_date?: string;
  date_added: string;
  read_time?: number;
  is_favorite: boolean;
  is_archived: boolean;
  is_read: boolean;
}

export interface Tag {
  id: string;
  name: string;
  user_id: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}