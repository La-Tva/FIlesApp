"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Image as ImageIcon, Video, File,
  Download, Trash2, Clock, MoreVertical, Pencil, FolderInput,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { FileJSON } from "@/types/models";

interface FileCardProps {
  file: FileJSON;
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onPreview: (file: FileJSON) => void;
}

interface UploadingCardProps {
  name: string;
  progress: number;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="w-8 h-8 text-violet-400" />;
  if (type.startsWith("video/")) return <Video className="w-8 h-8 text-blue-400" />;
  if (type === "application/pdf") return <FileText className="w-8 h-8 text-red-400" />;
  return <File className="w-8 h-8 text-slate-400" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ExpiryBadge({ expiresAt }: { expiresAt: string | null }) {
  const [remaining, setRemaining] = useState<string>("");
  const [urgent, setUrgent] = useState(false);
  const [critical, setCritical] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setUrgent(diff < 7200000);  // < 2h
      setCritical(diff < 1800000); // < 30m
      setRemaining(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [expiresAt]);

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${critical ? "text-red-400" : urgent ? "text-orange-400" : "text-slate-400"}`}>
      <Clock className="w-3 h-3" />
      {remaining}
    </span>
  );
}

export function FileCard({ file, onDelete, onRename, onPreview }: FileCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const isImage = file.type.startsWith("image/");

  const handleRename = async () => {
    if (newName.trim() && newName !== file.name) {
      await onRename(file.id, newName.trim());
    }
    setRenaming(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => {
        (e as unknown as DragEvent).dataTransfer?.setData("fileId", file.id);
      }}
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-grab active:cursor-grabbing"
    >
      {/* Preview thumbnail */}
      <div
        className="w-full h-28 rounded-xl mb-3 flex items-center justify-center overflow-hidden bg-white/5 cursor-pointer"
        onClick={() => onPreview(file)}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          getFileIcon(file.type)
        )}
      </div>

      {/* Name */}
      {renaming ? (
        <input
          autoFocus
          className="w-full bg-transparent text-sm text-white border-b border-violet-400 outline-none pb-1 mb-1"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
        />
      ) : (
        <p className="text-sm font-medium text-white truncate mb-1">{file.name}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{formatBytes(file.size)}</span>
        <ExpiryBadge expiresAt={file.expiresAt} />
      </div>

      {/* Actions menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <MoreVertical className="w-3.5 h-3.5 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
            <DropdownMenuItem onClick={() => onPreview(file)} className="text-slate-200 hover:text-white">
              <FileText className="w-4 h-4 mr-2" /> Preview
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={file.url} download={file.name} className="flex items-center text-slate-200 hover:text-white">
                <Download className="w-4 h-4 mr-2" /> Download
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRenaming(true)} className="text-slate-200 hover:text-white">
              <Pencil className="w-4 h-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export function UploadingCard({ name, progress }: UploadingCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-sm border border-violet-400/30 rounded-2xl p-4"
    >
      <div className="w-full h-28 rounded-xl mb-3 flex items-center justify-center bg-violet-500/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full"
        />
      </div>
      <p className="text-sm font-medium text-white/80 truncate mb-2">{name}</p>
      <Progress value={progress} className="h-1" />
      <p className="text-xs text-violet-400 mt-1 text-right">{progress}%</p>
    </motion.div>
  );
}
