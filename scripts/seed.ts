import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import {
  INITIAL_CAMPAIGNS,
  INITIAL_MILESTONES,
  INITIAL_CONTRIBUTIONS,
  INITIAL_UPDATES,
  INITIAL_COMMENTS,
} from "../lib/db/mock-data";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = neon(url);

async function seed() {
  console.log("Refreshing Neon DB with Nature & Planet Conservation campaigns...");

  // Clean old sample campaigns
  await sql`DELETE FROM comments WHERE campaign_id LIKE 'camp-%';`;
  await sql`DELETE FROM campaign_updates WHERE campaign_id LIKE 'camp-%';`;
  await sql`DELETE FROM contributions WHERE campaign_id LIKE 'camp-%';`;
  await sql`DELETE FROM milestones WHERE campaign_id LIKE 'camp-%';`;
  await sql`DELETE FROM campaigns WHERE id LIKE 'camp-%';`;

  for (const c of INITIAL_CAMPAIGNS) {
    await sql.query(
      `INSERT INTO campaigns (
        id, on_chain_id, title, slug, summary, story_markdown, category, banner_url,
        target_eth, raised_eth, deadline, creator_wallet, creator_name, creator_avatar,
        status, funding_type, milestone_count, backers_count, featured, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        story_markdown = EXCLUDED.story_markdown,
        category = EXCLUDED.category,
        banner_url = EXCLUDED.banner_url,
        target_eth = EXCLUDED.target_eth,
        raised_eth = EXCLUDED.raised_eth,
        status = EXCLUDED.status;`,
      [
        c.id,
        c.onChainId,
        c.title,
        c.slug,
        c.summary,
        c.storyMarkdown,
        c.category,
        c.bannerUrl,
        c.targetEth,
        c.raisedEth,
        new Date(c.deadline),
        c.creatorWallet,
        c.creatorName,
        c.creatorAvatar,
        c.status,
        c.fundingType,
        c.milestoneCount,
        c.backersCount,
        c.featured,
        new Date(c.createdAt),
        new Date(),
      ]
    );
  }

  for (const m of INITIAL_MILESTONES) {
    await sql.query(
      `INSERT INTO milestones (
        id, campaign_id, index, title, description, percentage, target_date, status,
        voting_deadline, votes_for_eth, votes_against_eth, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status;`,
      [
        m.id,
        m.campaignId,
        m.index,
        m.title,
        m.description,
        m.percentage,
        m.targetDate || "Planned",
        m.status,
        m.votingDeadline ? new Date(m.votingDeadline) : null,
        m.votesForEth,
        m.votesAgainstEth,
        new Date(),
      ]
    );
  }

  for (const ct of INITIAL_CONTRIBUTIONS) {
    await sql.query(
      `INSERT INTO contributions (
        id, campaign_id, backer_wallet, backer_name, amount_eth, tx_hash, tier_name, message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING;`,
      [
        ct.id,
        ct.campaignId,
        ct.backerWallet,
        ct.backerName,
        ct.amountEth,
        ct.txHash,
        ct.tierName || null,
        ct.message || null,
        new Date(ct.createdAt),
      ]
    );
  }

  for (const u of INITIAL_UPDATES) {
    await sql.query(
      `INSERT INTO campaign_updates (
        id, campaign_id, title, content, author_wallet, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING;`,
      [u.id, u.campaignId, u.title, u.content, u.authorWallet, new Date(u.createdAt)]
    );
  }

  for (const cm of INITIAL_COMMENTS) {
    await sql.query(
      `INSERT INTO comments (
        id, campaign_id, author_wallet, author_name, content, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING;`,
      [cm.id, cm.campaignId, cm.authorWallet, cm.authorName, cm.content, new Date(cm.createdAt)]
    );
  }

  console.log("Success! Nature, plant growing, and planet-saving campaigns are now live in Neon DB.");
}

seed().catch(console.error);
