import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise, getCollections } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise, { databaseName: "swiftdrop" }),
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const { users } = await getCollections();
                const user = await users.findOne({ email: credentials.email as string });
                if (!user || !user.passwordHash) return null;

                const valid = await bcrypt.compare(credentials.password as string, user.passwordHash as string);
                if (!valid) return null;

                return { id: user._id.toString(), email: user.email, name: user.name ?? null };
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/", error: "/" },
    callbacks: {
        jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            if (token?.id) session.user.id = token.id as string;
            return session;
        },
    },
    secret: process.env.AUTH_SECRET,
});
