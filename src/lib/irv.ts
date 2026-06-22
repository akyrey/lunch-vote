export type Candidate = {
  id: number;
  lastVisitedAt: Date | null;
};

export type Ballot = number[]; // ordered place ids, partial ranking allowed

export type IrvRound = {
  tallies: Record<number, number>;
  standing: number[];
  eliminated: number | null;
  winner: number | null;
  isTieBreak: boolean;
  majority: number;
  totalBallots: number;
  caption: string;
};

export type IrvResult = {
  rounds: IrvRound[];
  winner: number;
};

// Returns days since visit as a number — null (never visited) counts as Infinity
// so never-visited places are always treated as the least recently visited.
function effectiveAge(candidate: Candidate): number {
  if (candidate.lastVisitedAt === null) return Infinity;
  const msPerDay = 24 * 60 * 60 * 1000;
  return (Date.now() - candidate.lastVisitedAt.getTime()) / msPerDay;
}

// Among a list of candidate ids, returns the id of the least-recently-visited.
// Favors never-visited places; breaks further ties by id (stable/deterministic).
function leastRecent(ids: number[], candidates: Candidate[]): number {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  return ids.reduce((best, id) => {
    const bestAge = effectiveAge(byId.get(best)!);
    const idAge = effectiveAge(byId.get(id)!);
    if (idAge > bestAge) return id;
    if (idAge === bestAge) return id < best ? id : best; // stable fallback
    return best;
  });
}

// Among a list of candidate ids, returns the id of the most-recently-visited.
// Used to pick who gets eliminated when multiple candidates tie for fewest votes.
function mostRecent(ids: number[], candidates: Candidate[]): number {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  return ids.reduce((worst, id) => {
    const worstAge = effectiveAge(byId.get(worst)!);
    const idAge = effectiveAge(byId.get(id)!);
    if (idAge < worstAge) return id;
    if (idAge === worstAge) return id > worst ? id : worst; // stable fallback
    return worst;
  });
}

export { leastRecent, mostRecent, effectiveAge };

/**
 * Pure IRV tabulation function.
 *
 * @param ballots  Array of ordered place-id lists. Partial rankings are
 *                 allowed; unranked places are treated as least-preferred.
 * @param candidates  All candidates in this poll (used for tie-breaking).
 * @returns  Round-by-round breakdown and the overall winner id.
 */
export function runIrv(ballots: Ballot[], candidates: Candidate[]): IrvResult {
  if (candidates.length === 0) throw new Error("No candidates");
  if (ballots.length === 0) {
    // No ballots: favor least-recently-visited by tie-break
    const winner = leastRecent(
      candidates.map((c) => c.id),
      candidates
    );
    return {
      rounds: [
        {
          tallies: Object.fromEntries(candidates.map((c) => [c.id, 0])),
          standing: candidates.map((c) => c.id),
          eliminated: null,
          winner,
          isTieBreak: candidates.length > 1,
          majority: 1,
          totalBallots: 0,
          caption: `No ballots — ${candidates.find((c) => c.id === winner)?.id} wins by tie-break.`,
        },
      ],
      winner,
    };
  }

  const totalBallots = ballots.length;
  const majority = Math.floor(totalBallots / 2) + 1;
  let standing = new Set(candidates.map((c) => c.id));
  const rounds: IrvRound[] = [];

  for (let guard = 0; guard < 50; guard++) {
    // Count each ballot's top-ranked still-standing candidate
    const tallies: Record<number, number> = {};
    standing.forEach((id) => (tallies[id] = 0));

    for (const ballot of ballots) {
      const top = ballot.find((id) => standing.has(id));
      if (top !== undefined) tallies[top]++;
    }

    const entries = [...standing].map((id) => ({ id, n: tallies[id] }));
    const maxVotes = Math.max(...entries.map((e) => e.n));

    // Check for majority winner
    if (maxVotes >= majority || standing.size <= 1) {
      const topIds = entries.filter((e) => e.n === maxVotes).map((e) => e.id);
      const isTieBreak = topIds.length > 1;
      const winner =
        topIds.length === 1 ? topIds[0] : leastRecent(topIds, candidates);
      const winnerName = winner;

      rounds.push({
        tallies: { ...tallies },
        standing: [...standing],
        eliminated: null,
        winner,
        isTieBreak,
        majority,
        totalBallots,
        caption: isTieBreak
          ? `Tie broken — place #${winner} wins (least recently visited).`
          : `Place #${winner} reaches a majority — ${maxVotes} of ${totalBallots} votes.`,
      });
      return { rounds, winner };
    }

    // Eliminate the candidate with the fewest votes
    const minVotes = Math.min(...entries.map((e) => e.n));
    const lowIds = entries.filter((e) => e.n === minVotes).map((e) => e.id);
    const isTieBreak = lowIds.length > 1;
    const eliminated = isTieBreak
      ? mostRecent(lowIds, candidates) // most-recently-visited gets eliminated
      : lowIds[0];

    rounds.push({
      tallies: { ...tallies },
      standing: [...standing],
      eliminated,
      winner: null,
      isTieBreak,
      majority,
      totalBallots,
      caption: isTieBreak
        ? `Tie at ${minVotes} — place #${eliminated} eliminated (visited most recently).`
        : `Place #${eliminated} eliminated — fewest votes (${minVotes}).`,
    });

    standing.delete(eliminated);
  }

  throw new Error("IRV did not converge after 50 rounds");
}
