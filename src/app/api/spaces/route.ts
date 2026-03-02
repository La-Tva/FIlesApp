import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";
import { serializeSpace } from "@/types/models";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { spaces } = await getCollections();
    const userId = new ObjectId(session.user.id);
    const userSpaces = await spaces.find({ userIds: userId }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(userSpaces.map(serializeSpace));
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const { spaces, users } = await getCollections();
    const userId = new ObjectId(session.user.id);
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;

    const result = await spaces.insertOne({
        _id: new ObjectId(),
        name: name.trim(),
        slug,
        userIds: [userId],
        createdAt: new Date(),
    });

    await users.updateOne({ _id: userId }, { $push: { spaceIds: result.insertedId } });

    const space = await spaces.findOne({ _id: result.insertedId });
    return NextResponse.json(serializeSpace(space!), { status: 201 });
}
