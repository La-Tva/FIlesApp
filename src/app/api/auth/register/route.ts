import { NextRequest, NextResponse } from "next/server";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const { name, email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const { users } = await getCollections();
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
        return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await users.insertOne({
        _id: new ObjectId(),
        name: name?.trim() || null,
        email: email.toLowerCase(),
        passwordHash,
        spaceIds: [],
        createdAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
}
