import { supabase } from "./supabase";
import { parseArticleFromUrl, estimateReadingTime } from './articleParser';

export interface Article {
  id: string;
  title: string;
  url: string;
  excerpt?: string;
  content?: string;
  author?: string;
  domain?: string;
  date_added: string;
  published_date?: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_read: boolean;
  read_time?: number;
  read_progress?: number;
  tags?: string[];
  image_url?: string;
  content_type?: 'articles' | 'books' | 'emails' | 'pdfs' | 'tweets' | 'videos';
}

export interface ArticleFilters {
  favorited?: boolean;
  archived?: boolean;
  readStatus?: boolean; // true for read articles, false for unread articles
  searchQuery?: string;
  dateAdded?: {
    start: string;
    end: string;
  };
  tags?: string[];
  contentType?: 'articles' | 'books' | 'emails' | 'pdfs' | 'tweets' | 'videos'; // New field for content type filtering
}

export interface SaveArticleParams {
  url: string;
  tags?: string[];
  note?: string;
  contentType?: 'articles' | 'books' | 'emails' | 'pdfs' | 'tweets' | 'videos';
}

// Update the ParsedArticle interface to include image_url
export interface ParsedArticle {
  title: string;
  url: string;
  excerpt?: string;
  content?: string;
  author?: string;
  publishedDate?: string;
  image_url?: string;
  content_type?: 'articles' | 'books' | 'emails' | 'pdfs' | 'tweets' | 'videos';
}

/**
 * Get articles from Supabase with optional filtering
 */
