import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
// Use fallback values for development or if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

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