"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { pusherClient } from "@/lib/pusher-client";
import type { FileJSON, FolderJSON } from "@/types/models";

interface UsePusherReturn {
    files: FileJSON[];
    folders: FolderJSON[];
    setFiles: React.Dispatch<React.SetStateAction<FileJSON[]>>;
    setFolders: React.Dispatch<React.SetStateAction<FolderJSON[]>>;
}

export function usePusher(
    spaceId: string,
    initialFiles: FileJSON[],
    initialFolders: FolderJSON[]
): UsePusherReturn {
    const [files, setFiles] = useState<FileJSON[]>(initialFiles);
    const [folders, setFolders] = useState<FolderJSON[]>(initialFolders);

    const handleFileUploaded = useCallback((file: FileJSON) => {
        setFiles((prev) => [file, ...prev.filter((f) => f.id !== file.id)]);
    }, []);

    const handleFileUpdated = useCallback((file: FileJSON) => {
        setFiles((prev) => prev.map((f) => (f.id === file.id ? file : f)));
    }, []);

    const handleFileDeleted = useCallback(({ id }: { id: string }) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const handleFolderCreated = useCallback((folder: FolderJSON) => {
        setFolders((prev) => [...prev, folder]);
    }, []);

    const handleFolderRenamed = useCallback((folder: FolderJSON) => {
        setFolders((prev) => prev.map((f) => (f.id === folder.id ? folder : f)));
    }, []);

    const handleFolderDeleted = useCallback(({ id }: { id: string }) => {
        setFolders((prev) => prev.filter((f) => f.id !== id));
    }, []);

    useEffect(() => {
        const channel = pusherClient.subscribe(`space-${spaceId}`);

        channel.bind("file:uploaded", handleFileUploaded);
        channel.bind("file:updated", handleFileUpdated);
        channel.bind("file:deleted", handleFileDeleted);
        channel.bind("folder:created", handleFolderCreated);
        channel.bind("folder:renamed", handleFolderRenamed);
        channel.bind("folder:deleted", handleFolderDeleted);

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`space-${spaceId}`);
        };
    }, [
        spaceId,
        handleFileUploaded,
        handleFileUpdated,
        handleFileDeleted,
        handleFolderCreated,
        handleFolderRenamed,
        handleFolderDeleted,
    ]);

    return { files, folders, setFiles, setFolders };
}
