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
import { processContent } from './sanitize';

/**
 * Parses an article from a URL, extracting title, content, author, etc.
 * Uses Mozilla's Readability library to extract content from HTML.
 */

/**
 * Estimates reading time for an article in minutes
 * @param content HTML content of the article
 * @returns Estimated reading time in minutes
 */
export function estimateReadingTime(content: string): number {
  if (!content) return 1; // Default to 1 minute for empty content

  // Create a temporary element to extract text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Get text content and count words
  const text = tempDiv.textContent || '';
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  // Average reading speed: 200-250 words per minute
  // We'll use 225 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 225));

  return readingTimeMinutes;
}

/**
 * Determine content type from URL
 */
export function determineContentType(url: string): 'articles' | 'books' | 'emails' | 'pdfs' | 'tweets' | 'videos' {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');

    if (url.toLowerCase().endsWith('.pdf')) return 'pdfs';
    if (domain.includes('twitter.com') || domain.includes('x.com')) return 'tweets';
    if (domain.includes('youtube.com') || domain.includes('youtu.be') || domain.includes('vimeo.com')) return 'videos';
    if (url.includes('mailto:') || domain.includes('mail.') || domain.includes('gmail.com')) return 'emails';
    if ((domain.includes('amazon.com') && url.includes('/dp/')) || domain.includes('goodreads.com') || domain.includes('books.google.com')) return 'books';

    return 'articles';
  } catch (error) {
    console.error('Error determining content type:', error);
    return 'articles'; // Default to articles
  }
}

/**
 * Fallback parser for when server-side parsing fails
 */
export async function fallbackParseArticle(url: string): Promise<ParsedArticle | null> {
  try {
    // Fetch the page content
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const data = await response.json();
    const html = data.contents;

    // Parse the HTML using jsdom
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Could not parse article content');
    }

    // Extract metadata
    const doc = dom.window.document;

    // Try to get the author
    let author = article.byline || '';
    if (!author) {
      const authorMeta = doc.querySelector('meta[name="author"], meta[property="article:author"]');
      if (authorMeta) {
        author = authorMeta.getAttribute('content') || '';
      }
    }

    // Try to get the published date
    let publishedDate = '';
    const dateMeta = doc.querySelector('meta[name="date"], meta[property="article:published_time"]');
    if (dateMeta) {
      publishedDate = dateMeta.getAttribute('content') || '';
    }

    // Try to get the featured image
    let image_url = '';
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage) {
      image_url = ogImage.getAttribute('content') || '';
    }

    // Create excerpt if not provided
    let excerpt = article.excerpt || '';
    if (!excerpt && article.content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.content;
      const text = tempDiv.textContent || '';
      excerpt = text.substring(0, 200).trim() + (text.length > 200 ? '...' : '');
    }

    // Calculate reading time
    const readTime = estimateReadingTime(article.content || '');

    return {
      title: article.title || 'Untitled Article',
      url,
      excerpt,
      content: article.content || '',
      author,
      publishedDate,
      image_url,
      content_type: determineContentType(url),
      read_time: readTime
    };
  } catch (error) {
    console.error('Fallback parser error:', error);
    return null;
  }
}



// This is a duplicate function that has been moved above

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

    // Try to use our fallback parser
    try {
      console.log('Using fallback parser for:', url);
      const result = await fallbackParseArticle(url);
      if (result) {
        return {
          ...result,
          domain: new URL(url).hostname.replace('www.', '')
        };
      }
    } catch (fallbackError) {
      console.error('Fallback parser failed:', fallbackError);
      // Continue to the simplified parser
    }

    // If fallback parser fails, use the simplified approach
    console.log('Using simplified parser for:', url);

    // Determine content type
    const content_type = determineContentType(url);
    const domain = new URL(url).hostname.replace('www.', '');

    // Fetch the page content through a CORS proxy
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

    // Calculate reading time
    const readTime = estimateReadingTime(content);

    return {
      title: title || 'Untitled Article',
      url,
      excerpt,
      content,
      author,
      publishedDate,
      image_url,
      content_type,
      domain,
      read_time: readTime
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
    // First, use our sanitization utility to process the content
    const sanitized = processContent(content);

    // Then do any additional processing specific to article display
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');

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

    // Return the cleaned HTML
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error formatting article content:', error);
    return content; // Return original content if formatting fails
  }
}

// Using the estimateReadingTime function defined at the top of the file

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