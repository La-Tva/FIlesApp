import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { triggerSpaceEvent } from "@/lib/pusher-server";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { spaces, users } = await getCollections();
    const space = await spaces.findOne({ slug });
    if (!space) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userId = new ObjectId(session.user.id);
    if (space.userIds.some((id) => id.equals(userId))) {
        return NextResponse.json({ id: space._id.toString(), name: space.name, slug: space.slug });
    }

    await Promise.all([
        spaces.updateOne({ _id: space._id }, { $push: { userIds: userId } }),
        users.updateOne({ _id: userId }, { $push: { spaceIds: space._id } }),
    ]);

    const user = await users.findOne({ _id: userId }, { projection: { name: 1, email: 1, image: 1 } });
    await triggerSpaceEvent(space._id.toString(), "member:added", {
        userId: session.user.id,
        name: user?.name,
        email: user?.email,
        image: user?.image,
    });

    return NextResponse.json({ id: space._id.toString(), name: space.name, slug: space.slug });
}
