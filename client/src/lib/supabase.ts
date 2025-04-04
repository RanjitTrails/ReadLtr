import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or anon key is missing. Make sure to set the environment variables.');
  throw new Error('Supabase configuration is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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