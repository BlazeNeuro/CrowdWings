import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = neon(url);

const ddl = `
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"wallet_address" text,
	"bio" text,
	"role" text DEFAULT 'investor',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"on_chain_id" integer,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"story_markdown" text NOT NULL,
	"category" text NOT NULL,
	"banner_url" text NOT NULL,
	"target_eth" numeric NOT NULL,
	"raised_eth" numeric DEFAULT '0' NOT NULL,
	"deadline" timestamp NOT NULL,
	"creator_wallet" text NOT NULL,
	"creator_name" text,
	"creator_avatar" text,
	"creator_id" text REFERENCES "user"("id"),
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"funding_type" text DEFAULT 'ALL_OR_NOTHING' NOT NULL,
	"milestone_count" integer DEFAULT 0 NOT NULL,
	"backers_count" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL REFERENCES "campaigns"("id") ON DELETE cascade,
	"index" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"percentage" integer NOT NULL,
	"target_date" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"voting_deadline" timestamp,
	"votes_for_eth" numeric DEFAULT '0',
	"votes_against_eth" numeric DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL REFERENCES "campaigns"("id") ON DELETE cascade,
	"backer_wallet" text NOT NULL,
	"backer_name" text,
	"amount_eth" numeric NOT NULL,
	"tx_hash" text,
	"tier_name" text,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "campaign_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL REFERENCES "campaigns"("id") ON DELETE cascade,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author_wallet" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL REFERENCES "campaigns"("id") ON DELETE cascade,
	"author_wallet" text NOT NULL,
	"author_name" text,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
`;

async function main() {
  console.log("Applying schema to Neon DB...");
  const statements = ddl.split(";").map((s) => s.trim()).filter(Boolean);
  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (err: any) {
      console.error("Error executing statement:", statement.slice(0, 40), err.message);
    }
  }
  const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`;
  console.log("Neon DB Tables:", result.map((r: any) => r.table_name));
}

main();
