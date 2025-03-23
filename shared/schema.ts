import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  description: text("description"),
  author: text("author"),
  siteName: text("site_name"),
  siteIcon: text("site_icon"),
  savedAt: timestamp("saved_at").defaultNow(),
  readAt: timestamp("read_at"),
  isArchived: boolean("is_archived").default(false),
  labels: text("labels").array(),
  readingProgress: integer("reading_progress").default(0),
  estimatedReadingTime: integer("estimated_reading_time"),
  folder: text("folder").default("inbox"),
  highlights: text("highlights").array(),
  notes: text("notes"),
  lastReadPosition: integer("last_read_position").default(0),
  darkMode: boolean("dark_mode").default(false),
  customCss: text("custom_css"),
  readingSpeed: integer("reading_speed"),
  sharedWith: text("shared_with").array(),
  isPublic: boolean("is_public").default(false),
  readingGoal: integer("reading_goal"),
  reminderTime: timestamp("reminder_time"),
  collections: text("collections").array(),
  audioEnabled: boolean("audio_enabled").default(false),
  textToSpeechLang: text("tts_lang").default("en"),
});

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").default("#4f46e5"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  savedAt: true,
});

export const insertLabelSchema = createInsertSchema(labels).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertLabel = z.infer<typeof insertLabelSchema>;
export type Label = typeof labels.$inferSelect;
