"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CloudUpload } from "lucide-react";

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
}

export function UploadZone({ onFiles, children }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);
      onFiles(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true, // Don't open dialog on click — only on drag
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div {...getRootProps()} className="relative w-full h-full">
      <input {...getInputProps()} />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-violet-950/80 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="flex flex-col items-center gap-4 text-violet-300"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <CloudUpload className="w-24 h-24 text-violet-400" />
              </motion.div>
              <p className="text-2xl font-bold tracking-tight">Drop files to upload</p>
              <p className="text-sm text-violet-400/70">Files expire automatically after 24 hours</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

// Inline upload button for use in the toolbar
export function UploadButton({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onFiles,
  });

  return (
    <button
      {...getRootProps()}
      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors"
    >
      <input {...getInputProps()} />
      <Upload className="w-4 h-4" />
      Upload
    </button>
  );
}
