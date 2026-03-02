import PusherClient from "pusher-js";

const globalForPusher = globalThis as unknown as {
    pusherClient: PusherClient | undefined;
};

export const pusherClient =
    globalForPusher.pusherClient ??
    new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPusher.pusherClient = pusherClient;
}
