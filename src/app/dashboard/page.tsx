import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getMostVisitedPlaces,
  getWinRates,
  getLeaderboard,
  getAllPlaces,
} from "@/lib/queries";
import { db } from "@/lib/db";
import { polls, attendance } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { DesktopDashboard } from "@/components/stats/desktop-dashboard";
import { CURRENCY } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [mostVisited90, winRates, leaderboard, allPlaces] = await Promise.all([
    getMostVisitedPlaces(90),
    getWinRates(),
    getLeaderboard(),
    getAllPlaces(),
  ]);

  const [{ count: totalPolls } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(polls)
    .where(eq(polls.status, "closed"));

  const [{ count: attendanceCount } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(attendance);

  const avgTurnout =
    totalPolls > 0
      ? Math.round((attendanceCount / totalPolls) * 10) / 10
      : 0;

  const avgSpend =
    allPlaces.length > 0
      ? Math.round(
          (allPlaces.reduce((sum, p) => sum + (p.avgPrice ?? 0), 0) /
            allPlaces.length) *
            10
        ) / 10
      : 0;

  const topSpot = winRates[0];

  return (
    <DesktopDashboard
      mostVisited={mostVisited90.slice(0, 6)}
      winRates={winRates.slice(0, 6)}
      leaderboard={leaderboard}
      userId={session.user.id}
      userName={session.user.name ?? session.user.email ?? "You"}
      isAdmin={session.user.isAdmin}
      kpis={{
        totalPolls,
        avgTurnout,
        avgSpend,
        currency: CURRENCY,
        topSpotName: topSpot?.name ?? "—",
        topSpotWins: topSpot?.wins ?? 0,
      }}
    />
  );
}
