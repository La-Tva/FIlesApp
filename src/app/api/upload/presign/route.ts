import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/r2";
import { nanoid } from "nanoid";

// POST /api/upload/presign
// Returns a presigned PUT URL for the browser to upload directly to R2
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType, spaceId } = await req.json();

    if (!filename || !contentType || !spaceId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Create a unique key: space/userId/uuid-filename
    const ext = filename.split(".").pop();
    const key = `${spaceId}/${session.user.id}/${nanoid()}.${ext}`;

    const presignedUrl = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ presignedUrl, key });
}
