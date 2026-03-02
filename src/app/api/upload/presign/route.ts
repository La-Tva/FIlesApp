import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/r2";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { filename, contentType, spaceId } = await req.json();
    if (!filename || !contentType || !spaceId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Large file strategy: Upload directly to S3/R2 with a presigned URL
    const ext = filename.split(".").pop();
    const key = `${spaceId}/${session.user.id}/${nanoid()}.${ext}`;

    const uploadUrl = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
}
