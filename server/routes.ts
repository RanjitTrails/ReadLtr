import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { insertUserSchema, insertArticleSchema, insertLabelSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "omnivore-secret-key";

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
        savedAt: new Date(),
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
      res.status(500).json({ message: "Failed to register user" });
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

  return httpServer;
}
