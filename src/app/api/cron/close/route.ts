import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  polls,
  pollCandidates,
  places,
  ballots,
  ballotRankings,
  attendance,
  points,
} from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { todayDateStr, POINTS } from "@/lib/config";
import { runIrv, type Candidate, type Ballot } from "@/lib/irv";
import { notifyPollClosed } from "@/lib/slack";

function verifyCron(req: Request): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = todayDateStr();
  const [poll] = await db
    .select()
    .from(polls)
    .where(and(eq(polls.date, date), eq(polls.status, "open")))
    .limit(1);

  if (!poll) {
    return NextResponse.json({ message: "No open poll to close today" });
  }

  // Build IRV inputs
  const candidateRows = await db
    .select({ place: places })
    .from(pollCandidates)
    .innerJoin(places, eq(pollCandidates.placeId, places.id))
    .where(eq(pollCandidates.pollId, poll.id));

  const candidates: Candidate[] = candidateRows.map(({ place }) => ({
    id: place.id,
    lastVisitedAt: place.lastVisitedAt,
  }));

  // Only count ballots from checked-in users
  const checkedInAttendance = await db
    .select({ userId: attendance.userId })
    .from(attendance)
    .where(eq(attendance.pollId, poll.id));
  const checkedInIds = new Set(checkedInAttendance.map((a) => a.userId));

  const pollBallots = await db
    .select()
    .from(ballots)
    .where(eq(ballots.pollId, poll.id));

  const countingBallotData = pollBallots.filter((b) =>
    checkedInIds.has(b.userId)
  );

  const irvBallots: Ballot[] = await Promise.all(
    countingBallotData.map(async (b) => {
      const rankings = await db
        .select()
        .from(ballotRankings)
        .where(eq(ballotRankings.ballotId, b.id))
        .orderBy(ballotRankings.rank);
      return rankings.map((r) => r.placeId);
    })
  );

  const result = runIrv(irvBallots, candidates);
  const winnerId = result.winner;

  // Update poll
  await db
    .update(polls)
    .set({ status: "closed", winningPlaceId: winnerId })
    .where(eq(polls.id, poll.id));

  // Update winner's lastVisitedAt
  await db
    .update(places)
    .set({ lastVisitedAt: new Date(), updatedAt: new Date() })
    .where(eq(places.id, winnerId));

  // Award top-pick-won points
  for (const b of countingBallotData) {
    const topRanking = await db
      .select()
      .from(ballotRankings)
      .where(
        and(
          eq(ballotRankings.ballotId, b.id),
          eq(ballotRankings.rank, 1)
        )
      )
      .limit(1);
    if (topRanking[0]?.placeId === winnerId) {
      await db.insert(points).values({
        userId: b.userId,
        pollId: poll.id,
        amount: POINTS.TOP_PICK_WON,
        reason: "top_pick_won",
      });
    }
  }

  const [winner] = await db
    .select()
    .from(places)
    .where(eq(places.id, winnerId))
    .limit(1);

  await notifyPollClosed(winner?.name ?? "Unknown", irvBallots.length);

  return NextResponse.json({
    message: "Poll closed",
    winner: { id: winnerId, name: winner?.name },
    rounds: result.rounds.length,
  });
}
