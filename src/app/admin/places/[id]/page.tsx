import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlaceById } from "@/lib/queries";
import { PlaceForm } from "@/components/admin/place-form";

export const dynamic = "force-dynamic";

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const { id } = await params;
  const place = await getPlaceById(Number(id));
  if (!place) notFound();

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-xl mx-auto px-5 py-8">
        <div className="mb-6">
          <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent">Admin</div>
          <h1 className="font-display font-bold text-[28px] text-ink">Edit place</h1>
        </div>
        <div className="bg-card rounded-card border border-line2 shadow-card p-6">
          <PlaceForm place={place} />
        </div>
      </div>
    </div>
  );
}
