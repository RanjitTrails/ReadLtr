import { pgTable, text, serial, integer, boolean, timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Match Supabase schema from supabase/migrations/01_schema.sql

// Profiles table (extends Supabase auth.users)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Articles table
export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  author: text("author"),
  published_date: timestamp("published_date"),
  date_added: timestamp("date_added").defaultNow().notNull(),
  read_time: integer("read_time"),
  is_favorite: boolean("is_favorite").default(false),
  is_archived: boolean("is_archived").default(false),
  is_read: boolean("is_read").default(false),
  image_url: text("image_url"),
  domain: text("domain"),
  content_type: text("content_type").default("articles"),
  read_progress: integer("read_progress").default(0),
});

// Tags table
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
});

// Article-tags relationship
export const article_tags = pgTable("article_tags", {
  article_id: uuid("article_id").notNull().references(() => articles.id, { onDelete: 'cascade' }),
  tag_id: uuid("tag_id").notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.article_id, table.tag_id] }),
  };
});

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  date_added: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

export const insertArticleTagSchema = createInsertSchema(article_tags);

// Types
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export type InsertArticleTag = z.infer<typeof insertArticleTagSchema>;
export type ArticleTag = typeof article_tags.$inferSelect;
