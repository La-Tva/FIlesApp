"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, Zap, LogOut, Hash, Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Space {
  id: string;
  name: string;
  slug: string;
  _count?: { files: number };
}

interface SidebarProps {
  spaces: Space[];
  user: { name?: string | null; email?: string | null; image?: string | null };
  onCreateSpace: (name: string) => Promise<void>;
  onJoinSpace: (slug: string) => Promise<void>;
}

export function Sidebar({ spaces, user, onCreateSpace, onJoinSpace }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceSlug, setSpaceSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!spaceName.trim()) return;
    setLoading(true);
    await onCreateSpace(spaceName.trim());
    setSpaceName("");
    setCreateOpen(false);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!spaceSlug.trim()) return;
    setLoading(true);
    await onJoinSpace(spaceSlug.trim());
    setSpaceSlug("");
    setJoinOpen(false);
    setLoading(false);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-white/5 backdrop-blur-xl border-r border-white/10 shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">SwiftDrop</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Spaces list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2"
            >
              Spaces
            </motion.p>
          )}
        </AnimatePresence>

        {spaces.map((space) => {
          const isActive = pathname === `/dashboard/${space.slug}`;
          return (
            <Link key={space.id} href={`/dashboard/${space.slug}`}>
              <div
                className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-150 group
                  ${isActive ? "bg-violet-500/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold uppercase
                  ${isActive ? "bg-violet-500" : "bg-white/10"}`}>
                  {space.name.charAt(0)}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium truncate flex-1"
                    >
                      {space.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {!collapsed && (
          <>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                  <Plus className="w-4 h-4" /> New Space
                </button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Create a new space</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Space name"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button onClick={handleCreate} disabled={loading} className="bg-violet-600 hover:bg-violet-500 w-full">
                  {loading ? "Creating…" : "Create Space"}
                </Button>
              </DialogContent>
            </Dialog>

            <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                  <Hash className="w-4 h-4" /> Join Space
                </button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Join a space</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Space slug (e.g. my-space-abc123)"
                  value={spaceSlug}
                  onChange={(e) => setSpaceSlug(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button onClick={handleJoin} disabled={loading} className="bg-violet-600 hover:bg-violet-500 w-full">
                  {loading ? "Joining…" : "Join Space"}
                </Button>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* User avatar */}
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-violet-600 text-white text-xs">
              {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user.name ?? "User"}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
