import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { triggerSpaceEvent } from "@/lib/pusher-server";
import { serializeFile } from "@/types/models";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, size, type, key, spaceId, folderId } = await req.json();

    const { files, users } = await getCollections();
    const userId = new ObjectId(session.user.id);
    const spaceObjId = new ObjectId(spaceId);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24h for ephemeral

    const fileDoc = {
        _id: new ObjectId(),
        name,
        size,
        type,
        key,
        url: "", // For R2, URL is often constructed or signed on the fly
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

    return NextResponse.json(serialized);
}
