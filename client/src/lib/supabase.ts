import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or anon key is missing. Make sure to set the environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://stqnksklgaazgwsuwrxj.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cW5rc2tsZ2Fhemd3c3V3cnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjY4MzYsImV4cCI6MjA1ODMwMjgzNn0.JPQZZbUAHaNA8c__vInK_Jpj_OFq8GkHl8vNwus9OUI'
);

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