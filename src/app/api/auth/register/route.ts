import { NextResponse } from "next/server";
import { getCollections } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const { users } = await getCollections();

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await users.insertOne({
            name,
            email,
            passwordHash,
            spaceIds: [],
            createdAt: new Date(),
        });

        const userId = result.insertedId;

        // Create initial personal space
        const spaces = (await getCollections()).spaces;
        const spaceResult = await spaces.insertOne({
            name: "Mon Espace",
            ownerId: userId,
            sharedWith: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Link space to user
        await users.updateOne(
            { _id: userId },
            { $push: { spaceIds: spaceResult.insertedId } as any }
        );

        return NextResponse.json({
            success: true,
            userId: userId
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
