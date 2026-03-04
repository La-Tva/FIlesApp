import { auth } from "@/auth";
import { ChatClient } from "./ChatClient";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function GlobalChatPage() {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      userId={session.user.id}
      userName={session.user.name || "Utilisateur"}
      userEmail={session.user.email || ""}
    >
      <div className="w-full h-[calc(100dvh-13rem)] xl:h-[calc(100dvh-11rem)]">
        <ChatClient
          spaceId="global"
          userId={session.user.id}
          userName={session.user.name || "Utilisateur"}
        />
      </div>
    </DashboardLayout>
  );
}
