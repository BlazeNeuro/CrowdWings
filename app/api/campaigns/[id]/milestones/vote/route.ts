import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { milestoneIndex, approve, voterWallet, weightEth } = body;

    if (milestoneIndex === undefined || approve === undefined || !voterWallet) {
      return NextResponse.json(
        { success: false, error: "Missing voting parameters" },
        { status: 400 }
      );
    }

    const milestone = await repository.voteMilestone({
      campaignId: id,
      milestoneIndex: Number(milestoneIndex),
      approve: Boolean(approve),
      voterWallet,
      weightEth: weightEth || "1.0",
    });

    return NextResponse.json({ success: true, milestone });
  } catch (error) {
    console.error("Error logging milestone vote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record milestone vote" },
      { status: 500 }
    );
  }
}
