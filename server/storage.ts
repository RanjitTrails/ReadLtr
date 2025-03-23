import {
  type User, 
  type InsertUser,
  type Article,
  type InsertArticle,
  type Label,
  type InsertLabel
} from "@shared/schema";
import { supabaseStorage } from "./supabase-storage";

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

// Export the Supabase storage implementation
export const storage = supabaseStorage;