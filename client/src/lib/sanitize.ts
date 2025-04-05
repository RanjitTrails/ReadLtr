/**
 * Content Sanitization Utility
 * 
 * This module provides utilities for sanitizing HTML content to prevent XSS attacks
 * and improve the reading experience by removing unwanted elements.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param content HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeContent(content: string): string {
  if (!content) return '';
  
  // Configure DOMPurify to allow certain tags but remove potentially harmful ones
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 
      'blockquote', 'b', 'i', 'strong', 'em', 'img', 'code', 'pre', 
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'br', 'div', 'span',
      'figure', 'figcaption'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
      'width', 'height', 'style'
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    ADD_ATTR: ['target'],
    FORCE_HTTPS: true,
    SANITIZE_DOM: true,
    USE_PROFILES: { html: true }
  });
  
  return clean;
}

/**
 * Enhances article content for better readability
 * @param content Sanitized HTML content
 * @returns Enhanced HTML content
 */
export function enhanceContent(content: string): string {
  if (!content) return '';
  
  try {
    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Add target="_blank" to all external links
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http') || href.startsWith('https'))) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    
    // Add responsive class to images
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      img.classList.add('responsive-img');
      
      // If image has width/height attributes but no style, add max-width
      if (img.hasAttribute('width') && !img.hasAttribute('style')) {
        img.setAttribute('style', 'max-width: 100%; height: auto;');
      }
    });
    
    // Wrap tables in a container for horizontal scrolling
    const tables = doc.querySelectorAll('table');
    tables.forEach(table => {
      const wrapper = doc.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
    
    // Get the body content
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error enhancing content:', error);
    return content;
  }
}

/**
 * Process article content for display
 * Sanitizes and enhances the content
 * @param content Raw HTML content
 * @returns Processed HTML content
 */
export function processContent(content: string): string {
  if (!content) return '';
  
  // First sanitize the content
  const sanitized = sanitizeContent(content);
  
  // Then enhance it for better readability
  return enhanceContent(sanitized);
}
