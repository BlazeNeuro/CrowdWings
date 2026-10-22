import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { backerWallet, backerName, amountEth, txHash, tierName, message } = body;

    if (!backerWallet || !amountEth || !txHash) {
      return NextResponse.json(
        { success: false, error: "Missing contribution details" },
        { status: 400 }
      );
    }

    const contribution = await repository.addContribution({
      campaignId: id,
      backerWallet,
      backerName,
      amountEth,
      txHash,
      tierName,
      message,
    });

    return NextResponse.json({ success: true, contribution }, { status: 201 });
  } catch (error) {
    console.error("Error logging contribution:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log contribution" },
      { status: 500 }
    );
  }
}
