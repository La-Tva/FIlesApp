import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LogoutButton } from "@/components/LogoutButton";
import { getDashboardStats } from "@/lib/services";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user?.id as string;
  const stats = await getDashboardStats(userId) as any;
  
  // Storage in GB
  const storageUsedGB = (stats.storageUsed || 0) / (1024 * 1024 * 1024);
  
  return (
    <DashboardLayout userId={userId}>
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-violet-500/20">
            {session.user?.name?.[0].toUpperCase() || "S"}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-outfit">{session.user?.name || "Utilisateur SwiftDrop"}</h1>
            <p className="text-slate-500">{session.user?.email}</p>
          </div>
        </header>

        <ProfileClient items={[
            { id: "personal", label: "Informations Personnelles", description: `${session.user?.name || 'Utilisateur'} • ${session.user?.email}`, iconName: "user" },
            { id: "security", label: "Sécurité & Mot de Passe", description: "Authentification à deux facteurs active", iconName: "shield" },
            { id: "storage", label: "Stockage Appareils", description: `${storageUsedGB.toFixed(2)} GB utilisés sur 2 TB`, iconName: "smartphone" },
            { id: "subscription", label: "Abonnement SwiftDrop", description: "Version Premium • Cloud 2 TB", iconName: "harddrive" },
        ]} />

        <LogoutButton />
      </div>
    </DashboardLayout>
  );
}
