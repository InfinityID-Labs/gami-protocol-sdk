import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Transaction types for point transactions
 */
export enum TransactionType {
  AWARD = 'award',
  REDEEM = 'redeem',
  SHADOW_AWARD = 'shadow_award',       // Award to customer without app
  SHADOW_REDEEM = 'shadow_redeem',     // Redeem from customer without app
  ACCOUNT_ACTIVATION = 'account_activation', // When shadow account is activated
  POINTS_MIGRATION = 'points_migration'  // When points are migrated to activated account
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull().unique(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, inactive
  environment: text("environment").notNull().default("development"), // development, production
  createdAt: timestamp("created_at").defaultNow(),
});

export const xpEvents = pgTable("xp_events", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  xpAmount: integer("xp_amount").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, testing
  createdAt: timestamp("created_at").defaultNow(),
});

export const userXpTransactions = pgTable("user_xp_transactions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  externalUserId: text("external_user_id").notNull(), // User ID from the client application
  eventId: integer("event_id").notNull().references(() => xpEvents.id),
  xpAmount: integer("xp_amount").notNull(),
  metadata: json("metadata"), // Additional event data
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  rewardAmount: integer("reward_amount"),
  status: text("status").notNull().default("active"), // active, inactive, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletIntegrations = pgTable("wallet_integrations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  walletType: text("wallet_type").notNull(), // phantom, solflare, walletconnect
  isEnabled: boolean("is_enabled").notNull().default(true),
  config: json("config"), // Additional configuration
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewardDistributions = pgTable("reward_distributions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  externalUserId: text("external_user_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  tokenAmount: integer("token_amount").notNull(),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const walrusMetadata = pgTable("walrus_metadata", {
  id: serial("id").primaryKey(),
  blobId: text("blob_id").notNull().unique(),
  metadata: json("metadata").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Partner business that integrates with Gami
 */
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  partnerId: varchar("partner_id", { length: 64 }).notNull().unique(),
  partnerName: varchar("partner_name", { length: 100 }).notNull(),
  partnerApiKey: varchar("partner_api_key", { length: 64 }).notNull(),
  deepLinkUrl: text("deep_link_url"),
  redirectUrl: text("redirect_url"),
  oauthCallbackUrl: text("oauth_callback_url"),
  customCssUrl: text("custom_css_url"),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 20 }),
  secondaryColor: varchar("secondary_color", { length: 20 }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Customer record for partner businesses
 */
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  universalId: varchar("universal_id", { length: 64 }).notNull().unique(),
  externalCustomerId: varchar("external_customer_id", { length: 100 }).notNull(),
  partnerId: varchar("partner_id", { length: 64 }).notNull().references(() => partners.partnerId),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 32 }),
  name: varchar("name", { length: 255 }),
  points: integer("points").default(0).notNull(),
  walletPublicKey: varchar("wallet_public_key", { length: 255 }),
  qrCode: text("qr_code"),
  deepLink: text("deep_link"),
  claimCode: varchar("claim_code", { length: 16 }), // Code for claiming shadow accounts
  shadowAccount: boolean("shadow_account").default(false), // Flag for shadow accounts
  metadata: jsonb("metadata"),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Points transaction record for customer points
 */
export const pointsTransactions = pgTable("points_transactions", {
  id: serial("id").primaryKey(),
  transferId: varchar("transfer_id", { length: 64 }).notNull().unique(),
  universalId: varchar("universal_id", { length: 64 }).notNull().references(() => customers.universalId),
  partnerId: varchar("partner_id", { length: 64 }).notNull(),
  externalCustomerId: varchar("external_customer_id", { length: 100 }).notNull(),
  points: integer("points").notNull(),
  transactionType: varchar("transaction_type", { length: 32 }).notNull(),
  purpose: varchar("purpose", { length: 64 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertXpEventSchema = createInsertSchema(xpEvents).omit({ id: true, createdAt: true });
export const insertUserXpTransactionSchema = createInsertSchema(userXpTransactions).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export const insertWalletIntegrationSchema = createInsertSchema(walletIntegrations).omit({ id: true, createdAt: true });
export const insertRewardDistributionSchema = createInsertSchema(rewardDistributions).omit({ id: true, createdAt: true });
export const insertWalrusMetadataSchema = createInsertSchema(walrusMetadata).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ 
  id: true, 
  qrCode: true, 
  deepLink: true, 
  points: true, 
  lastActivity: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type XpEvent = typeof xpEvents.$inferSelect;
export type InsertXpEvent = z.infer<typeof insertXpEventSchema>;

export type UserXpTransaction = typeof userXpTransactions.$inferSelect;
export type InsertUserXpTransaction = z.infer<typeof insertUserXpTransactionSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type WalletIntegration = typeof walletIntegrations.$inferSelect;
export type InsertWalletIntegration = z.infer<typeof insertWalletIntegrationSchema>;

export type RewardDistribution = typeof rewardDistributions.$inferSelect;
export type InsertRewardDistribution = z.infer<typeof insertRewardDistributionSchema>;

export type WalrusMetadata = typeof walrusMetadata.$inferSelect;
export type InsertWalrusMetadata = z.infer<typeof insertWalrusMetadataSchema>;

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type InsertPointsTransaction = z.infer<typeof insertPointsTransactionSchema>;

// API Schemas
export const trackEventSchema = z.object({
  userId: z.string(),
  event: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const connectWalletSchema = z.object({
  walletType: z.enum(["phantom", "solflare", "walletconnect"]),
});

// E-commerce integration schemas
export const registerPartnerSchema = z.object({
  partnerApiKey: z.string().min(6),
  partnerId: z.string().min(4),
  partnerName: z.string().min(2),
  deepLinkUrl: z.string().url().optional(),
  redirectUrl: z.string().url().optional(),
  oauthCallbackUrl: z.string().url().optional(),
  customCssUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const onboardCustomerSchema = z.object({
  externalCustomerId: z.string().min(1),
  partnerId: z.string().min(4),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const awardPointsSchema = z.object({
  externalCustomerId: z.string().min(1),
  partnerId: z.string().min(4),
  points: z.number().int().positive(),
  transactionType: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export const redeemPointsSchema = z.object({
  externalCustomerId: z.string().min(1),
  partnerId: z.string().min(4),
  points: z.number().int().positive(),
  purpose: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export const activateShadowAccountSchema = z.object({
  claimCode: z.string().min(4),
  walletPublicKey: z.string().min(32),
  deviceId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});
