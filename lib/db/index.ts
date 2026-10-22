import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and, ilike } from "drizzle-orm";
import * as schema from "./schema";

export { schema };

export interface RealCampaign {
  id: string;
  onChainId: number | null;
  title: string;
  slug: string;
  summary: string;
  storyMarkdown: string;
  category: string;
  bannerUrl: string;
  targetEth: string;
  raisedEth: string;
  deadline: string;
  creatorWallet: string;
  creatorName: string;
  creatorAvatar: string;
  status: "ACTIVE" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  fundingType: "ALL_OR_NOTHING" | "FLEXIBLE";
  milestoneCount: number;
  backersCount: number;
  featured: boolean;
  createdAt: string;
}

export interface RealMilestone {
  id: string;
  campaignId: string;
  index: number;
  title: string;
  description: string;
  percentage: number;
  targetDate?: string;
  status: "PENDING" | "VOTING" | "APPROVED" | "REJECTED" | "PAID_OUT";
  votingDeadline?: string;
  votesForEth: string;
  votesAgainstEth: string;
}

export interface RealContribution {
  id: string;
  campaignId: string;
  backerWallet: string;
  backerName: string;
  amountEth: string;
  txHash: string;
  tierName?: string;
  message?: string;
  createdAt: string;
}

export interface RealUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  authorWallet: string;
  createdAt: string;
}

export interface RealComment {
  id: string;
  campaignId: string;
  authorWallet: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// Runtime storage for newly created records (Zero dummy data)
class RealDatabaseRepository {
  private runtimeCampaigns: RealCampaign[] = [];
  private runtimeMilestones: RealMilestone[] = [];
  private runtimeContributions: RealContribution[] = [];
  private runtimeUpdates: RealUpdate[] = [];
  private runtimeComments: RealComment[] = [];

  private isDbAvailable(): boolean {
    const url = process.env.DATABASE_URL;
    return !!url && url.trim() !== "" && !url.includes("user:password@endpoint");
  }

