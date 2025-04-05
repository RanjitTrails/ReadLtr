import { pgTable, text, serial, integer, boolean, timestamp, uuid, primaryKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Match Supabase schema from supabase/migrations/01_schema.sql

// Profiles table (extends Supabase auth.users)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  // Onboarding fields
  has_seen_welcome: boolean("has_seen_welcome").default(false),
  has_completed_tour: boolean("has_completed_tour").default(false),
  has_sample_articles: boolean("has_sample_articles").default(false),
  onboarding_step: integer("onboarding_step").default(0),
  last_login: timestamp("last_login"),
  // Social fields
  bio: text("bio"),
  website: text("website"),
  twitter_username: text("twitter_username"),
  display_name: text("display_name"),
  is_public: boolean("is_public").default(false),
  follower_count: integer("follower_count").default(0),
  following_count: integer("following_count").default(0),
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
  last_read_at: timestamp("last_read_at", { withTimezone: true }),
  // Social fields
  is_public: boolean("is_public").default(false),
  like_count: integer("like_count").default(0),
  comment_count: integer("comment_count").default(0),
  share_count: integer("share_count").default(0),
  view_count: integer("view_count").default(0),
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

// Collections table
export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  is_public: boolean("is_public").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  cover_image_url: text("cover_image_url"),
  article_count: integer("article_count").default(0),
  view_count: integer("view_count").default(0),
  like_count: integer("like_count").default(0),
});

// Collection articles junction table
export const collection_articles = pgTable("collection_articles", {
  collection_id: uuid("collection_id").notNull().references(() => collections.id, { onDelete: 'cascade' }),
  article_id: uuid("article_id").notNull().references(() => articles.id, { onDelete: 'cascade' }),
  added_at: timestamp("added_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.collection_id, table.article_id] }),
  };
});

// Follows table for user relationships
export const follows = pgTable("follows", {
  follower_id: uuid("follower_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  following_id: uuid("following_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.follower_id, table.following_id] }),
  };
});

// Article likes table
export const article_likes = pgTable("article_likes", {
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  article_id: uuid("article_id").notNull().references(() => articles.id, { onDelete: 'cascade' }),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user_id, table.article_id] }),
  };
});

// Collection likes table
export const collection_likes = pgTable("collection_likes", {
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  collection_id: uuid("collection_id").notNull().references(() => collections.id, { onDelete: 'cascade' }),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user_id, table.collection_id] }),
  };
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  article_id: uuid("article_id").notNull().references(() => articles.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  parent_id: uuid("parent_id").references(() => comments.id, { onDelete: 'cascade' }),
  like_count: integer("like_count").default(0),
});

// Comment likes table
export const comment_likes = pgTable("comment_likes", {
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  comment_id: uuid("comment_id").notNull().references(() => comments.id, { onDelete: 'cascade' }),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user_id, table.comment_id] }),
  };
});

// Insert schemas for social features
export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  created_at: true,
  updated_at: true,
  article_count: true,
  view_count: true,
  like_count: true,
});

export const insertCollectionArticleSchema = createInsertSchema(collection_articles).omit({
  added_at: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  created_at: true,
});

export const insertArticleLikeSchema = createInsertSchema(article_likes).omit({
  created_at: true,
});

export const insertCollectionLikeSchema = createInsertSchema(collection_likes).omit({
  created_at: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  created_at: true,
  updated_at: true,
  like_count: true,
});

export const insertCommentLikeSchema = createInsertSchema(comment_likes).omit({
  created_at: true,
});

// Types
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export type InsertArticleTag = z.infer<typeof insertArticleTagSchema>;
export type ArticleTag = typeof article_tags.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertCollectionArticle = z.infer<typeof insertCollectionArticleSchema>;
export type CollectionArticle = typeof collection_articles.$inferSelect;

export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

export type InsertArticleLike = z.infer<typeof insertArticleLikeSchema>;
export type ArticleLike = typeof article_likes.$inferSelect;

export type InsertCollectionLike = z.infer<typeof insertCollectionLikeSchema>;
export type CollectionLike = typeof collection_likes.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;
export type CommentLike = typeof comment_likes.$inferSelect;

// Highlights table
export const highlights = pgTable("highlights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  note: text("note"),
  color: text("color").default("yellow"),
  position: integer("position"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// Reading sessions table for analytics
export const readingSessions = pgTable("reading_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: 'cascade' }),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  duration: integer("duration"),
  deviceInfo: jsonb("device_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// Create schemas for the new tables
export const insertHighlightSchema = createInsertSchema(highlights);
export const insertReadingSessionSchema = createInsertSchema(readingSessions);

export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type Highlight = typeof highlights.$inferSelect;

export type InsertReadingSession = z.infer<typeof insertReadingSessionSchema>;
export type ReadingSession = typeof readingSessions.$inferSelect;
