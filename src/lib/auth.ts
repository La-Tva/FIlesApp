import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Resend from "next-auth/providers/resend";
import { clientPromise } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise, { databaseName: "swiftdrop" }),
    providers: [
        Resend({
            apiKey: process.env.AUTH_RESEND_KEY,
            from: process.env.EMAIL_FROM ?? "SwiftDrop <noreply@example.com>",
        }),
    ],
    pages: {
        signIn: "/",
        verifyRequest: "/auth/verify",
    },
    session: { strategy: "database" },
    callbacks: {
        session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
    },
});
