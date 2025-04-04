import { supabase } from './supabase';
import { 
  InsertReadingSession, 
  InsertReadingGoal,
  InsertUserPreferences,
  ReadingSession,
  ReadingGoal,
  ReadingStat,
  UserPreferences,
  ArticleRecommendation,
  UserTopicInterest
} from '@shared/analytics-schema';
import { Article } from '@shared/schema';
import { UAParser } from 'ua-parser-js';

/**
 * Analytics Service
 * 
 * This module provides functions for tracking and analyzing reading behavior:
 * - Reading sessions tracking
 * - Reading statistics
 * - Reading goals
 * - User preferences
 * - Content recommendations
 */

// Device detection
const parser = new UAParser();
const deviceInfo = parser.getResult();

// Reading Sessions

/**
 * Start a reading session for an article
 */
export async function startReadingSession(articleId: string): Promise<ReadingSession | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Create a new reading session
    const session: InsertReadingSession = {
      user_id: user.user.id,
      article_id: articleId,
      started_at: new Date().toISOString(),
      device_type: deviceInfo.device.type || 'desktop',
      os_name: deviceInfo.os.name || 'unknown',
      browser_name: deviceInfo.browser.name || 'unknown',
      screen_size: `${window.innerWidth}x${window.innerHeight}`
    };
    
    const { data, error } = await supabase
      .from('reading_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error starting reading session:', error);
    return null;
  }
}

/**
 * Update a reading session with progress
 */
export async function updateReadingProgress(
  sessionId: string, 
  progressPercentage: number
): Promise<ReadingSession | null> {
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .update({ 
        progress_percentage: progressPercentage,
        // If progress is >= 90%, mark as completed
        completed: progressPercentage >= 90
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return null;
  }
}

/**
 * End a reading session
 */
export async function endReadingSession(
  sessionId: string, 
  progressPercentage: number
): Promise<ReadingSession | null> {
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .update({ 
        ended_at: new Date().toISOString(),
        progress_percentage: progressPercentage,
        completed: progressPercentage >= 90
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error ending reading session:', error);
    return null;
  }
}

/**
 * Get reading sessions for a user
 */
export async function getUserReadingSessions(
  limit = 10, 
  offset = 0
): Promise<ReadingSession[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('reading_sessions')
      .select('*, article:articles(title, url, image_url)')
      .eq('user_id', user.user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reading sessions:', error);
    return [];
  }
}

/**
 * Get reading sessions for an article
 */
export async function getArticleReadingSessions(articleId: string): Promise<ReadingSession[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('article_id', articleId)
      .order('started_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching article reading sessions:', error);
    return [];
  }
}

// Reading Statistics

/**
 * Get reading statistics for a specific date range
 */
export async function getReadingStats(
  startDate: string, 
  endDate: string
): Promise<ReadingStat[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('reading_stats')
      .select('*')
      .eq('user_id', user.user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reading stats:', error);
    return [];
  }
}

/**
 * Get aggregated reading statistics
 */
export async function getAggregatedStats(): Promise<{
  totalArticlesRead: number;
  totalMinutesRead: number;
  totalWordsRead: number;
  currentStreak: number;
  averageReadingSpeed: number;
}> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Get profile stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_articles_read, total_reading_time, reading_streak, average_reading_speed')
      .eq('id', user.user.id)
      .single();
    
    if (profileError) throw profileError;
    
    // Get total words read
    const { data: stats, error: statsError } = await supabase
      .from('reading_stats')
      .select('sum(words_read)')
      .eq('user_id', user.user.id)
      .single();
    
    if (statsError) throw statsError;
    
    return {
      totalArticlesRead: profile?.total_articles_read || 0,
      totalMinutesRead: profile?.total_reading_time || 0,
      totalWordsRead: stats?.sum || 0,
      currentStreak: profile?.reading_streak || 0,
      averageReadingSpeed: profile?.average_reading_speed || 200
    };
  } catch (error) {
    console.error('Error fetching aggregated stats:', error);
    return {
      totalArticlesRead: 0,
      totalMinutesRead: 0,
      totalWordsRead: 0,
      currentStreak: 0,
      averageReadingSpeed: 200
    };
  }
}

/**
 * Get reading activity heatmap data
 */
export async function getReadingHeatmap(
  year: number, 
  month?: number
): Promise<{ date: string; count: number }[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    let query = supabase
      .from('reading_stats')
      .select('date, articles_read')
      .eq('user_id', user.user.id);
    
    if (month !== undefined) {
      // Filter by specific month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      query = query
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);
    } else {
      // Filter by year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      query = query
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      date: item.date,
      count: item.articles_read
    }));
  } catch (error) {
    console.error('Error fetching reading heatmap:', error);
    return [];
  }
}

/**
 * Get reading time distribution
 */
