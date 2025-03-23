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
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values({
        ...user,
        createdAt: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(error.meta?.target?.includes('username') 
          ? 'Username already exists'
          : 'Email already exists');
      }
      throw error;
    }
  }

  // Article methods
  async getArticle(id: number): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getArticlesByUserId(userId: number): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.userId, userId));
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const result = await db.insert(articles).values({
      ...insertArticle,
      savedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateArticle(id: number, articleUpdate: Partial<Article>): Promise<Article | undefined> {
    const result = await db
      .update(articles)
      .set(articleUpdate)
      .where(eq(articles.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning({ id: articles.id });
    return result.length > 0;
  }

  // Label methods
  async getLabel(id: number): Promise<Label | undefined> {
    const result = await db.select().from(labels).where(eq(labels.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getLabelsByUserId(userId: number): Promise<Label[]> {
    return await db.select().from(labels).where(eq(labels.userId, userId));
  }

  async createLabel(insertLabel: InsertLabel): Promise<Label> {
    const result = await db.insert(labels).values(insertLabel).returning();
    return result[0];
  }

  async updateLabel(id: number, labelUpdate: Partial<Label>): Promise<Label | undefined> {
    const result = await db
      .update(labels)
      .set(labelUpdate)
      .where(eq(labels.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteLabel(id: number): Promise<boolean> {
    const result = await db
      .delete(labels)
      .where(eq(labels.id, id))
      .returning({ id: labels.id });
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();