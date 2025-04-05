import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { parserRateLimit } from '../middleware/rateLimit';
import { supabase } from '../supabase';
import { parseArticleFromUrl } from '../lib/articleParser';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * API endpoint for browser extension to save articles
 * POST /api/extension/save
 */
router.post('/save', authenticateToken, parserRateLimit, async (req, res) => {
  try {
    const { url, tags = [], notes } = req.body;
    const userId = req.body.userId;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check if article already exists for this user
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('url', url)
      .eq('user_id', userId)
      .single();

    if (existingArticle) {
      return res.status(200).json({ 
        message: 'Article already saved',
        articleId: existingArticle.id,
        alreadyExists: true
      });
    }

    // Parse article content
    const parsedArticle = await parseArticleFromUrl(url);
    
    if (!parsedArticle) {
      return res.status(400).json({ error: 'Failed to parse article content' });
    }

    // Create article record
    const articleId = uuidv4();
    const now = new Date().toISOString();
    
    const { error: insertError } = await supabase
      .from('articles')
      .insert({
        id: articleId,
        user_id: userId,
        title: parsedArticle.title,
        url: url,
        excerpt: parsedArticle.excerpt,
        content: parsedArticle.content,
        author: parsedArticle.author,
        published_date: parsedArticle.publishedDate,
        image_url: parsedArticle.image_url,
        content_type: parsedArticle.content_type,
        domain: new URL(url).hostname.replace('www.', ''),
        read_time: parsedArticle.read_time,
        created_at: now,
        updated_at: now
      });

    if (insertError) {
      console.error('Error inserting article:', insertError);
      return res.status(500).json({ error: 'Failed to save article' });
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagPromises = tags.map(async (tagName: string) => {
        // Check if tag exists
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single();

        let tagId;
        
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({ name: tagName, user_id: userId })
            .select()
            .single();
          
          if (tagError) {
            console.error('Error creating tag:', tagError);
            return;
          }
          
          tagId = newTag.id;
        }
        
        // Create article-tag relationship
        const { error: relationError } = await supabase
          .from('article_tags')
          .insert({
            article_id: articleId,
            tag_id: tagId
          });
        
        if (relationError) {
          console.error('Error creating article-tag relationship:', relationError);
        }
      });
      
      await Promise.all(tagPromises);
    }

    // Add notes if provided
    if (notes) {
      const { error: notesError } = await supabase
        .from('article_notes')
        .insert({
          article_id: articleId,
          user_id: userId,
          content: notes,
          created_at: now,
          updated_at: now
        });
      
      if (notesError) {
        console.error('Error adding notes:', notesError);
      }
    }

    return res.status(201).json({
      message: 'Article saved successfully',
      articleId
    });
  } catch (error) {
    console.error('Error in extension save endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Generate API key for browser extension
 * POST /api/extension/api-key
 */
router.post('/api-key', authenticateToken, async (req, res) => {
  try {
    const userId = req.body.userId;
    
    // Generate API key with JWT
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    // Create a token that expires in 1 year
    const token = jwt.sign(
      { 
        id: userId,
        type: 'api_key'
      },
      JWT_SECRET,
      { expiresIn: '1y' }
    );
    
    return res.status(200).json({ apiKey: token });
  } catch (error) {
    console.error('Error generating API key:', error);
    return res.status(500).json({ error: 'Failed to generate API key' });
  }
});

export default router;
