import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { triggerSpaceEvent } from "@/lib/pusher-server";
import { serializeFolder } from "@/types/models";

type RouteContext = { params: Promise<{ slug: string; id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug, id } = await params;
    const { spaces, folders } = await getCollections();
    const space = await spaces.findOne({ slug });
    const userId = new ObjectId(session.user!.id!);
    if (!space || !space.userIds.some((uid) => uid.equals(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name } = await req.json();
    const folderId = new ObjectId(id);
    await folders.updateOne({ _id: folderId }, { $set: { name: name.trim() } });
    const folder = await folders.findOne({ _id: folderId });
    if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const serialized = serializeFolder(folder);
    await triggerSpaceEvent(space._id.toString(), "folder:renamed", serialized);
    return NextResponse.json(serialized);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug, id } = await params;
    const { spaces, folders, files } = await getCollections();
    const space = await spaces.findOne({ slug });
    const userId = new ObjectId(session.user!.id!);
    if (!space || !space.userIds.some((uid) => uid.equals(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const folderId = new ObjectId(id);
    await Promise.all([files.deleteMany({ folderId }), folders.deleteOne({ _id: folderId })]);
    await triggerSpaceEvent(space._id.toString(), "folder:deleted", { id });
    return NextResponse.json({ success: true });
}
