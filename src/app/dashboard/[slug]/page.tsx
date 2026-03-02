import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { DashboardClient } from "@/components/DashboardClient";
import { Sidebar } from "@/components/Sidebar";
import { revalidatePath } from "next/cache";
import { serializeFile, serializeFolder, serializeSpace, serializeUser } from "@/types/models";

interface PageProps {
  params: { slug: string };
}

export default async function DashboardPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { spaces, folders, files, users } = await getCollections();
  const userId = new ObjectId(session.user.id);

  const space = await spaces.findOne({ slug: params.slug });
  if (!space) redirect("/");
  if (!space.userIds.some((id) => id.equals(userId))) redirect("/");

  const [spaceFolders, spaceFiles, spaceUsers, userSpaces] = await Promise.all([
    folders.find({ spaceId: space._id }).sort({ name: 1 }).toArray(),
    files.find({ spaceId: space._id }).sort({ createdAt: -1 }).toArray(),
    users.find({ _id: { $in: space.userIds } }, { projection: { _id: 1, name: 1, email: 1, image: 1 } }).toArray(),
    spaces.find({ userIds: userId }).sort({ createdAt: -1 }).toArray(),
  ]);

  // File count per folder
  const counts = await files.aggregate<{ _id: ObjectId; count: number }>([
    { $match: { spaceId: space._id, folderId: { $ne: null } } },
    { $group: { _id: "$folderId", count: { $sum: 1 } } },
  ]).toArray();
  const countMap = new Map(counts.map((x) => [x._id.toString(), x.count]));

  // Owner map for file cards
  const ownerMap = new Map(spaceUsers.map((u) => [u._id.toString(), { id: u._id.toString(), name: u.name ?? null, image: u.image ?? null }]));

  async function createSpace(name: string) {
    "use server";
    const sess = await auth();
    if (!sess?.user?.id) return;
    await fetch(`${process.env.NEXTAUTH_URL}/api/spaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    revalidatePath("/dashboard/[slug]", "layout");
  }

  async function joinSpace(slug: string) {
    "use server";
    const sess = await auth();
    if (!sess?.user?.id) return;
    await fetch(`${process.env.NEXTAUTH_URL}/api/spaces/${slug}/join`, { method: "POST" });
    revalidatePath("/dashboard/[slug]", "layout");
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        spaces={userSpaces.map(serializeSpace)}
        user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
        onCreateSpace={createSpace}
        onJoinSpace={joinSpace}
      />
      <main className="flex-1 overflow-hidden">
        <DashboardClient
          space={{
            id: space._id.toString(),
            name: space.name,
            slug: space.slug,
            files: spaceFiles.map((f) => serializeFile(f, ownerMap.get(f.ownerId.toString()))),
            folders: spaceFolders.map((f) => serializeFolder(f, countMap.get(f._id.toString()) ?? 0)),
            users: spaceUsers.map(serializeUser),
          }}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  );
}
