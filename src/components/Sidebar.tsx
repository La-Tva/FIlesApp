"use client";

import { useState } from "react";
import { 
  Plus, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  User as UserIcon,
  Globe,
  Lock,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserJSON, SpaceJSON } from "@/types/models";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface SidebarProps {
  user: UserJSON;
  spaces: SpaceJSON[];
  activeSpaceId?: string;
}

export function Sidebar({ user, spaces, activeSpaceId }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

  const handleCreateSpace = async () => {
    if (!newSpaceName) return;
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSpaceName }),
      });
      if (!res.ok) throw new Error();
      const space = await res.json();
      toast.success("Space created!");
      setShowSpaceModal(false);
      router.push(`/dashboard/${space.slug}`);
    } catch {
      toast.error("Failed to create space");
    }
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-full glass border-r-0 relative z-30 flex flex-col"
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all z-40"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Globe className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-bold text-lg tracking-tight gradient-text">SwiftDrop</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Premium</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 no-scrollbar">
        {/* Main Section */}
        <section className="space-y-1">
          {!isCollapsed && <h4 className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">General</h4>}
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={pathname.includes("/dashboard")} 
            collapsed={isCollapsed}
            onClick={() => router.push("/dashboard")}
          />
          <SidebarItem 
            icon={<Users className="w-5 h-5" />} 
            label="Shared with me" 
            collapsed={isCollapsed}
          />
        </section>

        {/* Spaces Section */}
        <section className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-2">
            {!isCollapsed && <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spaces</h4>}
            <button 
              onClick={() => setShowSpaceModal(true)}
              className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-violet-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {spaces.map(space => (
              <SidebarItem 
                key={space.id}
                icon={space.userIds.length > 1 ? <Users className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                label={space.name}
                active={activeSpaceId === space.id}
                collapsed={isCollapsed}
                onClick={() => router.push(`/dashboard/${space.slug}`)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-white/5">
        <div className={`flex items-center gap-3 p-3 glass rounded-2xl ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            {user.image ? <img src={user.image} className="w-full h-full rounded-xl" /> : <UserIcon className="w-5 h-5" />}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user.name || user.email}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Personal</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSpaceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSpaceModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass rounded-3xl p-8 border-white/10"
            >
              <h2 className="text-2xl font-bold gradient-text mb-6">Create New Space</h2>
              <input 
                autoFocus
                type="text"
                placeholder="Marketing Team, Personal Files..."
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSpace()}
                className="w-full glass bg-white/5 border-white/10 px-4 py-3 rounded-2xl mb-6 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowSpaceModal(false)}
                  className="flex-1 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateSpace}
                  className="flex-1 px-4 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-lg shadow-violet-600/20"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

function SidebarItem({ icon, label, active, collapsed, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative group
        ${active ? 'bg-violet-600/10 text-violet-400 font-semibold' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <div className={`
        flex items-center justify-center transition-all
        ${active ? 'scale-110' : 'group-hover:scale-110'}
      `}>
        {icon}
      </div>
      {!collapsed && (
        <span className="text-sm truncate">{label}</span>
      )}
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-violet-500 rounded-full"
        />
      )}
    </button>
  );
}
