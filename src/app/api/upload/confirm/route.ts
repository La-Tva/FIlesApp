import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { triggerSpaceEvent } from "@/lib/pusher-server";
import { getPublicUrl } from "@/lib/r2";
import { serializeFile } from "@/types/models";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { key, name, size, type, spaceId, folderId } = await req.json();
    if (!key || !name || !size || !type || !spaceId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { files, spaces, users } = await getCollections();
    const spaceObjId = new ObjectId(spaceId);
    const space = await spaces.findOne({ _id: spaceObjId });
    const userId = new ObjectId(session.user.id);
    if (!space || !space.userIds.some((id) => id.equals(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const fileDoc = {
        _id: new ObjectId(),
        name,
        size,
        type,
        url: getPublicUrl(key),
        key,
        isEphemeral: true,
        expiresAt,
        ownerId: userId,
        spaceId: spaceObjId,
        folderId: folderId ? new ObjectId(folderId) : null,
        createdAt: new Date(),
    };

    await files.insertOne(fileDoc);

    const owner = await users.findOne({ _id: userId }, { projection: { name: 1, image: 1 } });
    const serialized = serializeFile(fileDoc, {
        id: session.user.id,
        name: owner?.name ?? null,
        image: owner?.image ?? null,
    });

    await triggerSpaceEvent(spaceId, "file:uploaded", serialized);
    return NextResponse.json(serialized, { status: 201 });
}
