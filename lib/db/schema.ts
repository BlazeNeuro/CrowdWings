import { pgTable, text, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";

// Better-Auth Core Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  walletAddress: text("wallet_address"),
  bio: text("bio"),
  role: text("role").default("investor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crowdfunding Platform Tables
export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  onChainId: integer("on_chain_id"),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  storyMarkdown: text("story_markdown").notNull(),
  category: text("category").notNull(), // 'Tech', 'DeFi', 'Climate', 'Gaming', 'Creative', 'Community'
  bannerUrl: text("banner_url").notNull(),
  targetEth: numeric("target_eth").notNull(),
  raisedEth: numeric("raised_eth").notNull().default("0"),
  deadline: timestamp("deadline").notNull(),
  creatorWallet: text("creator_wallet").notNull(),
  creatorName: text("creator_name"),
  creatorAvatar: text("creator_avatar"),
  creatorId: text("creator_id").references(() => user.id),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, SUCCEEDED, FAILED, CANCELLED
  fundingType: text("funding_type").notNull().default("ALL_OR_NOTHING"), // ALL_OR_NOTHING, FLEXIBLE
  milestoneCount: integer("milestone_count").notNull().default(0),
  backersCount: integer("backers_count").notNull().default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  index: integer("index").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  percentage: integer("percentage").notNull(),
  targetDate: text("target_date"),
  status: text("status").notNull().default("PENDING"), // PENDING, VOTING, APPROVED, REJECTED, PAID_OUT
  votingDeadline: timestamp("voting_deadline"),
  votesForEth: numeric("votes_for_eth").default("0"),
  votesAgainstEth: numeric("votes_against_eth").default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  backerWallet: text("backer_wallet").notNull(),
  backerName: text("backer_name"),
  amountEth: numeric("amount_eth").notNull(),
  txHash: text("tx_hash"),
  tierName: text("tier_name"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const campaignUpdates = pgTable("campaign_updates", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorWallet: text("author_wallet").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  authorWallet: text("author_wallet").notNull(),
  authorName: text("author_name"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
