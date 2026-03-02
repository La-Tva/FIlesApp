import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { ObjectId } from "mongodb";

// /dashboard → redirect to first space, or show empty state
export default async function DashboardIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { spaces } = await getCollections();
  const userId = new ObjectId(session.user.id);
  const firstSpace = await spaces.findOne({ userIds: userId }, { sort: { createdAt: 1 } });

  if (firstSpace) {
    redirect(`/dashboard/${firstSpace.slug}`);
  }

  // No space yet — redirect to home to create one
  redirect("/");
}
