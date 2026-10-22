import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const list = await repository.getCampaigns({ category, status, search });
    return NextResponse.json({ success: true, campaigns: list });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      summary,
      storyMarkdown,
      category,
      bannerUrl,
      targetEth,
      durationDays,
      fundingType,
      creatorWallet,
      creatorName,
      onChainId,
      milestones,
    } = body;

    if (!title || !targetEth || !creatorWallet) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const duration = parseInt(durationDays || "30", 10);
    const deadline = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Math.floor(Math.random() * 1000)}`;

    const campaign = await repository.createCampaign({
      title,
      slug,
      summary: summary || title,
      storyMarkdown: storyMarkdown || "No story provided yet.",
      category: category || "Tech",
      bannerUrl:
        bannerUrl ||
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      targetEth: String(targetEth),
      deadline,
      creatorWallet,
      creatorName: creatorName || "Creator",
      creatorAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${creatorWallet}`,
      fundingType: fundingType || "ALL_OR_NOTHING",
      milestoneCount: milestones ? milestones.length : 0,
      featured: false,
      onChainId: onChainId ? Number(onChainId) : null,
      milestones,
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
