import { pgTable, text, serial, integer, boolean, timestamp, uuid, date, time, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { profiles } from "./schema";

// Reading sessions table
export const reading_sessions = pgTable("reading_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  article_id: uuid("article_id").notNull(),
  started_at: timestamp("started_at").defaultNow().notNull(),
  ended_at: timestamp("ended_at"),
  duration_seconds: integer("duration_seconds"),
  progress_percentage: integer("progress_percentage"),
  completed: boolean("completed").default(false),
  device_type: text("device_type"),
  os_name: text("os_name"),
  browser_name: text("browser_name"),
  screen_size: text("screen_size"),
});

// Reading goals table
export const reading_goals = pgTable("reading_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  goal_type: text("goal_type").notNull(), // 'daily', 'weekly', 'monthly'
  target_count: integer("target_count").notNull(),
  target_unit: text("target_unit").notNull(), // 'articles', 'minutes'
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  is_recurring: boolean("is_recurring").default(false),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Reading stats table
export const reading_stats = pgTable("reading_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  articles_read: integer("articles_read").default(0),
  articles_saved: integer("articles_saved").default(0),
  minutes_read: integer("minutes_read").default(0),
  words_read: integer("words_read").default(0),
  streak_days: integer("streak_days").default(0),
}, (table) => {
  return {
    userDateIdx: primaryKey({ columns: [table.user_id, table.date] }),
  };
});

// User preferences table
export const user_preferences = pgTable("user_preferences", {
  user_id: uuid("user_id").primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  reading_speed: integer("reading_speed").default(200),
  preferred_categories: text("preferred_categories").array(),
  preferred_reading_time: text("preferred_reading_time"),
  font_size: text("font_size").default("medium"),
  theme: text("theme").default("dark"),
  enable_recommendations: boolean("enable_recommendations").default(true),
  enable_reading_reminders: boolean("enable_reading_reminders").default(false),
  reminder_time: time("reminder_time"),
  reminder_days: integer("reminder_days").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Article recommendations table
export const article_recommendations = pgTable("article_recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  article_id: uuid("article_id").notNull(),
  reason: text("reason"),
  score: real("score"),
  is_read: boolean("is_read").default(false),
  is_dismissed: boolean("is_dismissed").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userArticleIdx: primaryKey({ columns: [table.user_id, table.article_id] }),
  };
});

// Article topics table
export const article_topics = pgTable("article_topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  article_id: uuid("article_id").notNull(),
  topic: text("topic").notNull(),
  confidence: real("confidence"),
}, (table) => {
  return {
    articleTopicIdx: primaryKey({ columns: [table.article_id, table.topic] }),
  };
});

// User topic interests table
export const user_topic_interests = pgTable("user_topic_interests", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  topic: text("topic").notNull(),
  interest_level: real("interest_level").default(0.0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userTopicIdx: primaryKey({ columns: [table.user_id, table.topic] }),
  };
});

// Insert schemas
export const insertReadingSessionSchema = createInsertSchema(reading_sessions).omit({
  id: true,
  duration_seconds: true,
});

export const insertReadingGoalSchema = createInsertSchema(reading_goals).omit({
  id: true,
  created_at: true,
});

export const insertUserPreferencesSchema = createInsertSchema(user_preferences).omit({
  created_at: true,
  updated_at: true,
});

export const insertUserTopicInterestSchema = createInsertSchema(user_topic_interests).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Types
export type InsertReadingSession = z.infer<typeof insertReadingSessionSchema>;
export type ReadingSession = typeof reading_sessions.$inferSelect;

export type InsertReadingGoal = z.infer<typeof insertReadingGoalSchema>;
export type ReadingGoal = typeof reading_goals.$inferSelect;

export type ReadingStat = typeof reading_stats.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof user_preferences.$inferSelect;

export type ArticleRecommendation = typeof article_recommendations.$inferSelect;

export type ArticleTopic = typeof article_topics.$inferSelect;

export type InsertUserTopicInterest = z.infer<typeof insertUserTopicInterestSchema>;
export type UserTopicInterest = typeof user_topic_interests.$inferSelect;
