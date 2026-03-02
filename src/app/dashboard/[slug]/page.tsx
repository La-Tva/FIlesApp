import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardClient } from "@/components/DashboardClient";
import { serializeSpace, serializeFolder, serializeFile, serializeUser } from "@/types/models";

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { slug } = await params;
  const { spaces, folders, files, users } = await getCollections();
  
  const userId = new ObjectId(session.user.id);
  const space = await spaces.findOne({ slug });
  if (!space || !space.userIds.some(id => id.equals(userId))) redirect("/dashboard");

  const userSpaces = await spaces.find({ userIds: userId }).toArray();

  // Root level items (parentId: null)
  const rootFolders = await folders.find({ spaceId: space._id, parentId: null }).toArray();
  const rootFiles = await files.find({ spaceId: space._id, folderId: null }).toArray();

  const ownerIds = Array.from(new Set(rootFiles.map(f => f.ownerId)));
  const fileOwners = await users.find({ _id: { $in: ownerIds } }).toArray();

  return (
    <DashboardLayout 
      user={serializeUser((await users.findOne({ _id: userId }))!)}
      spaces={userSpaces.map(serializeSpace)}
      activeSpaceId={space._id.toString()}
    >
      <DashboardClient 
        space={serializeSpace(space)}
        currentFolder={null}
        initialFolders={rootFolders.map(f => serializeFolder(f))}
        initialFiles={rootFiles.map(f => {
          const owner = fileOwners.find(u => u._id.equals(f.ownerId));
          return serializeFile(f, owner ? { id: owner._id.toString(), name: owner.name ?? null, image: owner.image ?? null } : undefined);
        })}
      />
    </DashboardLayout>
  );
}
