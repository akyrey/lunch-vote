import { TabBar } from "@/components/tab-bar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      <TabBar />
    </div>
  );
}
