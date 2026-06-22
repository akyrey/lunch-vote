import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllPlaces } from "@/lib/queries";
import Link from "next/link";
import { deactivatePlace, activatePlace } from "@/lib/actions";
import { daysAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPlacesPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const places = await getAllPlaces();

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent">Admin</div>
            <h1 className="font-display font-bold text-[28px] text-ink">Places</h1>
          </div>
          <Link
            href="/admin/places/new"
            className="bg-accent text-white font-bold text-[14px] px-4 py-2 rounded-btn shadow-btn-accent"
          >
            + Add place
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {places.map((place) => (
            <div
              key={place.id}
              className="bg-card rounded-card border border-line2 shadow-card p-4 flex items-center gap-4"
              style={{ opacity: place.isActive ? 1 : 0.6 }}
            >
              <div
                className="w-[48px] h-[48px] rounded-[12px] flex-shrink-0 flex items-center justify-center font-display font-bold text-[20px] text-white/90"
                style={{
                  background: `linear-gradient(150deg, hsl(${place.colorHue} 46% 60%), hsl(${place.colorHue} 42% 44%))`,
                }}
              >
                {place.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] text-ink flex items-center gap-2">
                  {place.name}
                  {!place.isActive && (
                    <span className="text-[10px] text-mut2 border border-line rounded px-1">
                      inactive
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-mut">
                  {place.cuisine} · {place.priceTier} ·{" "}
                  {place.lastVisitedAt
                    ? `visited ${daysAgo(place.lastVisitedAt)}d ago`
                    : "never visited"}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/places/${place.id}`}
                  className="text-[13px] font-semibold text-accent px-3 py-1.5 border border-accent rounded-[8px]"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    if (place.isActive) await deactivatePlace(place.id);
                    else await activatePlace(place.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-[13px] font-semibold text-mut px-3 py-1.5 border border-line rounded-[8px] cursor-pointer"
                  >
                    {place.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
