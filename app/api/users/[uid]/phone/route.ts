import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params;
    const body = (await req.json()) as { phone?: string };
    const phone = body.phone?.trim();

    if (!phone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection("users").updateOne(
      { uid },
      {
        $set: {
          phone,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          uid,
          name: "BlueNest User",
          email: "",
          photoUrl: null,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    // Keep owner phone in sync for active listing.
    await db.collection("listings").updateMany(
      { userId: uid },
      { $set: { ownerPhone: phone, updatedAt: new Date() } },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update phone", detail: String(error) },
      { status: 500 },
    );
  }
}
