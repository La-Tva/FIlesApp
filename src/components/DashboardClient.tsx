"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePusher } from "@/hooks/usePusher";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FileCard, UploadingCard } from "@/components/FileCard";
import { FolderCard } from "@/components/FolderCard";
import { UploadZone, UploadButton } from "@/components/UploadZone";
import { QRModal } from "@/components/QRModal";
import { FilePreviewModal } from "@/components/FilePreviewModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, FolderPlus, LayoutGrid, List } from "lucide-react";
import type { FileJSON, FolderJSON, UserJSON } from "@/types/models";

interface DashboardClientProps {
  space: {
    id: string;
    name: string;
    slug: string;
    files: FileJSON[];
    folders: FolderJSON[];
    users: UserJSON[];
  };
  currentUserId: string;
}

export function DashboardClient({ space, currentUserId }: DashboardClientProps) {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileJSON | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const { files, folders, setFiles, setFolders } = usePusher(
    space.id,
    space.files,
    space.folders
  );

  const { uploadingFiles, uploadFiles } = useFileUpload({
    spaceId: space.id,
    folderId: activeFolderId,
  });

  const visibleFiles = files.filter((f) =>
    activeFolderId ? f.folderId === activeFolderId : f.folderId === null
  );
  const activeFolder = folders.find((f) => f.id === activeFolderId);

  const handleDeleteFile = async (id: string) => {
    await fetch(`/api/files/${id}`, { method: "DELETE" });
  };

  const handleRenameFile = async (id: string, name: string) => {
    await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  };

  const handleMoveFile = async (fileId: string, folderId: string) => {
    await fetch(`/api/files/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    toast.success("File moved");
  };

  const handleDeleteFolder = async (id: string) => {
    await fetch(`/api/spaces/${space.slug}/folders/${id}`, { method: "DELETE" });
    if (activeFolderId === id) setActiveFolderId(null);
  };

  const handleRenameFolder = async (id: string, name: string) => {
    await fetch(`/api/spaces/${space.slug}/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch(`/api/spaces/${space.slug}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim(), parentId: activeFolderId }),
    });
    setNewFolderName("");
    setCreatingFolder(false);
  };

  return (
    <UploadZone onFiles={uploadFiles}>
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setActiveFolderId(null)}
              className={`font-medium transition-colors ${activeFolderId ? "text-slate-400 hover:text-white" : "text-white"}`}
            >
              {space.name}
            </button>
            {activeFolder && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-white font-medium">{activeFolder.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Members avatars */}
            <div className="flex items-center -space-x-2 mr-2">
              {space.users.slice(0, 4).map((u) => (
                <Avatar key={u.id} className="w-7 h-7 border-2 border-slate-950">
                  <AvatarImage src={u.image ?? undefined} />
                  <AvatarFallback className="bg-violet-600 text-white text-xs">
                    {(u.name ?? u.email ?? "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>

            <QRModal spaceSlug={space.slug} />

            <button
              onClick={() => setCreatingFolder(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>

            <UploadButton onFiles={uploadFiles} />

            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-400"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-slate-400"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence>
            {creatingFolder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <input
                  autoFocus
                  placeholder="Folder name…"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onBlur={handleCreateFolder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") setCreatingFolder(false);
                  }}
                  className="w-full max-w-xs px-4 py-2 bg-white/5 border border-violet-400/40 rounded-xl text-sm text-white outline-none placeholder:text-slate-500"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Folders */}
          {folders.filter((f) => f.parentId === activeFolderId).length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Folders</p>
              <div className="grid grid-cols-1 gap-2">
                {folders
                  .filter((f) => f.parentId === activeFolderId)
                  .map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      isActive={activeFolderId === folder.id}
                      onClick={() => setActiveFolderId(folder.id)}
                      onDelete={handleDeleteFolder}
                      onRename={handleRenameFolder}
                      onDrop={handleMoveFile}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Files */}
          <div>
            {visibleFiles.length > 0 || uploadingFiles.length > 0 ? (
              <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "grid grid-cols-1 gap-2"}>
                <AnimatePresence>
                  {uploadingFiles.map((uf) => (
                    <UploadingCard key={uf.id} name={uf.name} progress={uf.progress} />
                  ))}
                  {visibleFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onDelete={handleDeleteFile}
                      onRename={handleRenameFile}
                      onPreview={setPreviewFile}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-64 text-slate-500"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-white/40">Drop files anywhere</p>
                <p className="text-sm mt-1">or click the Upload button</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </UploadZone>
  );
}
