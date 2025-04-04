/**
 * Article Parser Utility
 *
 * This module provides utilities for parsing and cleaning article content
 * extracted from web pages, optimizing it for readability.
 */

import { ParsedArticle } from './articleService';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { supabase } from './supabase';

/**
 * Parses an article from a URL, extracting title, content, author, etc.
 * Uses Mozilla's Readability library to extract content from HTML.
 */
export async function parseArticleFromUrl(url: string): Promise<ParsedArticle | null> {
  try {
    // First try to use the server-side parser
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const response = await fetch('/api/parse-article', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ url })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            title: data.title,
            url: data.url,
            excerpt: data.excerpt,
            content: data.content,
            author: data.author,
            publishedDate: data.publishedDate,
            image_url: data.image_url,
            content_type: data.content_type as any,
            domain: data.domain
          };
        }
      }
    } catch (serverError) {
      console.warn('Server-side parsing failed, falling back to client-side:', serverError);
      // Continue to client-side parsing
    }

    // Determine content type based on URL pattern or domain
    const domain = new URL(url).hostname.replace('www.', '');
    let content_type: 'articles' | 'books' | 'emails' | 'pdfs' | 'tweets' | 'videos' = 'articles';

    if (url.includes('.pdf')) {
      content_type = 'pdfs';
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      content_type = 'tweets';
    } else if (domain.includes('youtube.com') || domain.includes('vimeo.com')) {
      content_type = 'videos';
    } else if (url.includes('mailto:') || domain.includes('mail.') || domain.includes('gmail.com')) {
      content_type = 'emails';
    } else if (domain.includes('amazon.com') && url.includes('/dp/')) {
      content_type = 'books';
    } else if (domain.includes('goodreads.com') || domain.includes('books.google.com')) {
      content_type = 'books';
    } else {
      content_type = 'articles'; // Default for most web content
    }

    // For non-article content types, we might need specialized parsers
    // For now, we'll focus on articles and use a simplified approach

    // Fetch the page content
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const data = await response.json();
    const html = data.contents;

    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract title
    let title = '';
    const titleElement = doc.querySelector('title');
    if (titleElement) {
      title = titleElement.textContent || '';
    }

    // Try to get a better title from OG tags
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      title = ogTitle.getAttribute('content') || title;
    }

    // Extract author
    let author = '';
    const authorMeta = doc.querySelector('meta[name="author"], meta[property="article:author"]');
    if (authorMeta) {
      author = authorMeta.getAttribute('content') || '';
    }

    // Extract published date
    let publishedDate = '';
    const dateMeta = doc.querySelector('meta[name="date"], meta[property="article:published_time"]');
    if (dateMeta) {
      publishedDate = dateMeta.getAttribute('content') || '';
    }

    // Extract image
    let image_url = '';
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage) {
      image_url = ogImage.getAttribute('content') || '';
    }

    // Extract description/excerpt
    let excerpt = '';
    const descriptionMeta = doc.querySelector('meta[name="description"], meta[property="og:description"]');
    if (descriptionMeta) {
      excerpt = descriptionMeta.getAttribute('content') || '';
    }

    // Try to extract the main content
    let content = '';
    const article = doc.querySelector('article');
    if (article) {
      content = article.innerHTML;
    } else {
      // Try to find the main content area
      const main = doc.querySelector('main');
      if (main) {
        content = main.innerHTML;
      } else {
        // Just get the body content as a last resort
        content = doc.body.innerHTML;
      }
    }

    return {
      title: title || 'Untitled Article',
      url,
      excerpt,
      content,
      author,
      publishedDate,
      image_url,
      content_type,
      domain
    };
  } catch (error) {
    console.error('Error parsing article:', error);

    // Fallback to a very basic parser if everything else fails
    try {
      return {
        title: `Article from ${new URL(url).hostname}`,
        url,
        excerpt: "Content could not be extracted automatically.",
        content: `<p>The article content could not be extracted automatically. <a href="${url}" target="_blank" rel="noopener noreferrer">View the original article</a>.</p>`,
        author: '',
        publishedDate: '',
        image_url: '',
        content_type: 'articles',
        domain: new URL(url).hostname.replace('www.', '')
      };
    } catch (fallbackError) {
      console.error('Fallback parser also failed:', fallbackError);
      return null;
    }
  }
}



/**
 * Formats article content for display
 * Cleans up common HTML issues and improves readability
 */
export function formatArticleContent(content: string): string {
  if (!content) return '';

  try {
    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'iframe', 'form', 'button', 'input', 'nav', 'footer',
      '.ad', '.ads', '.advertisement', '.social-share', '.related-articles',
      '.comments', '.popup', '.modal', '.newsletter', '.subscription'
    ];

    unwantedSelectors.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => {
        el.remove();
      });
    });

    // Fix relative image paths
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('/')) {
        try {
          // Try to convert to absolute URL if it's a relative path
          const baseUrl = window.location.origin;
          img.setAttribute('src', baseUrl + src);
        } catch (e) {
          // If conversion fails, leave as is
        }
      }

      // Add loading="lazy" for better performance
      img.setAttribute('loading', 'lazy');

      // Add alt text if missing
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', 'Article image');
      }
    });

    // Add target="_blank" to external links
    doc.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http') || href.startsWith('https'))) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Return the cleaned HTML
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error formatting article content:', error);
    return content; // Return original content if formatting fails
  }
}

/**
 * Estimates reading time for a piece of text
 * @param text - The text to analyze
 * @returns estimated reading time in minutes
 */
export function estimateReadingTime(text: string): number {
  if (!text) return 1;

  try {
    // Remove HTML tags to get just the text
    const textOnly = text.replace(/<[^>]*>/g, '');

    // Average reading speed is about 200-250 words per minute
    const wordsPerMinute = 225;
    const wordCount = textOnly.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    // Return at least 1 minute
    return Math.max(1, readingTime);
  } catch (error) {
    console.error('Error estimating reading time:', error);
    return 1; // Default to 1 minute if estimation fails
  }
}

/**
 * Extracts keywords/topics from article content
 * Uses a basic frequency-based approach
 */
export function extractKeywords(content: string): string[] {
  if (!content) return [];

  try {
    // Remove HTML tags
    const textOnly = content.replace(/<[^>]*>/g, '');

    // Convert to lowercase and remove punctuation
    const cleanText = textOnly.toLowerCase().replace(/[^\w\s]/g, '');

    // Split into words
    const words = cleanText.split(/\s+/);

    // Common English stop words to filter out
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
      'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
      'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
    ]);

    // Count word frequencies (excluding stop words and short words)
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    // Convert to array and sort by frequency
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // Return top 5 keywords
    return sortedWords.slice(0, 5);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return []; // Return empty array if extraction fails
  }
}