import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { insertUserSchema, insertArticleSchema, insertLabelSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import fetch from "node-fetch";
import { healthCheck } from "./health";

// JWT Secret
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required for security");
}
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.body.userId = user.id;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Health check endpoint
  app.get("/api/health", healthCheck);

  // Article Parser Endpoint
  app.post("/api/parse-article", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Determine content type based on URL pattern or domain
      const domain = new URL(url).hostname.replace('www.', '');
      let content_type = 'articles';

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
      }

      // Fetch the page content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ReadLtr Article Parser/1.0'
        }
      });

      if (!response.ok) {
        return res.status(400).json({ error: `Failed to fetch article: ${response.statusText}` });
      }

      const html = await response.text();

      // Parse the HTML using jsdom
      const dom = new JSDOM(html, {
        url: url
      });

      // Extract article content using Readability
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article) {
        return res.status(400).json({ error: 'Could not parse article content' });
      }

      // Extract metadata from the document
      const doc = dom.window.document;

      // Try to get the author from meta tags
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

      // If no OG image, try to find the first large image in the article
      if (!image_url && article.content) {
        const tempDiv = doc.createElement('div');
        tempDiv.innerHTML = article.content;
        const images = tempDiv.querySelectorAll('img');
        for (const img of images) {
          const src = img.getAttribute('src');
          if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('avatar')) {
            // Try to get a full URL
            try {
              image_url = new URL(src, url).href;
              break;
            } catch (e) {
              // If URL parsing fails, just use the src as is
              image_url = src;
              break;
            }
          }
        }
      }

      // Create excerpt if not provided by Readability
      let excerpt = article.excerpt || '';
      if (!excerpt && article.content) {
        const tempDiv = doc.createElement('div');
        tempDiv.innerHTML = article.content;
        const text = tempDiv.textContent || '';
        excerpt = text.substring(0, 200).trim() + (text.length > 200 ? '...' : '');
      }

      // Calculate reading time
      const textOnly = article.textContent || '';
      const wordsPerMinute = 225;
      const wordCount = textOnly.trim().split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

      // Return the parsed article
      return res.status(200).json({
        title: article.title || 'Untitled Article',
        url,
        excerpt,
        content: article.content || '',
        author,
        publishedDate,
        image_url,
        content_type,
        read_time: readTime,
        domain
      });
    } catch (error) {
      console.error('Error parsing article:', error);
      return res.status(500).json({ error: 'Failed to parse article' });
    }
  });

  // API Key for Browser Extension
  app.post("/api/auth/api-key", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;

      // Generate a long-lived API key for browser extensions/mobile apps
      const apiKey = jwt.sign(
        { id: userId, type: "api_key" },
        JWT_SECRET,
        { expiresIn: '365d' } // Valid for 1 year
      );

      res.status(200).json({ apiKey });
    } catch (error) {
      console.error("API key generation error:", error);
      res.status(500).json({ message: "Failed to generate API key" });
    }
  });

  // Browser Extension Save Route
  app.post("/api/extension/save", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const { url, title, content, description, siteName, siteIcon } = req.body;

      // Basic validation
      if (!url || !title) {
        return res.status(400).json({ message: "URL and title are required" });
      }

      // Create article with extension metadata
      const article = await storage.createArticle({
        userId,
        url,
        title,
        content: content || null,
        description: description || null,
        siteName: siteName || null,
        siteIcon: siteIcon || null,
        readAt: null,
        isArchived: false,
        labels: null,
        readingProgress: 0
      });

      res.status(201).json(article);
    } catch (error) {
      console.error("Extension save error:", error);
      res.status(500).json({ message: "Failed to save article from extension" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create new user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

      // Return user data (excluding password) and token
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }

      console.error("Registration error:", error);
      if (error.code === 'P2002') {
        res.status(409).json({ message: "Username or email already exists" });
      } else {
        res.status(500).json({ message: error.message || "Failed to register user" });
      }
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

      // Return user data (excluding password) and token
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Article routes
  app.get("/api/articles", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const articles = await storage.getArticlesByUserId(userId);
      res.status(200).json(articles);
    } catch (error) {
      console.error("Get articles error:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.body.userId;

      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const article = await storage.getArticle(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (article.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this article" });
      }

      res.status(200).json(article);
    } catch (error) {
      console.error("Get article error:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const articleData = insertArticleSchema.parse({ ...req.body, userId });

      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid article data", errors: error.errors });
      }

      console.error("Create article error:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Update reading progress
  app.post("/api/articles/:id/progress", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.body.userId;
      const { progress, lastReadPosition } = req.body;

      const article = await storage.getArticle(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (article.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this article" });
      }

      const updatedArticle = await storage.updateArticle(articleId, {
        readingProgress: progress,
        lastReadPosition,
        readAt: progress === 100 ? new Date() : article.readAt
      });

      res.status(200).json(updatedArticle);
    } catch (error) {
      console.error("Update progress error:", error);
      res.status(500).json({ message: "Failed to update reading progress" });
    }
  });

  // Add highlight
  app.post("/api/articles/:id/highlights", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.body.userId;
      const { highlight } = req.body;

      const article = await storage.getArticle(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (article.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this article" });
      }

      const highlights = article.highlights || [];
      const updatedArticle = await storage.updateArticle(articleId, {
        highlights: [...highlights, highlight]
      });

      res.status(200).json(updatedArticle);
    } catch (error) {
      console.error("Add highlight error:", error);
      res.status(500).json({ message: "Failed to add highlight" });
    }
  });

  // Update folder
  app.post("/api/articles/:id/folder", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.body.userId;
      const { folder } = req.body;

      const article = await storage.getArticle(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (article.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this article" });
      }

      const updatedArticle = await storage.updateArticle(articleId, { folder });
      res.status(200).json(updatedArticle);
    } catch (error) {
      console.error("Update folder error:", error);
      res.status(500).json({ message: "Failed to update folder" });
    }
  });

  // Bulk update articles
  app.post("/api/articles/bulk", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const { articleIds, updates } = req.body;

      const results = await Promise.all(
        articleIds.map(async (id: number) => {
          const article = await storage.getArticle(id);

          if (!article || article.userId !== userId) {
            return { id, success: false };
          }

          await storage.updateArticle(id, updates);
          return { id, success: true };
        })
      );

      res.status(200).json(results);
    } catch (error) {
      console.error("Bulk update error:", error);
      res.status(500).json({ message: "Failed to perform bulk update" });
    }
  });

  app.patch("/api/articles/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.body.userId;

      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const article = await storage.getArticle(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (article.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this article" });
      }

      const updatedArticle = await storage.updateArticle(articleId, req.body);
      res.status(200).json(updatedArticle);
    } catch (error) {
      console.error("Update article error:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.body.userId;

      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const article = await storage.getArticle(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (article.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this article" });
      }

      await storage.deleteArticle(articleId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete article error:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Label routes
  app.get("/api/labels", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const labels = await storage.getLabelsByUserId(userId);
      res.status(200).json(labels);
    } catch (error) {
      console.error("Get labels error:", error);
      res.status(500).json({ message: "Failed to fetch labels" });
    }
  });

  app.post("/api/labels", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const labelData = insertLabelSchema.parse({ ...req.body, userId });

      const label = await storage.createLabel(labelData);
      res.status(201).json(label);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid label data", errors: error.errors });
      }

      console.error("Create label error:", error);
      res.status(500).json({ message: "Failed to create label" });
    }
  });

  app.patch("/api/labels/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const labelId = parseInt(req.params.id);
      const userId = req.body.userId;

      if (isNaN(labelId)) {
        return res.status(400).json({ message: "Invalid label ID" });
      }

      const label = await storage.getLabel(labelId);

      if (!label) {
        return res.status(404).json({ message: "Label not found" });
      }

      if (label.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this label" });
      }

      const updatedLabel = await storage.updateLabel(labelId, req.body);
      res.status(200).json(updatedLabel);
    } catch (error) {
      console.error("Update label error:", error);
      res.status(500).json({ message: "Failed to update label" });
    }
  });

  app.delete("/api/labels/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const labelId = parseInt(req.params.id);
      const userId = req.body.userId;

      if (isNaN(labelId)) {
        return res.status(400).json({ message: "Invalid label ID" });
      }

      const label = await storage.getLabel(labelId);

      if (!label) {
        return res.status(404).json({ message: "Label not found" });
      }

      if (label.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this label" });
      }

      await storage.deleteLabel(labelId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete label error:", error);
      res.status(500).json({ message: "Failed to delete label" });
    }
  });

  // Social Features
  app.post("/api/articles/:id/share", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const { userIds, isPublic } = req.body;
      const userId = req.body.userId;

      const article = await storage.getArticle(articleId);
      if (!article || article.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedArticle = await storage.updateArticle(articleId, {
        sharedWith: userIds,
        isPublic
      });

      res.status(200).json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Failed to share article" });
    }
  });

  // Reading Goals
  app.post("/api/users/reading-goals", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { readingGoal } = req.body;
      const userId = req.body.userId;

      await storage.updateUserSettings(userId, { readingGoal });
      res.status(200).json({ message: "Reading goal updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update reading goal" });
    }
  });

  // Text-to-Speech
  app.post("/api/articles/:id/tts", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const { enabled, language } = req.body;
      const userId = req.body.userId;

      const article = await storage.getArticle(articleId);
      if (!article || article.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedArticle = await storage.updateArticle(articleId, {
        audioEnabled: enabled,
        textToSpeechLang: language
      });

      res.status(200).json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Failed to update TTS settings" });
    }
  });

  // Collections
  app.post("/api/articles/:id/collections", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const { collections } = req.body;
      const userId = req.body.userId;

      const article = await storage.getArticle(articleId);
      if (!article || article.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedArticle = await storage.updateArticle(articleId, { collections });
      res.status(200).json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Failed to update collections" });
    }
  });

  // Reading Reminders
  app.post("/api/articles/:id/reminder", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const { reminderTime } = req.body;
      const userId = req.body.userId;

      const article = await storage.getArticle(articleId);
      if (!article || article.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedArticle = await storage.updateArticle(articleId, { reminderTime });
      res.status(200).json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Failed to set reminder" });
    }
  });

  return httpServer;
}
