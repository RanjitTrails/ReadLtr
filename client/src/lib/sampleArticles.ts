import { supabase } from './supabase';
import { Article } from './articleService';

// Sample articles to add for new users
const sampleArticles = [
  {
    title: "Welcome to ReadLtr",
    url: "https://preeminent-truffle-338deb.netlify.app/welcome",
    excerpt: "Learn how to use ReadLtr to save and organize your reading list.",
    content: `
      <h1>Welcome to ReadLtr</h1>
      <p>ReadLtr is your personal read-it-later app that helps you save articles, blog posts, and other web content to read when you have time.</p>
      <h2>Getting Started</h2>
      <p>Here are some tips to get the most out of ReadLtr:</p>
      <ul>
        <li><strong>Save articles</strong> - Use the "Save" button to add new articles to your reading list.</li>
        <li><strong>Organize with tags</strong> - Add tags to your articles to keep them organized.</li>
        <li><strong>Favorite articles</strong> - Mark your favorite articles to find them quickly later.</li>
        <li><strong>Archive read content</strong> - Keep your reading list clean by archiving articles you've finished.</li>
      </ul>
      <h2>Browser Extension</h2>
      <p>Install our browser extension to save articles with one click from any website.</p>
      <h2>Mobile Access</h2>
      <p>Access your reading list on the go with our mobile-friendly interface.</p>
    `,
    author: "ReadLtr Team",
    published_date: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
    content_type: "articles",
    domain: "preeminent-truffle-338deb.netlify.app",
    tags: ["welcome", "tutorial"]
  },
  {
    title: "The Benefits of Digital Reading",
    url: "https://preeminent-truffle-338deb.netlify.app/sample/digital-reading",
    excerpt: "Discover the advantages of digital reading and how it can improve your reading habits.",
    content: `
      <h1>The Benefits of Digital Reading</h1>
      <p>Digital reading has transformed how we consume information. Here are some key benefits:</p>
      <h2>1. Accessibility</h2>
      <p>Digital reading makes books and articles accessible anywhere, anytime. You can carry thousands of books on a single device.</p>
      <h2>2. Customization</h2>
      <p>Adjust font size, style, and background color to suit your preferences and reduce eye strain.</p>
      <h2>3. Search Functionality</h2>
      <p>Quickly find specific information within a text using search features.</p>
      <h2>4. Environmental Impact</h2>
      <p>Digital reading reduces paper consumption and the environmental impact of producing physical books.</p>
      <h2>5. Interactive Features</h2>
      <p>Many digital reading platforms offer interactive features like highlighting, note-taking, and dictionary lookups.</p>
    `,
    author: "Reading Enthusiast",
    published_date: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    content_type: "articles",
    domain: "preeminent-truffle-338deb.netlify.app",
    tags: ["reading", "digital"]
  },
  {
    title: "How to Build a Reading Habit",
    url: "https://preeminent-truffle-338deb.netlify.app/sample/reading-habit",
    excerpt: "Learn how to develop a consistent reading habit and enjoy the benefits of regular reading.",
    content: `
      <h1>How to Build a Reading Habit</h1>
      <p>Reading regularly can improve your knowledge, vocabulary, and critical thinking skills. Here's how to build a sustainable reading habit:</p>
      <h2>1. Start Small</h2>
      <p>Begin with just 10-15 minutes of reading per day. Consistency is more important than duration.</p>
      <h2>2. Choose the Right Books</h2>
      <p>Select books that genuinely interest you. Don't force yourself to read what doesn't engage you.</p>
      <h2>3. Create a Reading Environment</h2>
      <p>Designate a comfortable, well-lit space for reading that's free from distractions.</p>
      <h2>4. Set Reading Goals</h2>
      <p>Establish achievable goals, such as reading a certain number of pages or minutes each day.</p>
      <h2>5. Join a Reading Community</h2>
      <p>Participate in book clubs or online reading groups to stay motivated and discover new books.</p>
      <h2>6. Use Tools Like ReadLtr</h2>
      <p>Save interesting articles to read later when you have time, rather than trying to read everything immediately.</p>
    `,
    author: "Habit Coach",
    published_date: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6",
    content_type: "articles",
    domain: "preeminent-truffle-338deb.netlify.app",
    tags: ["habits", "reading", "productivity"]
  }
];

/**
 * Adds sample articles to a new user's account
 * @param userId The ID of the user to add sample articles for
 */
export async function addSampleArticles(userId: string): Promise<void> {
  try {
    // Check if user already has articles
    const { data: existingArticles, error: checkError } = await supabase
      .from('articles')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (checkError) throw checkError;
    
    // If user already has articles, don't add samples
    if (existingArticles && existingArticles.length > 0) {
      return;
    }
    
    // Prepare articles for insertion
    const articlesToInsert = sampleArticles.map(article => ({
      user_id: userId,
      title: article.title,
      url: article.url,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      published_date: article.published_date,
      date_added: new Date().toISOString(),
      read_time: estimateReadingTime(article.content),
      is_favorite: false,
      is_archived: false,
      is_read: false,
      image_url: article.image_url,
      domain: article.domain,
      content_type: article.content_type
    }));
    
    // Insert articles
    const { data: insertedArticles, error: insertError } = await supabase
      .from('articles')
      .insert(articlesToInsert)
      .select('id');
    
    if (insertError) throw insertError;
    if (!insertedArticles) return;
    
    // Add tags for each article
    for (let i = 0; i < sampleArticles.length; i++) {
      const article = sampleArticles[i];
      const insertedArticle = insertedArticles[i];
      
      if (article.tags && article.tags.length > 0) {
        // For each tag, check if it exists or create it
        for (const tagName of article.tags) {
          // Check if tag exists
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .eq('user_id', userId)
            .single();
          
          let tagId: string;
          
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tagName, user_id: userId })
              .select('id')
              .single();
            
            if (tagError) continue;
            if (!newTag) continue;
            
            tagId = newTag.id;
          }
          
          // Create article-tag relationship
          await supabase
            .from('article_tags')
            .insert({
              article_id: insertedArticle.id,
              tag_id: tagId
            });
        }
      }
    }
  } catch (error) {
    console.error('Error adding sample articles:', error);
  }
}

/**
 * Estimates reading time for a piece of text
 * @param text - The text to analyze
 * @returns estimated reading time in minutes
 */
function estimateReadingTime(text: string): number {
  if (!text) return 1;
  
  try {
    // Remove HTML tags to get just the text
    const textOnly = text.replace(/<[^>]*>/g, '');
    
    // Average reading speed is about 200-250 words per minute
    const wordsPerMinute = 225;
    const wordCount = textOnly.trim().split(/\\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    // Return at least 1 minute
    return Math.max(1, readingTime);
  } catch (error) {
    return 1; // Default to 1 minute if estimation fails
  }
}
