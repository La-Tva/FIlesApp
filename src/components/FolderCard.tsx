"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Folder, ChevronRight, MoreVertical, Trash2, Pencil } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FolderJSON } from "@/types/models";

interface FolderCardProps {
  folder: FolderJSON;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDrop: (fileId: string, folderId: string) => Promise<void>;
}

export function FolderCard({ folder, isActive, onClick, onDelete, onRename, onDrop }: FolderCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [dragOver, setDragOver] = useState(false);

  const handleRename = async () => {
    if (newName.trim() && newName !== folder.name) await onRename(folder.id, newName.trim());
    setRenaming(false);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const fileId = e.dataTransfer.getData("fileId");
    if (fileId) await onDrop(fileId, folder.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer
        ${dragOver ? "bg-violet-500/20 border-violet-400 scale-105" : isActive ? "bg-violet-500/15 border-violet-400/40" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}`}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Folder className={`w-5 h-5 shrink-0 ${isActive ? "text-violet-400" : "text-slate-400 group-hover:text-violet-400"} transition-colors`} />

      {renaming ? (
        <input
          autoFocus
          className="flex-1 bg-transparent text-sm text-white outline-none border-b border-violet-400"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-sm font-medium text-white truncate">{folder.name}</span>
      )}

      {folder.fileCount !== undefined && (
        <span className="text-xs text-slate-500">{folder.fileCount}</span>
      )}

      <ChevronRight className={`w-4 h-4 text-slate-600 ${isActive ? "text-violet-400" : ""} transition-transform ${isActive ? "rotate-90" : ""}`} />

      <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-md bg-white/10 hover:bg-white/20">
              <MoreVertical className="w-3.5 h-3.5 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
            <DropdownMenuItem onClick={() => setRenaming(true)} className="text-slate-200">
              <Pencil className="w-4 h-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(folder.id)} className="text-red-400">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
