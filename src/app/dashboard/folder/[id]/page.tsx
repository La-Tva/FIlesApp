import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardClient } from "@/components/DashboardClient";
import { serializeSpace, serializeFolder, serializeFile, serializeUser } from "@/types/models";

export default async function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { id } = await params;
  const { folders, files, spaces, users } = await getCollections();
  
  const currentFolderId = new ObjectId(id);
  const folder = await folders.findOne({ _id: currentFolderId });
  if (!folder) redirect("/dashboard");

  const userId = new ObjectId(session.user.id);
  const userSpaces = await spaces.find({ userIds: userId }).toArray();
  const activeSpace = userSpaces.find(s => s._id.equals(folder.spaceId));

  if (!activeSpace) redirect("/dashboard");

  // Fetch items in this folder
  const subFolders = await folders.find({ parentId: currentFolderId }).toArray();
  const folderFiles = await files.find({ folderId: currentFolderId }).toArray();

  // For real-time updates, we need the owners of the files
  const ownerIds = Array.from(new Set(folderFiles.map(f => f.ownerId)));
  const fileOwners = await users.find({ _id: { $in: ownerIds } }).toArray();

  return (
    <DashboardLayout 
      user={serializeUser((await users.findOne({ _id: userId }))!)}
      spaces={userSpaces.map(serializeSpace)}
      activeSpaceId={activeSpace._id.toString()}
    >
      <DashboardClient 
        space={serializeSpace(activeSpace)}
        currentFolder={serializeFolder(folder)}
        initialFolders={subFolders.map(f => serializeFolder(f))}
        initialFiles={folderFiles.map(f => {
          const owner = fileOwners.find(u => u._id.equals(f.ownerId));
          return serializeFile(f, owner ? { id: owner._id.toString(), name: owner.name ?? null, image: owner.image ?? null } : undefined);
        })}
      />
    </DashboardLayout>
  );
}
