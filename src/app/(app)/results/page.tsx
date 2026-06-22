import { auth } from "@/lib/auth";
import {
  getTodayPoll,
  getPollCandidates,
  getPollBallots,
  getPollAttendance,
  getUserBallot,
  getBallotRankings,
} from "@/lib/queries";
import { redirect } from "next/navigation";
import { runIrv } from "@/lib/irv";
import { ResultsScreen } from "@/components/results/results-screen";
import type { Candidate } from "@/lib/irv";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const poll = await getTodayPoll();
  if (!poll) redirect("/");

  const [candidateRows, pollBallots, attendance] = await Promise.all([
    getPollCandidates(poll.id),
    getPollBallots(poll.id),
    getPollAttendance(poll.id),
  ]);

  const candidates = candidateRows.map((c) => c.place);
  const checkedInIds = new Set(attendance.map((a) => a.user.id));

  const irvCandidates: Candidate[] = candidates.map((p) => ({
    id: p.id,
    lastVisitedAt: p.lastVisitedAt,
  }));

  // Only count ballots from checked-in users
  const countingBallots = pollBallots
    .filter((b) => checkedInIds.has(b.userId))
    .map((b) => b.ranking);

  const irvResult =
    candidates.length > 0 ? runIrv(countingBallots, irvCandidates) : null;

  // Get current user's top pick
  const userBallot = await getUserBallot(poll.id, userId);
  let userTopPick: number | null = null;
  if (userBallot) {
    const rankings = await getBallotRankings(userBallot.id);
    userTopPick = rankings[0]?.placeId ?? null;
  }

  const placeMap = new Map(candidates.map((p) => [p.id, p]));

  return (
    <ResultsScreen
      poll={poll}
      candidates={candidates}
      rounds={
        irvResult?.rounds.map((r) => ({
          ...r,
          tallies: r.tallies as Record<number, number>,
          standing: r.standing as number[],
        })) ?? []
      }
      winner={irvResult?.winner ?? null}
      winnerPlace={
        irvResult?.winner ? (placeMap.get(irvResult.winner) ?? null) : null
      }
      userTopPick={userTopPick}
      totalBallots={countingBallots.length}
    />
  );
}
