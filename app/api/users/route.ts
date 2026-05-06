import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      uid?: string;
      name?: string;
      email?: string;
      photoUrl?: string | null;
    };

    if (!body.uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection("users").updateOne(
      { uid: body.uid },
      {
        $set: {
          uid: body.uid,
          name: body.name || "BlueNest User",
          email: body.email || "",
          photoUrl: body.photoUrl ?? null,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          phone: null,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upsert user", detail: String(error) },
      { status: 500 },
    );
  }
}
