import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { userId?: string };
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid listing id" }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection("listings").deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!result.deletedCount) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete listing", detail: String(error) },
      { status: 500 },
    );
  }
}
