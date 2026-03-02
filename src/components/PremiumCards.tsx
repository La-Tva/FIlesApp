"use client";

import { useState } from "react";
import { 
  Folder, 
  File, 
  Clock, 
  MoreVertical, 
  Download, 
  Trash2, 
  Edit2, 
  Eye,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FileJSON, FolderJSON } from "@/types/models";
import { toast } from "sonner";

interface FileCardProps {
  file: FileJSON;
  onDelete?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onPreview?: (file: FileJSON) => void;
}

export function FileCard({ file, onDelete, onRename, onPreview }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass glass-hover group relative rounded-2xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
          <File className="w-6 h-6" />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 glass rounded-xl py-2 z-20 overflow-hidden"
                >
                  <button className="w-full px-4 py-2 flex items-center gap-2 text-sm text-slate-300 hover:bg-white/10 transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    onClick={() => { onPreview?.(file); setShowMenu(false); }}
                    className="w-full px-4 py-2 flex items-center gap-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                  <button className="w-full px-4 py-2 flex items-center gap-2 text-sm text-slate-300 hover:bg-white/10 transition-colors">
                    <Edit2 className="w-4 h-4" /> Rename
                  </button>
                  <div className="h-px bg-white/10 my-1 mx-2" />
                  <button 
                    onClick={() => { onDelete?.(file.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 flex items-center gap-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white truncate pr-4">{file.name}</h3>
        <p className="text-xs text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <Clock className="w-3 h-3 text-violet-400" />
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          Expires {formatDistanceToNow(new Date(file.expiresAt!))}
        </p>
      </div>
    </motion.div>
  );
}

interface FolderCardProps {
  folder: FolderJSON;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function FolderCard({ folder, onClick, onDelete }: FolderCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick?.(folder.id)}
      className="glass glass-hover group cursor-pointer rounded-2xl p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
        <Folder className="w-6 h-6 fill-violet-400/20" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white truncate">{folder.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{folder.fileCount ?? 0} items</p>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </motion.div>
  );
}

export function NewItemButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full aspect-square border-2 border-dashed border-white/5 hover:border-violet-500/40 hover:bg-violet-500/5 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-violet-500/20 flex items-center justify-center text-slate-500 group-hover:text-violet-400 transition-all">
        <Plus className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-slate-500 group-hover:text-slate-300 transition-all">New Folder</span>
    </button>
  );
}
