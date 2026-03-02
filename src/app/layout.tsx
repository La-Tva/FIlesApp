import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SwiftDrop — Ephemeral File Sharing",
  description: "Your digital bridge. Share files between devices instantly. Files auto-expire after 24h.",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SwiftDrop",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-slate-950 text-white">
        <SessionProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
