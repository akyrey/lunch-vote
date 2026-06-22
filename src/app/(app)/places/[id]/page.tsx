import { getPlaceById, getWinRates } from "@/lib/queries";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { PlaceDetailScreen } from "@/components/places/place-detail-screen";
import { daysAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const placeId = Number(id);
  if (isNaN(placeId)) notFound();

  const session = await auth();
  const isAdmin = session?.user?.isAdmin ?? false;

  const [place, winRates] = await Promise.all([
    getPlaceById(placeId),
    getWinRates(),
  ]);
  if (!place) notFound();

  const winData = winRates.find((w) => w.id === placeId);

  return (
    <PlaceDetailScreen
      place={place}
      isAdmin={isAdmin}
      winRate={winData?.winRate ?? 0}
      wins={winData?.wins ?? 0}
      appearances={winData?.appearances ?? 0}
      daysAgoVisited={daysAgo(place.lastVisitedAt)}
    />
  );
}
