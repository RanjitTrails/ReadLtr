import {
  users, 
  articles, 
  labels,
  type User, 
  type InsertUser,
  type Article,
  type InsertArticle,
  type Label,
  type InsertLabel
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Article methods
  getArticle(id: number): Promise<Article | undefined>;
  getArticlesByUserId(userId: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<Article>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Label methods
  getLabel(id: number): Promise<Label | undefined>;
  getLabelsByUserId(userId: number): Promise<Label[]>;
  createLabel(label: InsertLabel): Promise<Label>;
  updateLabel(id: number, label: Partial<Label>): Promise<Label | undefined>;
  deleteLabel(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private labels: Map<number, Label>;
  private userIdCounter: number;
  private articleIdCounter: number;
  private labelIdCounter: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.labels = new Map();
    this.userIdCounter = 1;
    this.articleIdCounter = 1;
    this.labelIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Article methods
  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticlesByUserId(userId: number): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(
      (article) => article.userId === userId,
    );
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleIdCounter++;
    const savedAt = new Date();
    const article: Article = { ...insertArticle, id, savedAt };
    this.articles.set(id, article);
    return article;
  }
  
  async updateArticle(id: number, articleUpdate: Partial<Article>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { ...article, ...articleUpdate };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }
  
  // Label methods
  async getLabel(id: number): Promise<Label | undefined> {
    return this.labels.get(id);
  }
  
  async getLabelsByUserId(userId: number): Promise<Label[]> {
    return Array.from(this.labels.values()).filter(
      (label) => label.userId === userId,
    );
  }
  
  async createLabel(insertLabel: InsertLabel): Promise<Label> {
    const id = this.labelIdCounter++;
    const label: Label = { ...insertLabel, id };
    this.labels.set(id, label);
    return label;
  }
  
  async updateLabel(id: number, labelUpdate: Partial<Label>): Promise<Label | undefined> {
    const label = this.labels.get(id);
    if (!label) return undefined;
    
    const updatedLabel = { ...label, ...labelUpdate };
    this.labels.set(id, updatedLabel);
    return updatedLabel;
  }
  
  async deleteLabel(id: number): Promise<boolean> {
    return this.labels.delete(id);
  }
}

export const storage = new MemStorage();
