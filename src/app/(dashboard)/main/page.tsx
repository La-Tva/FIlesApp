import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getUserSpaces, getRecentFiles, getDashboardStats } from "@/lib/services";
import { 
  Folder, 
  FileText, 
  Clock, 
  Star, 
  Users, 
  Search,
  ChevronRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user?.id as string;
  
  // Fetch dynamic data
  const [userSpaces, recentFiles, stats] = await Promise.all([
    getUserSpaces(userId),
    getRecentFiles(userId, 5),
    getDashboardStats(userId)
  ]);

  return (
    <DashboardLayout 
      userId={userId} 
      userName={session.user?.name || ""} 
      userEmail={session.user?.email || ""}
    >
      <DashboardClient 
        userId={userId} 
        userSpaces={JSON.parse(JSON.stringify(userSpaces))} 
        recentFiles={JSON.parse(JSON.stringify(recentFiles))}
        stats={stats}
        userName={session.user?.name || ""}
      />
    </DashboardLayout>
  );
}
