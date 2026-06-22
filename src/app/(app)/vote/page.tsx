import { auth } from "@/lib/auth";
import {
  getTodayPoll,
  getPollCandidates,
  getUserAttendance,
  getUserBallot,
  getBallotRankings,
} from "@/lib/queries";
import { redirect } from "next/navigation";
import { VoteScreen } from "@/components/vote/vote-screen";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const session = await auth();
  const userId = session!.user.id;

  const poll = await getTodayPoll();
  if (!poll || poll.status !== "open") redirect("/");

  const [candidates, userAttendance, existingBallot] = await Promise.all([
    getPollCandidates(poll.id),
    getUserAttendance(poll.id, userId),
    getUserBallot(poll.id, userId),
  ]);

  let existingRanking: number[] = [];
  if (existingBallot) {
    const rankings = await getBallotRankings(existingBallot.id);
    existingRanking = rankings.map((r) => r.placeId);
  }

  return (
    <VoteScreen
      pollId={poll.id}
      candidates={candidates.map((c) => c.place)}
      isCheckedIn={!!userAttendance}
      existingRanking={existingRanking}
    />
  );
}
