// Content script for ReadLtr extension
// This script extracts metadata from the current page

// Helper to extract metadata
function extractMetadata() {
  try {
    // Default metadata
    const metadata = {
      author: '',
      description: '',
      imageUrl: '',
      publishedDate: '',
      readingTimeMinutes: estimateReadingTime()
    };
    
    // Try to get author
    const possibleAuthorMeta = [
      document.querySelector('meta[name="author"]'),
      document.querySelector('meta[property="article:author"]'),
      document.querySelector('meta[property="og:article:author"]'),
      document.querySelector('meta[property="og:author"]'),
      document.querySelector('meta[name="twitter:creator"]')
    ];
    
    for (const meta of possibleAuthorMeta) {
      if (meta && meta.content) {
        metadata.author = meta.content;
        break;
      }
    }
    
    // If no author meta tag, try common author patterns in the DOM
    if (!metadata.author) {
      const authorSelectors = [
        '.author', '.byline', '.article-author', '.post-author',
        '[rel="author"]', '.entry-author'
      ];
      
      for (const selector of authorSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          metadata.author = element.textContent.trim();
          break;
        }
      }
    }
    
    // Get description
    const description = document.querySelector('meta[name="description"]') || 
                        document.querySelector('meta[property="og:description"]') ||
                        document.querySelector('meta[name="twitter:description"]');
    
    if (description && description.content) {
      metadata.description = description.content;
    }
    
    // Get image
    const image = document.querySelector('meta[property="og:image"]') ||
                  document.querySelector('meta[name="twitter:image"]');
    
    if (image && image.content) {
      metadata.imageUrl = image.content;
    } else {
      // Try to get the first large image from the article
      const images = Array.from(document.querySelectorAll('article img, .article img, .post img, .post-content img, .entry-content img'));
      const largeImage = images.find(img => {
        return img.naturalWidth > 300 && img.naturalHeight > 200;
      });
      
      if (largeImage && largeImage.src) {
        metadata.imageUrl = largeImage.src;
      }
    }
    
    // Get published date
    const publishedDate = document.querySelector('meta[property="article:published_time"]') ||
                          document.querySelector('meta[name="date"]') ||
                          document.querySelector('time[datetime]');
    
    if (publishedDate) {
      if (publishedDate.content) {
        metadata.publishedDate = publishedDate.content;
      } else if (publishedDate.getAttribute('datetime')) {
        metadata.publishedDate = publishedDate.getAttribute('datetime');
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
}

// Estimate reading time in minutes
function estimateReadingTime() {
  try {
    // Get all text content from the page
    const contentSelectors = [
      'article', '.article', '.post', '.entry', '.content', 
      '.post-content', '.entry-content', 'main'
    ];
    
    let textContent = '';
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        textContent = element.textContent;
        break;
      }
    }
    
    // Fall back to body content if no article container found
    if (!textContent) {
      textContent = document.body.textContent;
    }
    
    // Count words (average reading speed is ~200-250 words per minute)
    const wordCount = textContent.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    
    // Return at least 1 minute, cap at 60 minutes
    return Math.min(Math.max(minutes, 1), 60);
  } catch (error) {
    console.error('Error estimating reading time:', error);
    return 5; // Default 5 minutes
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMetadata') {
    const metadata = extractMetadata();
    sendResponse({ metadata });
  }
  return true; // Required for async response
}); 