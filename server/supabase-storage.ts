import { supabase } from './supabase';
import { IStorage } from './storage';
import { User, InsertUser, Article, InsertArticle, Label, InsertLabel } from '@shared/schema';
import type { Database } from './database.types';

export class SupabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapToUser(data);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapToUser(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapToUser(data);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating user:', error);
      throw new Error(error ? (error.message || 'Failed to create user') : 'Failed to create user');
    }
    
    return this.mapToUser(data);
  }

  // Article methods
  async getArticle(id: number): Promise<Article | undefined> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapToArticle(data);
  }

  async getArticlesByUserId(userId: number): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId);
    
    if (error || !data) return [];
    
    return data.map(this.mapToArticle);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    // Map our schema field names to Supabase field names
    const supabaseArticle = {
      user_id: insertArticle.userId,
      title: insertArticle.title,
      url: insertArticle.url,
      content: insertArticle.content,
      description: insertArticle.description,
      author: insertArticle.author,
      site_name: insertArticle.siteName,
      site_icon: insertArticle.siteIcon,
      saved_at: new Date().toISOString(),
      read_at: insertArticle.readAt ? new Date(insertArticle.readAt).toISOString() : null,
      is_archived: insertArticle.isArchived || false,
      labels: insertArticle.labels,
      reading_progress: insertArticle.readingProgress || 0
    };
    
    const { data, error } = await supabase
      .from('articles')
      .insert(supabaseArticle)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating article:', error);
      throw new Error(error ? (error.message || 'Failed to create article') : 'Failed to create article');
    }
    
    return this.mapToArticle(data);
  }

  async updateArticle(id: number, articleUpdate: Partial<Article>): Promise<Article | undefined> {
    // Map our schema field names to Supabase field names
    const supabaseArticleUpdate: any = {};
    
    if (articleUpdate.title !== undefined) supabaseArticleUpdate.title = articleUpdate.title;
    if (articleUpdate.url !== undefined) supabaseArticleUpdate.url = articleUpdate.url;
    if (articleUpdate.content !== undefined) supabaseArticleUpdate.content = articleUpdate.content;
    if (articleUpdate.description !== undefined) supabaseArticleUpdate.description = articleUpdate.description;
    if (articleUpdate.author !== undefined) supabaseArticleUpdate.author = articleUpdate.author;
    if (articleUpdate.siteName !== undefined) supabaseArticleUpdate.site_name = articleUpdate.siteName;
    if (articleUpdate.siteIcon !== undefined) supabaseArticleUpdate.site_icon = articleUpdate.siteIcon;
    if (articleUpdate.savedAt !== undefined) supabaseArticleUpdate.saved_at = articleUpdate.savedAt ? new Date(articleUpdate.savedAt).toISOString() : null;
    if (articleUpdate.readAt !== undefined) supabaseArticleUpdate.read_at = articleUpdate.readAt ? new Date(articleUpdate.readAt).toISOString() : null;
    if (articleUpdate.isArchived !== undefined) supabaseArticleUpdate.is_archived = articleUpdate.isArchived;
    if (articleUpdate.labels !== undefined) supabaseArticleUpdate.labels = articleUpdate.labels;
    if (articleUpdate.readingProgress !== undefined) supabaseArticleUpdate.reading_progress = articleUpdate.readingProgress;
    
    const { data, error } = await supabase
      .from('articles')
      .update(supabaseArticleUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapToArticle(data);
  }

  async deleteArticle(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Label methods
  async getLabel(id: number): Promise<Label | undefined> {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapToLabel(data);
  }

  async getLabelsByUserId(userId: number): Promise<Label[]> {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId);
    
    if (error || !data) return [];
    
    return data.map(this.mapToLabel);
  }

  async createLabel(insertLabel: InsertLabel): Promise<Label> {
    const supabaseLabel = {
      user_id: insertLabel.userId,
      name: insertLabel.name,
      color: insertLabel.color
    };
    
    const { data, error } = await supabase
      .from('labels')
      .insert(supabaseLabel)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating label:', error);
      throw new Error(error ? (error.message || 'Failed to create label') : 'Failed to create label');
    }
    
    return this.mapToLabel(data);
  }

  async updateLabel(id: number, labelUpdate: Partial<Label>): Promise<Label | undefined> {
    const supabaseLabelUpdate: any = {};
    
    if (labelUpdate.name !== undefined) supabaseLabelUpdate.name = labelUpdate.name;
    if (labelUpdate.color !== undefined) supabaseLabelUpdate.color = labelUpdate.color;
    
    const { data, error } = await supabase
      .from('labels')
      .update(supabaseLabelUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapToLabel(data);
  }

  async deleteLabel(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', id);
    
    return !error;
  }
  
  // User settings
  async updateUserSettings(userId: number, settings: { readingGoal?: number }): Promise<boolean> {
    // Since we don't have a separate user_settings table in Supabase,
    // we'll update the user directly with these settings
    const { error } = await supabase
      .from('users')
      .update({
        reading_goal: settings.readingGoal
      })
      .eq('id', userId);
    
    return !error;
  }

  // Helper methods to map database rows to our schema types
  private mapToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      password: dbUser.password,
      email: dbUser.email,
      name: dbUser.name || null,
      createdAt: dbUser.created_at ? new Date(dbUser.created_at) : new Date()
    };
  }

  private mapToArticle(dbArticle: any): Article {
    return {
      id: dbArticle.id,
      userId: dbArticle.user_id,
      title: dbArticle.title,
      url: dbArticle.url,
      content: dbArticle.content,
      description: dbArticle.description,
      author: dbArticle.author,
      siteName: dbArticle.site_name,
      siteIcon: dbArticle.site_icon,
      savedAt: dbArticle.saved_at ? new Date(dbArticle.saved_at) : new Date(),
      readAt: dbArticle.read_at ? new Date(dbArticle.read_at) : null,
      isArchived: dbArticle.is_archived || false,
      labels: dbArticle.labels || [],
      readingProgress: dbArticle.reading_progress || 0,
      estimatedReadingTime: dbArticle.estimated_reading_time || null,
      folder: dbArticle.folder || "inbox",
      highlights: dbArticle.highlights || [],
      notes: dbArticle.notes || null,
      lastReadPosition: dbArticle.last_read_position || 0,
      darkMode: dbArticle.dark_mode || false,
      customCss: dbArticle.custom_css || null,
      readingSpeed: dbArticle.reading_speed || null,
      sharedWith: dbArticle.shared_with || [],
      isPublic: dbArticle.is_public || false,
      readingGoal: dbArticle.reading_goal || null,
      reminderTime: dbArticle.reminder_time ? new Date(dbArticle.reminder_time) : null,
      collections: dbArticle.collections || [],
      audioEnabled: dbArticle.audio_enabled || false,
      textToSpeechLang: dbArticle.tts_lang || "en"
    };
  }

  private mapToLabel(dbLabel: any): Label {
    return {
      id: dbLabel.id,
      userId: dbLabel.user_id,
      name: dbLabel.name,
      color: dbLabel.color || '#4f46e5'
    };
  }
}

// Export an instance of the storage class
export const supabaseStorage = new SupabaseStorage();