  async getCampaigns(filters?: { category?: string; status?: string; search?: string }): Promise<RealCampaign[]> {
    if (this.isDbAvailable() && db) {
      try {
        const conditions = [];
        if (filters?.category && filters.category !== "All") {
          conditions.push(eq(schema.campaigns.category, filters.category));
        }
        if (filters?.status && filters.status !== "All") {
          conditions.push(eq(schema.campaigns.status, filters.status));
        }
        if (filters?.search) {
          conditions.push(ilike(schema.campaigns.title, `%${filters.search}%`));
        }

        const query = db.select().from(schema.campaigns);
        const rows = conditions.length > 0
          ? await query.where(and(...conditions)).orderBy(desc(schema.campaigns.createdAt))
          : await query.orderBy(desc(schema.campaigns.createdAt));

        return rows.map((r) => ({
          id: r.id,
          onChainId: r.onChainId,
          title: r.title,
          slug: r.slug,
          summary: r.summary,
          storyMarkdown: r.storyMarkdown,
          category: r.category,
          bannerUrl: r.bannerUrl,
          targetEth: String(r.targetEth),
          raisedEth: String(r.raisedEth),
          deadline: r.deadline.toISOString(),
          creatorWallet: r.creatorWallet,
          creatorName: r.creatorName || "Creator",
          creatorAvatar: r.creatorAvatar || "",
          status: r.status as RealCampaign["status"],
          fundingType: r.fundingType as RealCampaign["fundingType"],
          milestoneCount: r.milestoneCount,
          backersCount: r.backersCount,
          featured: Boolean(r.featured),
          createdAt: r.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Neon DB query fallback to runtime records:", err);
      }
    }

    // Return real runtime-created campaigns (empty if none created yet)
    let list = [...this.runtimeCampaigns];
    if (filters?.category && filters.category !== "All") {
      list = list.filter((c) => c.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.status && filters.status !== "All") {
      list = list.filter((c) => c.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q));
    }
    return list;
  }

  async getCampaignById(id: string) {
    if (this.isDbAvailable() && db) {
      try {
        const rows = await db
          .select()
          .from(schema.campaigns)
          .where(eq(schema.campaigns.id, id))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          const dbMilestones = await db
            .select()
            .from(schema.milestones)
            .where(eq(schema.milestones.campaignId, id));

          const dbContributions = await db
            .select()
            .from(schema.contributions)
            .where(eq(schema.contributions.campaignId, id))
            .orderBy(desc(schema.contributions.createdAt));

          const dbUpdates = await db
            .select()
            .from(schema.campaignUpdates)
            .where(eq(schema.campaignUpdates.campaignId, id))
            .orderBy(desc(schema.campaignUpdates.createdAt));

          const dbComments = await db
            .select()
            .from(schema.comments)
            .where(eq(schema.comments.campaignId, id))
            .orderBy(desc(schema.comments.createdAt));

          return {
            id: r.id,
            onChainId: r.onChainId,
            title: r.title,
            slug: r.slug,
            summary: r.summary,
            storyMarkdown: r.storyMarkdown,
            category: r.category,
            bannerUrl: r.bannerUrl,
            targetEth: String(r.targetEth),
            raisedEth: String(r.raisedEth),
            deadline: r.deadline.toISOString(),
            creatorWallet: r.creatorWallet,
            creatorName: r.creatorName || "Creator",
            creatorAvatar: r.creatorAvatar || "",
            status: r.status as RealCampaign["status"],
            fundingType: r.fundingType as RealCampaign["fundingType"],
            milestoneCount: r.milestoneCount,
            backersCount: r.backersCount,
            featured: Boolean(r.featured),
            createdAt: r.createdAt.toISOString(),
            milestones: dbMilestones.map((m) => ({
              id: m.id,
              campaignId: m.campaignId,
              index: m.index,
              title: m.title,
              description: m.description,
              percentage: m.percentage,
              targetDate: m.targetDate || undefined,
              status: m.status as RealMilestone["status"],
              votingDeadline: m.votingDeadline ? m.votingDeadline.toISOString() : undefined,
              votesForEth: String(m.votesForEth || "0"),
              votesAgainstEth: String(m.votesAgainstEth || "0"),
            })),
            contributions: dbContributions.map((c) => ({
              id: c.id,
              campaignId: c.campaignId,
              backerWallet: c.backerWallet,
              backerName: c.backerName || "Backer",
              amountEth: String(c.amountEth),
              txHash: c.txHash || "",
              tierName: c.tierName || undefined,
              message: c.message || undefined,
              createdAt: c.createdAt.toISOString(),
            })),
            updates: dbUpdates.map((u) => ({
              id: u.id,
              campaignId: u.campaignId,
              title: u.title,
              content: u.content,
              authorWallet: u.authorWallet,
              createdAt: u.createdAt.toISOString(),
            })),
            comments: dbComments.map((cm) => ({
              id: cm.id,
              campaignId: cm.campaignId,
              authorWallet: cm.authorWallet,
              authorName: cm.authorName || "Anonymous",
              content: cm.content,
              createdAt: cm.createdAt.toISOString(),
            })),
          };
        }
      } catch (err) {
        console.warn("Neon DB getCampaignById query fallback:", err);
      }
    }

    const campaign = this.runtimeCampaigns.find((c) => c.id === id || c.slug === id);
    if (!campaign) return null;

    return {
      ...campaign,
      milestones: this.runtimeMilestones.filter((m) => m.campaignId === campaign.id),
      contributions: this.runtimeContributions.filter((c) => c.campaignId === campaign.id),
      updates: this.runtimeUpdates.filter((u) => u.campaignId === campaign.id),
      comments: this.runtimeComments.filter((cm) => cm.campaignId === campaign.id),
    };
  }

  async createCampaign(newCamp: Omit<RealCampaign, "id" | "createdAt" | "raisedEth" | "backersCount" | "status"> & {
    milestones?: Array<{ title: string; description: string; percentage: number; targetDate?: string }>;
  }): Promise<RealCampaign> {
    const id = `camp-${Date.now()}`;
    const record: RealCampaign = {
      ...newCamp,
      id,
      raisedEth: "0",
      backersCount: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    if (this.isDbAvailable() && db) {
      try {
        await db.insert(schema.campaigns).values({
          id,
          onChainId: newCamp.onChainId,
          title: newCamp.title,
          slug: newCamp.slug,
          summary: newCamp.summary,
          storyMarkdown: newCamp.storyMarkdown,
          category: newCamp.category,
          bannerUrl: newCamp.bannerUrl,
          targetEth: newCamp.targetEth,
          raisedEth: "0",
          deadline: new Date(newCamp.deadline),
          creatorWallet: newCamp.creatorWallet,
          creatorName: newCamp.creatorName,
          creatorAvatar: newCamp.creatorAvatar,
          status: "ACTIVE",
          fundingType: newCamp.fundingType,
          milestoneCount: newCamp.milestones ? newCamp.milestones.length : 0,
          backersCount: 0,
          featured: false,
        });

        if (newCamp.milestones) {
          for (const [idx, m] of newCamp.milestones.entries()) {
            await db.insert(schema.milestones).values({
              id: `ms-${id}-${idx}`,
              campaignId: id,
              index: idx,
              title: m.title,
              description: m.description,
              percentage: m.percentage,
              targetDate: m.targetDate || "Planned",
              status: "PENDING",
            });
          }
        }
      } catch (err) {
        console.warn("Neon DB insert failed; stored in runtime:", err);
      }
    }

    this.runtimeCampaigns.unshift(record);
    if (newCamp.milestones) {
      newCamp.milestones.forEach((m, idx) => {
        this.runtimeMilestones.push({
          id: `ms-${id}-${idx}`,
          campaignId: id,
          index: idx,
          title: m.title,
          description: m.description,
          percentage: m.percentage,
          targetDate: m.targetDate || "Planned",
          status: "PENDING",
          votesForEth: "0",
          votesAgainstEth: "0",
        });
      });
    }

    return record;
  }

  async addContribution(data: {
    campaignId: string;
    backerWallet: string;
    backerName?: string;
    amountEth: string;
    txHash: string;
    tierName?: string;
    message?: string;
  }): Promise<RealContribution> {
    const id = `contrib-${Date.now()}`;
    const contrib: RealContribution = {
      id,
      campaignId: data.campaignId,
      backerWallet: data.backerWallet,
      backerName: data.backerName || "Backer",
      amountEth: data.amountEth,
      txHash: data.txHash,
      tierName: data.tierName,
      message: data.message,
      createdAt: new Date().toISOString(),
    };

    if (this.isDbAvailable() && db) {
      try {
        await db.insert(schema.contributions).values({
          id,
          campaignId: data.campaignId,
          backerWallet: data.backerWallet,
          backerName: data.backerName || "Backer",
          amountEth: data.amountEth,
          txHash: data.txHash,
          tierName: data.tierName,
          message: data.message,
        });
      } catch (err) {
        console.warn("Neon DB contribution insert error:", err);
      }
    }

    this.runtimeContributions.unshift(contrib);
    const campaign = this.runtimeCampaigns.find((c) => c.id === data.campaignId);
    if (campaign) {
      const currentRaised = parseFloat(campaign.raisedEth || "0");
      campaign.raisedEth = (currentRaised + parseFloat(data.amountEth)).toFixed(4);
      campaign.backersCount += 1;
    }
    return contrib;
  }

  async addComment(data: {
    campaignId: string;
    authorWallet: string;
    authorName?: string;
    content: string;
  }): Promise<RealComment> {
    const id = `comment-${Date.now()}`;
    const comment: RealComment = {
      id,
      campaignId: data.campaignId,
      authorWallet: data.authorWallet,
      authorName: data.authorName || "Anonymous",
      content: data.content,
      createdAt: new Date().toISOString(),
    };

    if (this.isDbAvailable() && db) {
      try {
        await db.insert(schema.comments).values({
          id,
          campaignId: data.campaignId,
          authorWallet: data.authorWallet,
          authorName: data.authorName,
          content: data.content,
        });
      } catch (err) {
        console.warn("Neon DB comment insert error:", err);
      }
    }

    this.runtimeComments.unshift(comment);
    return comment;
  }

  async addUpdate(data: {
    campaignId: string;
    title: string;
    content: string;
    authorWallet: string;
  }): Promise<RealUpdate> {
    const id = `upd-${Date.now()}`;
    const update: RealUpdate = {
      id,
      campaignId: data.campaignId,
      title: data.title,
      content: data.content,
      authorWallet: data.authorWallet,
      createdAt: new Date().toISOString(),
    };

    if (this.isDbAvailable() && db) {
      try {
        await db.insert(schema.campaignUpdates).values({
          id,
          campaignId: data.campaignId,
          title: data.title,
          content: data.content,
          authorWallet: data.authorWallet,
        });
      } catch (err) {
        console.warn("Neon DB update insert error:", err);
      }
    }

    this.runtimeUpdates.unshift(update);
    return update;
  }

  async voteMilestone(data: {
    campaignId: string;
    milestoneIndex: number;
    approve: boolean;
    voterWallet: string;
    weightEth: string;
  }): Promise<RealMilestone | null> {
    const milestone = this.runtimeMilestones.find(
      (m) => m.campaignId === data.campaignId && m.index === data.milestoneIndex
    );
    if (!milestone) return null;

    const weight = parseFloat(data.weightEth || "1.0");
    if (data.approve) {
      milestone.votesForEth = (parseFloat(milestone.votesForEth || "0") + weight).toFixed(2);
    } else {
      milestone.votesAgainstEth = (parseFloat(milestone.votesAgainstEth || "0") + weight).toFixed(2);
    }
    return milestone;
  }
}

// Global instance with zero dummy data
export const repository = new RealDatabaseRepository();

function createDbClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.trim() === "" || connectionString.includes("user:password@endpoint")) {
    return null;
  }
  try {
    const sql = neon(connectionString);
    return drizzle(sql, { schema });
  } catch (err) {
    console.warn("Neon connection error:", err);
    return null;
  }
}

export const db = createDbClient();
