import { supabase } from './supabase';
import { 
  Profile, 
  Collection, 
  Comment, 
  Article,
  InsertCollection,
  InsertComment
} from '@shared/schema';

/**
 * Social Service
 * 
 * This module provides functions for social features like:
 * - User profiles
 * - Following/followers
 * - Collections
 * - Comments
 * - Likes
 * - Sharing
 */

// Profile functions

/**
 * Get a user's public profile
 */
export async function getPublicProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('is_public', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return null;
  }
}

/**
 * Update a user's profile
 */
export async function updateProfile(profile: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

/**
 * Make a profile public or private
 */
export async function toggleProfileVisibility(isPublic: boolean): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_public: isPublic })
      .eq('id', user.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling profile visibility:', error);
    return false;
  }
}

// Follow functions

/**
 * Follow a user
 */
export async function followUser(userIdToFollow: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.user.id,
        following_id: userIdToFollow
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userIdToUnfollow: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.user.id)
      .eq('following_id', userIdToUnfollow);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
}

/**
 * Check if the current user is following another user
 */
export async function isFollowing(userIdToCheck: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', user.user.id)
      .eq('following_id', userIdToCheck)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

/**
 * Get a user's followers
 */
export async function getFollowers(userId: string): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', userId);
    
    if (error) throw error;
    
    // Extract profiles from the join
    return data.map(item => item.profiles) as Profile[];
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

/**
 * Get users that a user is following
 */
export async function getFollowing(userId: string): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', userId);
    
    if (error) throw error;
    
    // Extract profiles from the join
    return data.map(item => item.profiles) as Profile[];
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
}

// Collection functions

/**
 * Create a new collection
 */
export async function createCollection(collection: Omit<InsertCollection, 'user_id'>): Promise<Collection | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('collections')
      .insert({
        ...collection,
        user_id: user.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating collection:', error);
    return null;
  }
}

/**
 * Update a collection
 */
export async function updateCollection(collectionId: string, updates: Partial<Collection>): Promise<Collection | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .eq('user_id', user.user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating collection:', error);
    return null;
  }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting collection:', error);
    return false;
  }
}

/**
 * Get a user's collections
 */
export async function getUserCollections(userId: string): Promise<Collection[]> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user collections:', error);
    return [];
  }
}

/**
 * Get public collections
 */
export async function getPublicCollections(limit = 10): Promise<Collection[]> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_public', true)
      .order('like_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching public collections:', error);
    return [];
  }
}

/**
 * Get a single collection by ID
 */
export async function getCollection(collectionId: string): Promise<Collection | null> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

/**
 * Add an article to a collection
 */
export async function addArticleToCollection(collectionId: string, articleId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Check if the collection belongs to the user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', collectionId)
      .eq('user_id', user.user.id)
      .single();
    
    if (collectionError || !collection) throw new Error('Collection not found or not owned by user');
    
    const { error } = await supabase
      .from('collection_articles')
      .insert({
        collection_id: collectionId,
        article_id: articleId
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding article to collection:', error);
    return false;
  }
}

/**
 * Remove an article from a collection
 */
export async function removeArticleFromCollection(collectionId: string, articleId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Check if the collection belongs to the user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', collectionId)
      .eq('user_id', user.user.id)
      .single();
    
    if (collectionError || !collection) throw new Error('Collection not found or not owned by user');
    
    const { error } = await supabase
      .from('collection_articles')
      .delete()
      .eq('collection_id', collectionId)
      .eq('article_id', articleId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing article from collection:', error);
    return false;
  }
}

/**
 * Get articles in a collection
 */
export async function getCollectionArticles(collectionId: string): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('collection_articles')
      .select('article_id, articles(*)')
      .eq('collection_id', collectionId)
      .order('added_at', { ascending: false });
    
    if (error) throw error;
    
    // Extract articles from the join
    return data.map(item => item.articles) as Article[];
  } catch (error) {
    console.error('Error fetching collection articles:', error);
    return [];
  }
}

// Like functions

/**
 * Like an article
 */
export async function likeArticle(articleId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('article_likes')
      .insert({
        user_id: user.user.id,
        article_id: articleId
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error liking article:', error);
    return false;
  }
}

/**
 * Unlike an article
 */
export async function unlikeArticle(articleId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('article_likes')
      .delete()
      .eq('user_id', user.user.id)
      .eq('article_id', articleId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unliking article:', error);
    return false;
  }
}

/**
 * Check if the current user has liked an article
 */
export async function hasLikedArticle(articleId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('article_likes')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('article_id', articleId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking article like status:', error);
    return false;
  }
}

/**
 * Like a collection
 */
export async function likeCollection(collectionId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('collection_likes')
      .insert({
        user_id: user.user.id,
        collection_id: collectionId
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error liking collection:', error);
    return false;
  }
}

/**
 * Unlike a collection
 */
export async function unlikeCollection(collectionId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('collection_likes')
      .delete()
      .eq('user_id', user.user.id)
      .eq('collection_id', collectionId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unliking collection:', error);
    return false;
  }
}

/**
 * Check if the current user has liked a collection
 */
export async function hasLikedCollection(collectionId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('collection_likes')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('collection_id', collectionId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking collection like status:', error);
    return false;
  }
}

// Comment functions

/**
 * Add a comment to an article
 */
export async function addComment(comment: Omit<InsertComment, 'user_id'>): Promise<Comment | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...comment,
        user_id: user.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string): Promise<Comment | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('comments')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', user.user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating comment:', error);
    return null;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}

/**
 * Get comments for an article
 */
export async function getArticleComments(articleId: string): Promise<(Comment & { profile: Profile })[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profile:profiles(*)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching article comments:', error);
    return [];
  }
}

/**
 * Like a comment
 */
export async function likeComment(commentId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        user_id: user.user.id,
        comment_id: commentId
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error liking comment:', error);
    return false;
  }
}

/**
 * Unlike a comment
 */
export async function unlikeComment(commentId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', user.user.id)
      .eq('comment_id', commentId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unliking comment:', error);
    return false;
  }
}

/**
 * Check if the current user has liked a comment
 */
export async function hasLikedComment(commentId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('comment_likes')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('comment_id', commentId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking comment like status:', error);
    return false;
  }
}

// Sharing functions

/**
 * Make an article public
 */
export async function makeArticlePublic(articleId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('articles')
      .update({ is_public: true })
      .eq('id', articleId)
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error making article public:', error);
    return false;
  }
}

/**
 * Make an article private
 */
export async function makeArticlePrivate(articleId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('articles')
      .update({ is_public: false })
      .eq('id', articleId)
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error making article private:', error);
    return false;
  }
}

/**
 * Get public articles
 */
export async function getPublicArticles(limit = 10): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_public', true)
      .order('like_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching public articles:', error);
    return [];
  }
}

/**
 * Increment the share count for an article
 */
export async function incrementShareCount(articleId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_share_count', {
      article_id: articleId
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing share count:', error);
    return false;
  }
}

/**
 * Get a shareable link for an article
 */
export function getShareableLink(articleId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/article/${articleId}`;
}

/**
 * Get a shareable link for a collection
 */
export function getShareableCollectionLink(collectionId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/collection/${collectionId}`;
}

/**
 * Get a shareable link for a user profile
 */
export function getShareableProfileLink(userId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/profile/${userId}`;
}
