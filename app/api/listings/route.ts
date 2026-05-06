import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Listing, ListingType } from "@/lib/types";

type ListingDoc = {
  _id: ObjectId;
  userId: string;
  title: string;
  area: string;
  price: number;
  type: ListingType;
  description: string;
  imageUrl: string;
  ownerPhone: string;
  createdAt: Date;
  updatedAt: Date;
};

function mapListing(doc: ListingDoc, uid?: string): Listing {
  return {
    id: doc._id.toString(),
    title: doc.title,
    area: doc.area,
    price: doc.price,
    type: doc.type,
    description: doc.description,
    imageUrl: doc.imageUrl,
    ownerPhone: doc.ownerPhone,
    isOwn: uid ? doc.userId === uid : false,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid") ?? undefined;

    const db = await getDatabase();
    const docs = (await db
      .collection<ListingDoc>("listings")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as ListingDoc[];

    return NextResponse.json({
      listings: docs.map((doc) => mapListing(doc, uid)),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load listings", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      title?: string;
      area?: string;
      price?: number;
      type?: ListingType;
      description?: string;
      imageUrl?: string;
      ownerPhone?: string;
    };

    if (
      !body.userId ||
      !body.title ||
      !body.area ||
      !body.price ||
      !body.type ||
      !body.description ||
      !body.imageUrl ||
      !body.ownerPhone
    ) {
      return NextResponse.json(
        { error: "Missing required listing fields" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const existing = await db.collection("listings").findOne({ userId: body.userId });
    if (existing) {
      return NextResponse.json(
        { error: "Only one active listing allowed per user" },
        { status: 409 },
      );
    }

    const now = new Date();
    const inserted = await db.collection("listings").insertOne({
      userId: body.userId,
      title: body.title.trim(),
      area: body.area,
      price: body.price,
      type: body.type,
      description: body.description.trim(),
      imageUrl: body.imageUrl,
      ownerPhone: body.ownerPhone,
      createdAt: now,
      updatedAt: now,
    });

    const created = await db
      .collection<ListingDoc>("listings")
      .findOne({ _id: inserted.insertedId });

    return NextResponse.json({
      ok: true,
      listing: created ? mapListing(created, body.userId) : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create listing", detail: String(error) },
      { status: 500 },
    );
  }
}
