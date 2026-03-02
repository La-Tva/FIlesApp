import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { triggerSpaceEvent } from "@/lib/pusher-server";
import { serializeFolder } from "@/types/models";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { spaces, folders, files } = await getCollections();
    const space = await spaces.findOne({ slug });
    const userId = new ObjectId(session.user!.id!);
    if (!space || !space.userIds.some((id) => id.equals(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const spaceFolders = await folders.find({ spaceId: space._id }).sort({ name: 1 }).toArray();
    const counts = await files.aggregate<{ _id: ObjectId; count: number }>([
        { $match: { spaceId: space._id, folderId: { $ne: null } } },
        { $group: { _id: "$folderId", count: { $sum: 1 } } },
    ]).toArray();
    const countMap = new Map(counts.map((x) => [x._id.toString(), x.count]));

    return NextResponse.json(spaceFolders.map((f) => serializeFolder(f, countMap.get(f._id.toString()) ?? 0)));
}

export async function POST(req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { spaces, folders } = await getCollections();
    const space = await spaces.findOne({ slug });
    const userId = new ObjectId(session.user!.id!);
    if (!space || !space.userIds.some((id) => id.equals(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, parentId } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const folder = {
        _id: new ObjectId(),
        name: name.trim(),
        spaceId: space._id,
        parentId: parentId ? new ObjectId(parentId) : null,
        createdAt: new Date(),
    };
    await folders.insertOne(folder);

    const serialized = serializeFolder(folder, 0);
    await triggerSpaceEvent(space._id.toString(), "folder:created", serialized);
    return NextResponse.json(serialized, { status: 201 });
}
