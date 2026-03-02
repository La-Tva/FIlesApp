"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { FileJSON } from "@/types/models";
import { Download, X } from "lucide-react";

interface FilePreviewModalProps {
  file: FileJSON | null;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";

  return (
    <Dialog open={!!file} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl w-full bg-slate-950/95 border-white/10 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <div className="flex items-center gap-2">
            <a
              href={file.url}
              download={file.name}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center bg-black/40 min-h-[60vh] max-h-[80vh]">
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt={file.name} className="max-w-full max-h-[80vh] object-contain" />
          )}
          {isVideo && (
            <video src={file.url} controls className="max-w-full max-h-[80vh]" />
          )}
          {isPdf && (
            <iframe src={file.url} className="w-full h-[80vh]" title={file.name} />
          )}
          {!isImage && !isVideo && !isPdf && (
            <div className="flex flex-col items-center gap-4 text-slate-400 py-16">
              <p className="text-lg">No preview available</p>
              <a
                href={file.url}
                download={file.name}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download file
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