export async function getReadingTimeDistribution(): Promise<{
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase.rpc('get_reading_time_distribution', {
      user_id_param: user.user.id
    });
    
    if (error) throw error;
    
    return data || {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
  } catch (error) {
    console.error('Error fetching reading time distribution:', error);
    return {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
  }
}

// Reading Goals

/**
 * Create a reading goal
 */
export async function createReadingGoal(goal: Omit<InsertReadingGoal, 'user_id'>): Promise<ReadingGoal | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('reading_goals')
      .insert({
        ...goal,
        user_id: user.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating reading goal:', error);
    return null;
  }
}

/**
 * Update a reading goal
 */
export async function updateReadingGoal(
  goalId: string, 
  updates: Partial<ReadingGoal>
): Promise<ReadingGoal | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('reading_goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', user.user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating reading goal:', error);
    return null;
  }
}

/**
 * Delete a reading goal
 */
export async function deleteReadingGoal(goalId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('reading_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting reading goal:', error);
    return false;
  }
}

/**
 * Get user's reading goals
 */
export async function getReadingGoals(): Promise<ReadingGoal[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('reading_goals')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reading goals:', error);
    return [];
  }
}

/**
 * Get goal progress
 */
export async function getGoalProgress(goalId: string): Promise<{
  goal: ReadingGoal;
  progress: number;
  isCompleted: boolean;
} | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Get the goal
    const { data: goal, error: goalError } = await supabase
      .from('reading_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.user.id)
      .single();
    
    if (goalError) throw goalError;
    if (!goal) return null;
    
    // Calculate date range for the goal
    let startDate = new Date(goal.start_date);
    let endDate = goal.end_date ? new Date(goal.end_date) : new Date();
    
    if (goal.goal_type === 'daily') {
      // For daily goals, use today's date
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (goal.goal_type === 'weekly') {
      // For weekly goals, use the current week
      const today = new Date();
      const dayOfWeek = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (goal.goal_type === 'monthly') {
      // For monthly goals, use the current month
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Get reading stats for the date range
    const { data: stats, error: statsError } = await supabase
      .from('reading_stats')
      .select(goal.target_unit === 'articles' ? 'sum(articles_read)' : 'sum(minutes_read)')
      .eq('user_id', user.user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .single();
    
    if (statsError) throw statsError;
    
    const achieved = stats?.sum || 0;
    const progress = Math.min(100, (achieved / goal.target_count) * 100);
    
    return {
      goal,
      progress,
      isCompleted: achieved >= goal.target_count
    };
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    return null;
  }
}

// User Preferences

/**
 * Get user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.user.id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  preferences: Partial<InsertUserPreferences>
): Promise<UserPreferences | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Check if preferences exist
    const { data: existingPrefs } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', user.user.id)
      .maybeSingle();
    
    let result;
    
    if (existingPrefs) {
      // Update existing preferences
      result = await supabase
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .select()
        .single();
    } else {
      // Insert new preferences
      result = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.user.id,
          ...preferences
        })
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    return result.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return null;
  }
}

// Content Recommendations

/**
 * Get article recommendations
 */
export async function getArticleRecommendations(limit = 10): Promise<(ArticleRecommendation & { article: Article })[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Generate recommendations if needed
    await supabase.rpc('generate_article_recommendations', {
      user_id_param: user.user.id
    });
    
    // Get recommendations
    const { data, error } = await supabase
      .from('article_recommendations')
      .select('*, article:articles(*)')
      .eq('user_id', user.user.id)
      .eq('is_read', false)
      .eq('is_dismissed', false)
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching article recommendations:', error);
    return [];
  }
}

/**
 * Mark recommendation as read
 */
export async function markRecommendationAsRead(recommendationId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('article_recommendations')
      .update({ is_read: true })
      .eq('id', recommendationId)
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking recommendation as read:', error);
    return false;
  }
}

/**
 * Dismiss recommendation
 */
export async function dismissRecommendation(recommendationId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('article_recommendations')
      .update({ is_dismissed: true })
      .eq('id', recommendationId)
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    return false;
  }
}

// Topic Interests

/**
 * Get user topic interests
 */
export async function getUserTopicInterests(): Promise<UserTopicInterest[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('user_topic_interests')
      .select('*')
      .eq('user_id', user.user.id)
      .order('interest_level', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user topic interests:', error);
    return [];
  }
}

/**
 * Update user topic interests
 */
export async function updateTopicInterest(
  topic: string, 
  interestLevel: number
): Promise<UserTopicInterest | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Check if topic interest exists
    const { data: existingInterest } = await supabase
      .from('user_topic_interests')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('topic', topic)
      .maybeSingle();
    
    let result;
    
    if (existingInterest) {
      // Update existing interest
      result = await supabase
        .from('user_topic_interests')
        .update({
          interest_level: interestLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingInterest.id)
        .select()
        .single();
    } else {
      // Insert new interest
      result = await supabase
        .from('user_topic_interests')
        .insert({
          user_id: user.user.id,
          topic,
          interest_level: interestLevel
        })
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    
    // Update user's favorite topics
    await supabase.rpc('update_user_topic_interests', {
      user_id_param: user.user.id
    });
    
    return result.data;
  } catch (error) {
    console.error('Error updating topic interest:', error);
    return null;
  }
}
