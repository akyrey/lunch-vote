import { getAllPlaces } from "@/lib/queries";
import { PlacesScreen } from "@/components/places/places-screen";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PlacesPage() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin ?? false;
  const places = await getAllPlaces();

  return <PlacesScreen places={places} isAdmin={isAdmin} />;
}
