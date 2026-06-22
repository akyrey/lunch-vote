import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlaceForm } from "@/components/admin/place-form";

export default async function NewPlacePage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-xl mx-auto px-5 py-8">
        <div className="mb-6">
          <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent">Admin</div>
          <h1 className="font-display font-bold text-[28px] text-ink">Add place</h1>
        </div>
        <div className="bg-card rounded-card border border-line2 shadow-card p-6">
          <PlaceForm />
        </div>
      </div>
    </div>
  );
}
