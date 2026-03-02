"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UploadingFile {
    id: string;
    name: string;
    progress: number;
}

interface UseFileUploadOptions {
    spaceId: string;
    folderId?: string | null;
}

export function useFileUpload({ spaceId, folderId }: UseFileUploadOptions) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

    const uploadFile = useCallback(
        async (file: File) => {
            const tempId = crypto.randomUUID();

            setUploadingFiles((prev) => [
                ...prev,
                { id: tempId, name: file.name, progress: 0 },
            ]);

            try {
                // 1. Get presigned URL
                const presignRes = await fetch("/api/upload/presign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type,
                        spaceId,
                    }),
                });

                if (!presignRes.ok) throw new Error("Failed to get upload URL");
                const { presignedUrl, key } = await presignRes.json();

                // 2. Upload directly to R2 with progress tracking via XHR
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", presignedUrl);
                    xhr.setRequestHeader("Content-Type", file.type);

                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const progress = Math.round((e.loaded / e.total) * 100);
                            setUploadingFiles((prev) =>
                                prev.map((f) => (f.id === tempId ? { ...f, progress } : f))
                            );
                        }
                    };

                    xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error("Upload failed")));
                    xhr.onerror = () => reject(new Error("Network error"));
                    xhr.send(file);
                });

                // 3. Confirm upload — this saves to DB & triggers Pusher
                const confirmRes = await fetch("/api/upload/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        key,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        spaceId,
                        folderId: folderId ?? null,
                    }),
                });

                if (!confirmRes.ok) throw new Error("Failed to confirm upload");
                toast.success(`${file.name} uploaded successfully`);
            } catch (err) {
                console.error(err);
                toast.error(`Failed to upload ${file.name}`);
            } finally {
                setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
            }
        },
        [spaceId, folderId]
    );

    const uploadFiles = useCallback(
        (files: File[]) => {
            files.forEach((f) => uploadFile(f));
        },
        [uploadFile]
    );

    return { uploadingFiles, uploadFiles };
}
