import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Highlight {
  id: string;
  articleId: string;
  text: string;
  color: string;
  note?: string;
  position?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHighlightParams {
  articleId: string;
  text: string;
  color: string;
  note?: string;
  position?: number;
}

/**
 * Create a new highlight
 */
export async function createHighlight(params: CreateHighlightParams): Promise<Highlight> {
  const { articleId, text, color, note, position } = params;
  
  // Get user ID from session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }
  
  const userId = session.user.id;
  const now = new Date().toISOString();
  
  const highlight = {
    id: uuidv4(),
    user_id: userId,
    article_id: articleId,
    text,
    note: note || null,
    color: color || 'yellow',
    position: position || null,
    created_at: now,
    updated_at: now
  };
  
  const { data, error } = await supabase
    .from('highlights')
    .insert(highlight)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating highlight:', error);
    throw new Error(error.message);
  }
  
  return {
    id: data.id,
    articleId: data.article_id,
    text: data.text,
    color: data.color,
    note: data.note,
    position: data.position,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Get all highlights for an article
 */
export async function getHighlightsByArticle(articleId: string): Promise<Highlight[]> {
  // Get user ID from session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }
  
  const userId = session.user.id;
  
  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching highlights:', error);
    throw new Error(error.message);
  }
  
  return data.map(item => ({
    id: item.id,
    articleId: item.article_id,
    text: item.text,
    color: item.color,
    note: item.note,
    position: item.position,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

/**
 * Update a highlight
 */
export async function updateHighlight(
  highlightId: string, 
  updates: { note?: string; color?: string }
): Promise<Highlight> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('highlights')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', highlightId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating highlight:', error);
    throw new Error(error.message);
  }
  
  return {
    id: data.id,
    articleId: data.article_id,
    text: data.text,
    color: data.color,
    note: data.note,
    position: data.position,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(highlightId: string): Promise<void> {
  const { error } = await supabase
    .from('highlights')
    .delete()
    .eq('id', highlightId);
  
  if (error) {
    console.error('Error deleting highlight:', error);
    throw new Error(error.message);
  }
}

/**
 * Get all highlights for the current user
 */
export async function getAllHighlights(): Promise<Highlight[]> {
  // Get user ID from session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }
  
  const userId = session.user.id;
  
  const { data, error } = await supabase
    .from('highlights')
    .select('*, articles(title, url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching highlights:', error);
    throw new Error(error.message);
  }
  
  return data.map(item => ({
    id: item.id,
    articleId: item.article_id,
    text: item.text,
    color: item.color,
    note: item.note,
    position: item.position,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    article: item.articles
  }));
}
