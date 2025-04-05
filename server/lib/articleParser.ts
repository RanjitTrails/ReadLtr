import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';

export interface ParsedArticle {
  title: string;
  url: string;
  excerpt: string;
  content: string;
  author: string;
  publishedDate: string;
  image_url: string;
  content_type: string;
  read_time: number;
}

/**
 * Determines the content type based on URL pattern or domain
 */
export function determineContentType(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    if (url.toLowerCase().endsWith('.pdf')) {
      return 'pdfs';
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return 'tweets';
    } else if (domain.includes('youtube.com') || domain.includes('youtu.be') || domain.includes('vimeo.com')) {
      return 'videos';
    } else if (url.includes('mailto:') || domain.includes('mail.') || domain.includes('gmail.com')) {
      return 'emails';
    } else if ((domain.includes('amazon.com') && url.includes('/dp/')) || domain.includes('goodreads.com') || domain.includes('books.google.com')) {
      return 'books';
    }
    
    return 'articles';
  } catch (error) {
    console.error('Error determining content type:', error);
    return 'articles';
  }
}

/**
 * Estimates reading time for a piece of text
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
 * Parses an article from a URL
 */
export async function parseArticleFromUrl(url: string): Promise<ParsedArticle | null> {
  try {
    // Determine content type based on URL pattern or domain
    const content_type = determineContentType(url);
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Handle special content types
    if (content_type === 'videos' && (domain.includes('youtube.com') || domain.includes('youtu.be'))) {
      // Extract YouTube video ID
      let videoId = '';
      if (domain.includes('youtube.com')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (domain.includes('youtu.be')) {
        videoId = url.split('/').pop() || '';
      }
      
      if (videoId) {
        // Create embedded video content
        const embedHtml = `
          <div class="video-container">
            <iframe 
              width="560" 
              height="315" 
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
        `;
        
        // Try to get video metadata from oEmbed
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
          const oembedResponse = await fetch(oembedUrl);
          
          if (oembedResponse.ok) {
            const oembedData = await oembedResponse.json();
            
            return {
              title: oembedData.title || 'YouTube Video',
              url,
              excerpt: oembedData.author_name ? `Video by ${oembedData.author_name}` : 'YouTube video',
              content: embedHtml,
              author: oembedData.author_name || '',
              publishedDate: '',
              image_url: oembedData.thumbnail_url || '',
              content_type,
              read_time: 5 // Estimate 5 minutes for videos
            };
          }
        } catch (oembedError) {
          console.error('Error fetching YouTube metadata:', oembedError);
          // Continue with regular parsing if oEmbed fails
        }
      }
    }
    
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReadLtr/1.0 Article Parser'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML using jsdom and Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document, {
      classesToPreserve: ['video-container', 'responsive-image', 'table-wrapper'],
      keepClasses: true,
      charThreshold: 100 // Lower threshold to extract more content
    });
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
      const tempDiv = doc.createElement('div');
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
      content_type,
      read_time: readTime
    };
  } catch (error) {
    console.error('Error parsing article:', error);
    return null;
  }
}