export async function getArticles(filters: ArticleFilters = {}) {
  try {
    // Start query
    let query = supabase
      .from('articles')
      .select(`
        *,
        tags:article_tags(
          tag:tags(*)
        )
      `);
    
    // Apply filters
    if (filters.favorited !== undefined) {
      query = query.eq('is_favorite', filters.favorited);
    }
    
    if (filters.archived !== undefined) {
      query = query.eq('is_archived', filters.archived);
    }
    
    if (filters.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`);
    }

    // Filter by read status if specified
    if (filters.readStatus !== undefined) {
      query = query.eq('is_read', filters.readStatus);
    }
    
    // Filter by content type if specified
    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }
    
    // If tag filter is applied, we need to join with article_tags
    if (filters.tags && filters.tags.length > 0) {
      // We need a different approach for tag filtering
      // Get the tag IDs first
      const tagIds = await Promise.all(filters.tags.map(async (tagName) => {
        const { data: tagData } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single();
        if (tagData) {
          return tagData.id;
        } else {
          // Tag doesn't exist
          return null;
        }
      }));
      
      const validTagIds = tagIds.filter(id => id !== null) as string[];
      
      if (validTagIds.length > 0) {
        query = query.in('tag_id', validTagIds);
      } else {
        // No articles with the specified tags
        return [];
      }
    }
    
    // Order by date added (newest first)
    query = query.order('date_added', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Process the data to format the tags
    return (data || []).map(article => {
      const formattedTags = article.tags?.map((tagRel: any) => tagRel.tag.name) || [];
      return {
        ...article,
        tags: formattedTags
      };
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

/**
 * Get a single article by ID
 */
export async function getArticleById(id: string) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        tags:article_tags(
          tag:tags(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Format tags
    const formattedTags = data.tags?.map((tagRel: any) => tagRel.tag.name) || [];
    
    return {
      ...data,
      tags: formattedTags
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
}

/**
 * Toggle favorite status of an article
 */
export async function toggleFavorite(id: string) {
  try {
    // Get current status
    const { data: article } = await supabase
      .from('articles')
      .select('is_favorite')
      .eq('id', id)
      .single();
    
    if (!article) throw new Error('Article not found');
    
    // Toggle status
    const { data, error } = await supabase
      .from('articles')
      .update({ is_favorite: !article.is_favorite })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}

/**
 * Toggle archive status of an article
 */
export async function toggleArchive(id: string) {
  try {
    // Get current status
    const { data: article } = await supabase
      .from('articles')
      .select('is_archived')
      .eq('id', id)
      .single();
    
    if (!article) throw new Error('Article not found');
    
    // Toggle status
    const { data, error } = await supabase
      .from('articles')
      .update({ is_archived: !article.is_archived })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error toggling archive status:', error);
    throw error;
  }
}

/**
 * Save a new article based on URL
 */
export const saveArticle = async (params: SaveArticleParams): Promise<Article> => {
  try {
    // Parse article information from URL
    const articleData = await parseArticleFromUrl(params.url);
    
    if (!articleData) {
      throw new Error("Failed to parse article from the provided URL");
    }
    
    // Calculate reading time
    const readTime = estimateReadingTime(articleData.content || articleData.excerpt || "");
    
    // Use provided content type or fallback to parsed content type
    const contentType = params.contentType || articleData.content_type || 'articles';
    
    // Prepare the article data
    const newArticle = {
      url: params.url,
      title: articleData.title || "Untitled Article",
      author: articleData.author || null,
      excerpt: articleData.excerpt || null,
      content: articleData.content || null,
      image_url: articleData.image_url || null,
      domain: new URL(params.url).hostname.replace('www.', ''),
      date_added: new Date().toISOString(),
      published_date: articleData.publishedDate || null,
      read_time: readTime,
      is_favorite: false,
      is_archived: false,
      is_read: false,
      read_progress: 0,
      note: params.note || null,
      content_type: contentType
    };
    
    // Insert the article
    const { data, error } = await supabase
      .from('articles')
      .insert(newArticle)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error("Failed to create article");
    }
    
    // If tags are provided, handle them
    if (params.tags && params.tags.length > 0) {
      // Process each tag
      await Promise.all(params.tags.map(async (tagName) => {
        // Check if tag exists
        let { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single();
        
        let tagId: string;
        
        // If tag doesn't exist, create it
        if (!existingTag) {
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select()
            .single();
          
          if (tagError) throw tagError;
          if (!newTag) throw new Error(`Failed to create tag: ${tagName}`);
          
          tagId = newTag.id;
        } else {
          tagId = existingTag.id;
        }
        
        // Create article-tag relationship
        const { error: relationError } = await supabase
          .from('article_tags')
          .insert({
            article_id: data.id,
            tag_id: tagId
          });
        
        if (relationError) throw relationError;
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  }
}

/**
 * Add tags to an article
 */
export async function addTagsToArticle(articleId: string, tagNames: string[]) {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // For each tag name:
    // 1. Get or create tag
    // 2. Create relationship to article
    const tagPromises = tagNames.map(async (tagName) => {
      // Check if tag exists
      let { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .eq('user_id', user.id)
        .single();
      
      // Create tag if it doesn't exist
      if (!existingTag) {
        const { data: newTag, error } = await supabase
          .from('tags')
          .insert({
            name: tagName,
            user_id: user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        existingTag = newTag;
      }
      
      // Create relationship
      if (existingTag) {
        const { error } = await supabase
          .from('article_tags')
          .insert({
            article_id: articleId,
            tag_id: existingTag.id
          });
        
        if (error && error.code !== '23505') { // Ignore duplicate key errors
          throw error;
        }
      }
    });
    
    await Promise.all(tagPromises);
    
    return true;
  } catch (error) {
    console.error('Error adding tags:', error);
    throw error;
  }
}

/**
 * Remove a tag from an article
 */
export async function removeTag(articleId: string, tagName: string) {
  try {
    // Get the tag ID
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .single();
    
    if (!tag) throw new Error('Tag not found');
    
    // Remove the relationship
    const { error } = await supabase
      .from('article_tags')
      .delete()
      .eq('article_id', articleId)
      .eq('tag_id', tag.id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing tag:', error);
    throw error;
  }
}

/**
 * Get all unique tags for the current user
 */
export async function getAllTags() {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Get tags
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

/**
 * Mark an article as read
 */
export async function markAsRead(articleId: string) {
  try {
    const { error } = await supabase
      .from("articles")
      .update({ is_read: true })
      .eq("id", articleId);
    
    if (error) {
      console.error("Error marking article as read:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error marking article as read:", error);
    throw error;
  }
} 