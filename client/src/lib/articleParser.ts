/**
 * Article Parser Utility
 * 
 * This module provides utilities for parsing and cleaning article content
 * extracted from web pages, optimizing it for readability.
 */

import { ParsedArticle } from './articleService';

/**
 * Parses an article from a URL, extracting title, content, author, etc.
 * In a real application, this would use a proper parser or API.
 */
export async function parseArticleFromUrl(url: string): Promise<ParsedArticle | null> {
  try {
    // This is a mock implementation for demo purposes
    // In a real app, you would use a service like Mercury, Readability, or your own parser
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a mock parsed article based on the URL
    // In production, you would actually fetch and parse the content
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Generate some mock data based on the domain
    let title = "Unnamed Article";
    let excerpt = "";
    let content = "";
    let author = "";
    let publishedDate = "";
    let image_url = "";
    let content_type: 'articles' | 'books' | 'emails' | 'pdfs' | 'tweets' | 'videos' = 'articles'; // Default content type
    
    // Determine content type based on URL pattern or domain
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
    
    if (domain.includes('medium.com')) {
      title = "How to Build Better Web Applications in 2024";
      excerpt = "Modern web development requires a new approach. Here's how to stay ahead of the curve.";
      author = "Sarah Johnson";
      publishedDate = "2024-05-15";
      image_url = "https://images.unsplash.com/photo-1498050108023-c5249f4df085";
      content = `
        <h1>How to Build Better Web Applications in 2024</h1>
        <p>The web development landscape continues to evolve at a rapid pace. Frameworks, tools, and best practices that were cutting-edge just a few years ago may now be considered outdated or inefficient.</p>
        <h2>1. Focus on Performance</h2>
        <p>Performance isn't just about speed—it's about user experience. Studies consistently show that users abandon sites that take more than a few seconds to load.</p>
        <p>Modern approaches like:</p>
        <ul>
          <li>Code splitting and lazy loading</li>
          <li>Optimizing the critical rendering path</li>
          <li>Using modern image formats and compression</li>
        </ul>
        <p>These techniques can dramatically improve perceived performance.</p>
        <h2>2. Embrace Server Components</h2>
        <p>Frameworks like Next.js and similar meta-frameworks are moving toward server components, which render on the server but can hydrate on the client when needed.</p>
        <h2>3. Prioritize Accessibility</h2>
        <p>Building accessible applications isn't just the right thing to do—it's increasingly becoming a legal requirement in many jurisdictions.</p>
        <h2>4. Consider Edge Computing</h2>
        <p>Edge computing moves computation closer to the user, reducing latency and improving performance.</p>
        <h2>5. Design for Mobile-First</h2>
        <p>Mobile traffic continues to grow, and designing for mobile first ensures your application works well on all devices.</p>
        <p>By adopting these approaches, you can build web applications that are not only modern and feature-rich but also performant, accessible, and future-proof.</p>
      `;
    } else if (domain.includes('dev.to')) {
      title = "Understanding TypeScript Generics: A Practical Guide";
      excerpt = "TypeScript generics can be confusing at first, but they're incredibly powerful once you understand them.";
      author = "Michael Chen";
      publishedDate = "2024-04-22";
      image_url = "https://images.unsplash.com/photo-1587620962725-abab7fe55159";
      content = `
        <h1>Understanding TypeScript Generics: A Practical Guide</h1>
        <p>TypeScript generics provide a way to create reusable components that can work with a variety of types rather than a single one. This is extremely powerful for building flexible, type-safe abstractions.</p>
        <h2>Why Use Generics?</h2>
        <p>Without generics, we'd have to either:</p>
        <ul>
          <li>Create separate functions for each type</li>
          <li>Use the 'any' type, which loses type safety</li>
        </ul>
        <p>Generics give us the best of both worlds: flexibility with type safety.</p>
        <h2>Basic Generic Syntax</h2>
        <pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg;
}</code></pre>
        <p>This function can work with any type, and TypeScript ensures that the return type matches the input type.</p>
        <h2>Generic Constraints</h2>
        <p>Sometimes you want to restrict what types can be used with your generic. You can do this with constraints:</p>
        <pre><code>interface Lengthwise {
  length: number;
}

function logLength&lt;T extends Lengthwise&gt;(arg: T): T {
  console.log(arg.length);
  return arg;
}</code></pre>
        <h2>Practical Examples</h2>
        <p>Let's look at some real-world uses of generics:</p>
        <h3>1. API Response Handling</h3>
        <pre><code>async function fetchData&lt;T&gt;(url: string): Promise&lt;T&gt; {
  const response = await fetch(url);
  return response.json();
}</code></pre>
        <p>By mastering generics, you'll be able to write more reusable, type-safe code in TypeScript.</p>
      `;
    } else if (domain.includes('github.com')) {
      title = "10 GitHub Actions Workflows Every Developer Should Know";
      excerpt = "Automate your development workflow with these essential GitHub Actions configurations.";
      author = "Taylor Rivera";
      publishedDate = "2024-03-10";
      image_url = "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb";
      content = `
        <h1>10 GitHub Actions Workflows Every Developer Should Know</h1>
        <p>GitHub Actions has revolutionized CI/CD by making it more accessible and deeply integrated with your repository. Here are 10 workflows that can improve your development process.</p>
        <h2>1. Basic CI Workflow</h2>
        <pre><code>name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test</code></pre>
        <h2>2. Automated Releases</h2>
        <p>Create automatic releases when you tag your repository.</p>
        <h2>3. Dependency Updates</h2>
        <p>Use Dependabot with GitHub Actions to keep your dependencies up to date.</p>
        <h2>4. Code Quality Checks</h2>
        <p>Integrate linters and code quality tools into your workflow.</p>
        <h2>5. Automated Deployments</h2>
        <p>Deploy your application automatically when changes are pushed to specific branches.</p>
        <p>By implementing these workflows, you can save time, improve code quality, and make your development process more efficient.</p>
      `;
    } else {
      // Default mock article for any other domain
      title = `Article from ${domain}`;
      excerpt = "This is a sample article extracted from the provided URL.";
      content = "<p>This is a placeholder for the article content.</p>";
      image_url = "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2";
    }
    
    return {
      title,
      url,
      excerpt,
      content,
      author,
      publishedDate,
      image_url,
      content_type
    };
  } catch (error) {
    console.error('Error parsing article:', error);
    return null;
  }
}

/**
 * Formats article content for display
 * Cleans up common HTML issues and improves readability
 */
export function formatArticleContent(content: string): string {
  // In a real implementation, this would:
  // - Remove unnecessary elements (ads, nav, etc.)
  // - Fix image paths
  // - Improve typography
  // - Add appropriate styling
  
  return content;
}

/**
 * Estimates reading time for a piece of text
 * @param text - The text to analyze
 * @returns estimated reading time in minutes
 */
export function estimateReadingTime(text: string): number {
  // Average reading speed is about 200-250 words per minute
  const wordsPerMinute = 225;
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readingTime);
}

/**
 * Extracts keywords/topics from article content
 */
export function extractKeywords(content: string): string[] {
  // In a real implementation, this would use NLP techniques
  // For now, return mock data
  return ["react", "typescript", "web development"];
} 