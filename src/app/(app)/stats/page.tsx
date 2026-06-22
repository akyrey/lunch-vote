import { auth } from "@/lib/auth";
import {
  getMostVisitedPlaces,
  getLeaderboard,
  getUserStreak,
} from "@/lib/queries";
import { MobileStats } from "@/components/stats/mobile-stats";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [mostVisited, leaderboard, userStreak] = await Promise.all([
    getMostVisitedPlaces(90),
    getLeaderboard(),
    getUserStreak(userId),
  ]);

  return (
    <MobileStats
      mostVisited={mostVisited.slice(0, 5)}
      leaderboard={leaderboard}
      userStreak={userStreak}
      userId={userId}
    />
  );
}
