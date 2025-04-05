import { supabase } from './supabase';
import { Highlight } from './highlightService';
import { addDays, isAfter } from 'date-fns';

// Spaced repetition intervals (in days)
const INTERVALS = [1, 3, 7, 14, 30, 60, 120];

interface ReviewItem {
  id: string;
  highlightId: string;
  userId: string;
  nextReviewDate: string;
  repetitionNumber: number;
  easeFactor: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get highlights due for review today
 */
export async function getHighlightsForReview(): Promise<Highlight[]> {
  try {
    // Get user ID from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    const today = new Date().toISOString();
    
    // Get review items due today
    const { data: reviewItems, error } = await supabase
      .from('highlight_reviews')
      .select('highlight_id')
      .eq('user_id', userId)
      .lte('next_review_date', today);
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!reviewItems || reviewItems.length === 0) {
      return [];
    }
    
    // Get the highlights for these review items
    const highlightIds = reviewItems.map(item => item.highlight_id);
    
    const { data: highlights, error: highlightsError } = await supabase
      .from('highlights')
      .select('*, articles(title, url)')
      .in('id', highlightIds)
      .eq('user_id', userId);
    
    if (highlightsError) {
      throw new Error(highlightsError.message);
    }
    
    return highlights.map(item => ({
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
  } catch (error) {
    console.error('Error getting highlights for review:', error);
    return [];
  }
}

/**
 * Schedule a highlight for review
 */
export async function scheduleHighlightForReview(highlightId: string): Promise<boolean> {
  try {
    // Get user ID from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    const now = new Date();
    const nextReviewDate = addDays(now, INTERVALS[0]).toISOString();
    
    // Check if this highlight is already scheduled
    const { data: existing } = await supabase
      .from('highlight_reviews')
      .select('id')
      .eq('highlight_id', highlightId)
      .eq('user_id', userId)
      .single();
    
    if (existing) {
      // Already scheduled, no need to do anything
      return true;
    }
    
    // Schedule the highlight for review
    const { error } = await supabase
      .from('highlight_reviews')
      .insert({
        highlight_id: highlightId,
        user_id: userId,
        next_review_date: nextReviewDate,
        repetition_number: 0,
        ease_factor: 2.5, // Default ease factor
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error scheduling highlight for review:', error);
    return false;
  }
}

/**
 * Record a review response and schedule next review
 * @param highlightId The ID of the highlight being reviewed
 * @param quality The quality of the recall (0-5, where 0 is complete blackout and 5 is perfect recall)
 */
export async function recordReviewResponse(highlightId: string, quality: number): Promise<boolean> {
  try {
    // Get user ID from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    
    // Get the current review item
    const { data: reviewItem, error: getError } = await supabase
      .from('highlight_reviews')
      .select('*')
      .eq('highlight_id', highlightId)
      .eq('user_id', userId)
      .single();
    
    if (getError || !reviewItem) {
      throw new Error(getError?.message || 'Review item not found');
    }
    
    // Calculate new ease factor and repetition number
    let easeFactor = reviewItem.ease_factor;
    let repetitionNumber = reviewItem.repetition_number;
    
    // SuperMemo-2 algorithm
    if (quality < 3) {
      // If recall was difficult, reset repetition number
      repetitionNumber = 0;
    } else {
      // Increase repetition number
      repetitionNumber += 1;
    }
    
    // Adjust ease factor based on quality
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    // Calculate next interval
    let nextInterval = 1; // Default to 1 day
    if (repetitionNumber < INTERVALS.length) {
      nextInterval = INTERVALS[repetitionNumber];
    } else {
      // For repetitions beyond our predefined intervals, use the ease factor
      const lastInterval = INTERVALS[INTERVALS.length - 1];
      nextInterval = Math.round(lastInterval * easeFactor);
    }
    
    // Calculate next review date
    const now = new Date();
    const nextReviewDate = addDays(now, nextInterval).toISOString();
    
    // Update the review item
    const { error: updateError } = await supabase
      .from('highlight_reviews')
      .update({
        next_review_date: nextReviewDate,
        repetition_number: repetitionNumber,
        ease_factor: easeFactor,
        updated_at: now.toISOString()
      })
      .eq('id', reviewItem.id);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error recording review response:', error);
    return false;
  }
}

/**
 * Get the count of highlights due for review today
 */
export async function getDueReviewCount(): Promise<number> {
  try {
    // Get user ID from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return 0;
    }
    
    const userId = session.user.id;
    const today = new Date().toISOString();
    
    // Count review items due today
    const { count, error } = await supabase
      .from('highlight_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lte('next_review_date', today);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting due review count:', error);
    return 0;
  }
}
