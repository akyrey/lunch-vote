import { db } from "./db";
import {
  polls,
  pollCandidates,
  places,
  attendance,
  ballots,
  ballotRankings,
  users,
  points,
} from "./db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { todayDateStr } from "./config";

// ── Poll ──────────────────────────────────────────────────────────────────

export async function getTodayPoll() {
  const date = todayDateStr();
  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.date, date))
    .limit(1);
  return poll ?? null;
}

export async function getPollCandidates(pollId: number) {
  return db
    .select({ place: places })
    .from(pollCandidates)
    .innerJoin(places, eq(pollCandidates.placeId, places.id))
    .where(eq(pollCandidates.pollId, pollId));
}

export async function getPollWithCandidates(pollId: number) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .limit(1);
  if (!poll) return null;
  const candidates = await getPollCandidates(pollId);
  return { poll, candidates: candidates.map((c) => c.place) };
}

// ── Attendance ────────────────────────────────────────────────────────────

export async function getUserAttendance(pollId: number, userId: string) {
  const [row] = await db
    .select()
    .from(attendance)
    .where(
      and(eq(attendance.pollId, pollId), eq(attendance.userId, userId))
    )
    .limit(1);
  return row ?? null;
}

export async function getPollAttendance(pollId: number) {
  return db
    .select({ user: users })
    .from(attendance)
    .innerJoin(users, eq(attendance.userId, users.id))
    .where(eq(attendance.pollId, pollId));
}

// ── Ballots ───────────────────────────────────────────────────────────────

export async function getUserBallot(pollId: number, userId: string) {
  const [row] = await db
    .select()
    .from(ballots)
    .where(and(eq(ballots.pollId, pollId), eq(ballots.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function getBallotRankings(ballotId: number) {
  return db
    .select()
    .from(ballotRankings)
    .where(eq(ballotRankings.ballotId, ballotId))
    .orderBy(ballotRankings.rank);
}

export async function getPollBallots(pollId: number) {
  const bs = await db
    .select()
    .from(ballots)
    .where(eq(ballots.pollId, pollId));
  const result = await Promise.all(
    bs.map(async (b) => {
      const rankings = await getBallotRankings(b.id);
      return {
        userId: b.userId,
        ranking: rankings.map((r) => r.placeId),
      };
    })
  );
  return result;
}

// ── Places ────────────────────────────────────────────────────────────────

export async function getAllPlaces() {
  return db.select().from(places).orderBy(places.name);
}

export async function getActivePlaces() {
  return db
    .select()
    .from(places)
    .where(eq(places.isActive, true))
    .orderBy(places.lastVisitedAt);
}

export async function getPlaceById(id: number) {
  const [place] = await db
    .select()
    .from(places)
    .where(eq(places.id, id))
    .limit(1);
  return place ?? null;
}

// ── Stats ─────────────────────────────────────────────────────────────────

export async function getMostVisitedPlaces(days?: number) {
  const allPlaces = await getAllPlaces();
  // For now count wins as a proxy for visits (each win = one visit)
  const pollResults = await db
    .select({ placeId: polls.winningPlaceId, date: polls.date })
    .from(polls)
    .where(eq(polls.status, "closed"));

  const cutoff = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    : null;

  const visitCounts: Record<number, number> = {};
  for (const p of allPlaces) visitCounts[p.id] = 0;
  for (const r of pollResults) {
    if (!r.placeId) continue;
    if (cutoff && new Date(r.date) < cutoff) continue;
    visitCounts[r.placeId] = (visitCounts[r.placeId] ?? 0) + 1;
  }

  return allPlaces
    .map((p) => ({ ...p, visitCount: visitCounts[p.id] ?? 0 }))
    .sort((a, b) => b.visitCount - a.visitCount);
}

export async function getWinRates() {
  const allPlaces = await getAllPlaces();
  const candidacies = await db
    .select({ placeId: pollCandidates.placeId })
    .from(pollCandidates);
  const wins = await db
    .select({ placeId: polls.winningPlaceId })
    .from(polls)
    .where(eq(polls.status, "closed"));

  const appearanceCounts: Record<number, number> = {};
  const winCounts: Record<number, number> = {};
  for (const p of allPlaces) {
    appearanceCounts[p.id] = 0;
    winCounts[p.id] = 0;
  }
  for (const c of candidacies) appearanceCounts[c.placeId]++;
  for (const w of wins) {
    if (w.placeId) winCounts[w.placeId]++;
  }

  return allPlaces
    .map((p) => ({
      ...p,
      appearances: appearanceCounts[p.id] ?? 0,
      wins: winCounts[p.id] ?? 0,
      winRate:
        appearanceCounts[p.id] > 0
          ? Math.round((winCounts[p.id] / appearanceCounts[p.id]) * 100)
          : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate);
}

export async function getLeaderboard() {
  const allUsers = await db.select().from(users);
  const allPoints = await db.select().from(points);
  const allBallots = await db.select().from(ballots);

  const pointTotals: Record<string, number> = {};
  const voteCounts: Record<string, number> = {};

  for (const u of allUsers) {
    pointTotals[u.id] = 0;
    voteCounts[u.id] = 0;
  }
  for (const p of allPoints) {
    pointTotals[p.userId] = (pointTotals[p.userId] ?? 0) + p.amount;
  }
  for (const b of allBallots) {
    voteCounts[b.userId] = (voteCounts[b.userId] ?? 0) + 1;
  }

  return allUsers
    .map((u) => ({
      ...u,
      totalPoints: pointTotals[u.id] ?? 0,
      totalVotes: voteCounts[u.id] ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

export async function getUserStreak(userId: string): Promise<number> {
  const userBallots = await db
    .select({ pollId: ballots.pollId })
    .from(ballots)
    .where(eq(ballots.userId, userId));

  if (userBallots.length === 0) return 0;

  const pollIds = userBallots.map((b) => b.pollId);
  const pollDates = await db
    .select({ date: polls.date })
    .from(polls)
    .where(inArray(polls.id, pollIds))
    .orderBy(desc(polls.date));

  // Count consecutive weekdays back from the most recent voted day
  let streak = 0;
  let expected = pollDates[0]?.date;
  for (const { date } of pollDates) {
    if (date === expected) {
      streak++;
      // Move expected back one weekday
      const d = new Date(date + "T12:00:00Z");
      d.setDate(d.getDate() - 1);
      while ([0, 6].includes(d.getDay())) d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
    } else {
      break;
    }
  }
  return streak;
}
