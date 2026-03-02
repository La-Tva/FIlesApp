import { ObjectId } from "mongodb";

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface User {
    _id: ObjectId;
    name?: string | null;
    email: string;
    emailVerified?: Date | null;
    image?: string | null;
    spaceIds: ObjectId[];
    createdAt: Date;
}

export interface Account {
    _id: ObjectId;
    userId: ObjectId;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
}

export interface SessionDoc {
    _id: ObjectId;
    sessionToken: string;
    userId: ObjectId;
    expires: Date;
}

export interface VerificationToken {
    _id: ObjectId;
    identifier: string;
    token: string;
    expires: Date;
}

export interface Space {
    _id: ObjectId;
    name: string;
    slug: string;
    userIds: ObjectId[];
    createdAt: Date;
}

export interface Folder {
    _id: ObjectId;
    name: string;
    spaceId: ObjectId;
    parentId: ObjectId | null;
    createdAt: Date;
}

export interface FileDoc {
    _id: ObjectId;
    name: string;
    size: number;
    type: string;
    url: string;
    key: string;
    isEphemeral: boolean;
    expiresAt: Date | null;
    ownerId: ObjectId;
    spaceId: ObjectId;
    folderId: ObjectId | null;
    createdAt: Date;
}

// ─── Serialized (plain JSON) types used on the client ─────────────────────────

export type SpaceJSON = {
    id: string;
    name: string;
    slug: string;
    userIds: string[];
    createdAt: string;
};

export type FolderJSON = {
    id: string;
    name: string;
    spaceId: string;
    parentId: string | null;
    createdAt: string;
    fileCount?: number;
};

export type FileJSON = {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    key: string;
    isEphemeral: boolean;
    expiresAt: string | null;
    ownerId: string;
    spaceId: string;
    folderId: string | null;
    createdAt: string;
    owner?: { id: string; name: string | null; image: string | null };
};

export type UserJSON = {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function serializeFile(f: FileDoc, owner?: { id: string; name: string | null; image: string | null }): FileJSON {
    return {
        id: f._id.toString(),
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url,
        key: f.key,
        isEphemeral: f.isEphemeral,
        expiresAt: f.expiresAt?.toISOString() ?? null,
        ownerId: f.ownerId.toString(),
        spaceId: f.spaceId.toString(),
        folderId: f.folderId?.toString() ?? null,
        createdAt: f.createdAt.toISOString(),
        owner,
    };
}

export function serializeFolder(f: Folder, fileCount?: number): FolderJSON {
    return {
        id: f._id.toString(),
        name: f.name,
        spaceId: f.spaceId.toString(),
        parentId: f.parentId?.toString() ?? null,
        createdAt: f.createdAt.toISOString(),
        fileCount,
    };
}

export function serializeSpace(s: Space): SpaceJSON {
    return {
        id: s._id.toString(),
        name: s.name,
        slug: s.slug,
        userIds: s.userIds.map((id) => id.toString()),
        createdAt: s.createdAt.toISOString(),
    };
}

export function serializeUser(u: User): UserJSON {
    return {
        id: u._id.toString(),
        name: u.name ?? null,
        email: u.email,
        image: u.image ?? null,
    };
}
