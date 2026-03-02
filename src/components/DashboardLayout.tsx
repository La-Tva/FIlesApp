"use client";

import { Sidebar } from "./Sidebar";
import { UserJSON, SpaceJSON } from "@/types/models";
import { Toaster } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: UserJSON;
  spaces: SpaceJSON[];
  activeSpaceId?: string;
}

export function DashboardLayout({ children, user, spaces, activeSpaceId }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#020205] text-white overflow-hidden premium-gradient">
      <Sidebar user={user} spaces={spaces} activeSpaceId={activeSpaceId} />
      
      <main className="flex-1 overflow-auto relative p-6 md:p-10">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {children}
        </div>
      </main>

      <Toaster theme="dark" position="bottom-right" richColors />
    </div>
  );
}
