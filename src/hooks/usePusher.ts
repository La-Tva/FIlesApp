"use client";

import { useEffect, useCallback } from "react";
import { pusherClient } from "@/lib/pusher-client";
import type { FileJSON, FolderJSON } from "@/types/models";

interface UsePusherOptions {
    spaceId: string;
    onFileUploaded?: (file: FileJSON) => void;
    onFileUpdated?: (file: FileJSON) => void;
    onFileDeleted?: (id: string) => void;
    onFolderCreated?: (folder: FolderJSON) => void;
    onFolderRenamed?: (folder: FolderJSON) => void;
    onFolderDeleted?: (id: string) => void;
}

export function usePusher({
    spaceId,
    onFileUploaded,
    onFileUpdated,
    onFileDeleted,
    onFolderCreated,
    onFolderRenamed,
    onFolderDeleted,
}: UsePusherOptions) {
    useEffect(() => {
        const channel = pusherClient.subscribe(`space-${spaceId}`);

        if (onFileUploaded) channel.bind("file:uploaded", onFileUploaded);
        if (onFileUpdated) channel.bind("file:updated", onFileUpdated);
        if (onFileDeleted) channel.bind("file:deleted", ({ id }: { id: string }) => onFileDeleted(id));
        if (onFolderCreated) channel.bind("folder:created", onFolderCreated);
        if (onFolderRenamed) channel.bind("folder:renamed", onFolderRenamed);
        if (onFolderDeleted) channel.bind("folder:deleted", ({ id }: { id: string }) => onFolderDeleted(id));

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`space-${spaceId}`);
        };
    }, [
        spaceId,
        onFileUploaded,
        onFileUpdated,
        onFileDeleted,
        onFolderCreated,
        onFolderRenamed,
        onFolderDeleted,
    ]);
}
