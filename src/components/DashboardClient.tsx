"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Upload, 
  ChevronRight, 
  Home, 
  Grid, 
  List, 
  LayoutGrid,
  Search,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpaceJSON, FolderJSON, FileJSON } from "@/types/models";
import { FileCard, FolderCard, NewItemButton } from "./PremiumCards";
import { useFileUpload } from "@/hooks/useFileUpload";
import { usePusher } from "@/hooks/usePusher";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DashboardClientProps {
  space: SpaceJSON;
  currentFolder: FolderJSON | null;
  initialFolders: FolderJSON[];
  initialFiles: FileJSON[];
}

export function DashboardClient({ space, currentFolder, initialFolders, initialFiles }: DashboardClientProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderJSON[]>(initialFolders);
  const [files, setFiles] = useState<FileJSON[]>(initialFiles);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const { uploadFiles, uploadingFiles } = useFileUpload({ 
    spaceId: space.id, 
    folderId: currentFolder?.id 
  });

  usePusher({
    spaceId: space.id,
    onFileUploaded: (file: FileJSON) => {
      if (file.folderId === currentFolder?.id) {
        setFiles(prev => [file, ...prev]);
      }
    },
    onFileDeleted: (id: string) => setFiles(prev => prev.filter(f => f.id !== id)),
    onFolderCreated: (folder: FolderJSON) => {
      if (folder.parentId === currentFolder?.id) {
        setFolders(prev => [...prev, folder]);
      }
    },
    onFolderDeleted: (id: string) => setFolders(prev => prev.filter(f => f.id !== id)),
  });

  const createFolder = async () => {
    const name = prompt("Folder Name:");
    if (!name) return;

    try {
      const res = await fetch(`/api/spaces/${space.slug}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: currentFolder?.id }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      toast.success("Folder created");
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const deleteFile = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete file");
      toast.success("File deleted");
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col gap-8">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {currentFolder && (
            <button 
              onClick={() => router.back()}
              className="p-2 glass glass-hover rounded-xl text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-sm font-medium">
            <button onClick={() => router.push(`/dashboard/${space.slug}`)} className="text-slate-400 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-white max-w-[200px] truncate">
              {currentFolder ? currentFolder.name : "All Files"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search in this folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass glass-hover pl-10 pr-4 py-2 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
            />
          </div>

          <div className="flex glass rounded-xl overflow-hidden p-1">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Drop Zone Overlay */}
        <div 
          className="relative min-h-[400px]"
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedFiles = Array.from(e.dataTransfer.files);
            uploadFiles(droppedFiles);
          }}
        >
          {/* Folders Section */}
          {filteredFolders.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Folders</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredFolders.map(folder => (
                    <FolderCard 
                      key={folder.id} 
                      folder={folder} 
                      onClick={(id) => router.push(`/dashboard/folder/${id}`)}
                    />
                  ))}
                  <NewItemButton onClick={createFolder} />
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Files Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Files</h2>
              <label className="glass glass-hover px-4 py-2 rounded-xl text-xs font-semibold text-violet-400 cursor-pointer flex items-center gap-2">
                <Upload className="w-3 h-3" />
                Upload File
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))} 
                />
              </label>
            </div>

            {filteredFiles.length === 0 && filteredFolders.length === 0 && !uploadingFiles.length ? (
              <div className="h-64 glass rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-4 border-dashed">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm">Drag and drop files here to upload</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {/* Uploading Progress Cards */}
                  {uploadingFiles.map(file => (
                    <motion.div
                      key={file.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass rounded-2xl p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 animate-pulse">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-violet-400">{file.progress}%</span>
                      </div>
                      <h3 className="text-sm font-medium text-white truncate">{file.name}</h3>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-violet-500" 
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {filteredFiles.map(file => (
                    <FileCard 
                      key={file.id} 
                      file={file} 
                      onDelete={deleteFile}
                    />
                  ))}
                  
                  {filteredFolders.length === 0 && <NewItemButton onClick={createFolder} />}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
