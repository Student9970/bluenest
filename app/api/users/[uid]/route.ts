import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params;
    const db = await getDatabase();
    const user = await db
      .collection("users")
      .findOne({ uid }, { projection: { phone: 1 } });

    return NextResponse.json({ phone: user?.phone || null });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load user", detail: String(error) },
      { status: 500 },
    );
  }
}
