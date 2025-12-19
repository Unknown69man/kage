import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const mediaItems = pgTable("media_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  type: text("type").notNull().default("video"),
  size: text("size"),
  duration: text("duration"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const duplicates = pgTable("duplicates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalId: varchar("original_id").notNull(),
  duplicateId: varchar("duplicate_id").notNull(),
  url: text("url").notNull(),
  ignored: boolean("ignored").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vaultFiles = pgTable("vault_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull().default("file"),
  size: text("size"),
  mimeType: text("mime_type"),
  dataUrl: text("data_url"),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({ id: true, createdAt: true });
export const insertDuplicateSchema = createInsertSchema(duplicates).omit({ id: true, createdAt: true });
export const insertVaultFileSchema = createInsertSchema(vaultFiles).omit({ id: true, createdAt: true });

export type MediaItem = typeof mediaItems.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type Duplicate = typeof duplicates.$inferSelect;
export type InsertDuplicate = z.infer<typeof insertDuplicateSchema>;
export type VaultFile = typeof vaultFiles.$inferSelect;
export type InsertVaultFile = z.infer<typeof insertVaultFileSchema>;
