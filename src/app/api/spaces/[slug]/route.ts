import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { serializeFile, serializeFolder, serializeUser } from "@/types/models";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { spaces, folders, files, users } = await getCollections();
    const space = await spaces.findOne({ slug });
    if (!space) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userId = new ObjectId(session.user.id);
    if (!space.userIds.some((id) => id.equals(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [spaceFolders, spaceFiles, spaceUsers] = await Promise.all([
        folders.find({ spaceId: space._id }).sort({ name: 1 }).toArray(),
        files.find({ spaceId: space._id }).sort({ createdAt: -1 }).toArray(),
        users.find({ _id: { $in: space.userIds } }, { projection: { _id: 1, name: 1, email: 1, image: 1 } }).toArray(),
    ]);

    const folderFileCounts = await files.aggregate<{ _id: ObjectId; count: number }>([
        { $match: { spaceId: space._id, folderId: { $ne: null } } },
        { $group: { _id: "$folderId", count: { $sum: 1 } } },
    ]).toArray();
    const countMap = new Map(folderFileCounts.map((x) => [x._id.toString(), x.count]));
    const ownerMap = new Map(spaceUsers.map((u) => [u._id.toString(), { id: u._id.toString(), name: u.name ?? null, image: u.image ?? null }]));

    return NextResponse.json({
        id: space._id.toString(),
        name: space.name,
        slug: space.slug,
        userIds: space.userIds.map((id) => id.toString()),
        folders: spaceFolders.map((f) => serializeFolder(f, countMap.get(f._id.toString()) ?? 0)),
        files: spaceFiles.map((f) => serializeFile(f, ownerMap.get(f.ownerId.toString()))),
        users: spaceUsers.map(serializeUser),
    });
}
