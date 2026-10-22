import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, authorWallet } = body;

    if (!title || !content || !authorWallet) {
      return NextResponse.json(
        { success: false, error: "Title, content, and author wallet are required" },
        { status: 400 }
      );
    }

    const update = await repository.addUpdate({
      campaignId: id,
      title,
      content,
      authorWallet,
    });

    return NextResponse.json({ success: true, update }, { status: 201 });
  } catch (error) {
    console.error("Error adding update:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add update" },
      { status: 500 }
    );
  }
}
