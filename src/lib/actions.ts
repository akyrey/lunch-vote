"use server";

import { auth } from "./auth";
import { db } from "./db";
import {
  attendance,
  ballots,
  ballotRankings,
  places,
  polls,
  pollCandidates,
  points,
} from "./db/schema";
import { eq, and } from "drizzle-orm";
import { POINTS } from "./config";
import { getUserAttendance, getUserBallot } from "./queries";
import { redirect } from "next/navigation";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

async function requireAdmin() {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new Error("Unauthorized: admin access required");
  }
  return user;
}

// ── Check-in ──────────────────────────────────────────────────────────────

export async function checkIn(pollId: number) {
  const user = await requireAuth();
  const existing = await getUserAttendance(pollId, user.id);
  if (existing) return { success: true };

  await db.insert(attendance).values({ pollId, userId: user.id });

  // Award check-in points
  await db.insert(points).values({
    userId: user.id,
    pollId,
    amount: POINTS.CHECK_IN,
    reason: "check_in",
  });

  return { success: true };
}

export async function checkOut(pollId: number) {
  const user = await requireAuth();
  await db
    .delete(attendance)
    .where(
      and(eq(attendance.pollId, pollId), eq(attendance.userId, user.id))
    );
  return { success: true };
}

// ── Voting ─────────────────────────────────────────────────────────────────

export async function submitBallot(pollId: number, ranking: number[]) {
  const user = await requireAuth();

  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .limit(1);
  if (!poll || poll.status !== "open") {
    throw new Error("Poll is not open");
  }

  const existing = await getUserBallot(pollId, user.id);
  if (existing) {
    // Replace existing ballot
    await db
      .delete(ballotRankings)
      .where(eq(ballotRankings.ballotId, existing.id));
    await db.delete(ballots).where(eq(ballots.id, existing.id));
  }

  const [ballot] = await db
    .insert(ballots)
    .values({ pollId, userId: user.id })
    .returning();

  if (ranking.length > 0) {
    await db.insert(ballotRankings).values(
      ranking.map((placeId, i) => ({
        ballotId: ballot.id,
        placeId,
        rank: i + 1,
      }))
    );
  }

  // Award vote points (idempotent — skip if already awarded for this poll)
  const existingPoints = await db
    .select()
    .from(points)
    .where(
      and(
        eq(points.userId, user.id),
        eq(points.pollId, pollId),
        eq(points.reason, "vote")
      )
    )
    .limit(1);
  if (existingPoints.length === 0) {
    await db.insert(points).values({
      userId: user.id,
      pollId,
      amount: POINTS.VOTE,
      reason: "vote",
    });
  }

  return { success: true, ballotId: ballot.id };
}

// ── Places (admin) ────────────────────────────────────────────────────────

export async function createPlace(
  data: Omit<
    typeof places.$inferInsert,
    "id" | "createdAt" | "updatedAt" | "isActive"
  >
) {
  await requireAdmin();
  const [place] = await db.insert(places).values(data).returning();
  return place;
}

export async function updatePlace(
  id: number,
  data: Partial<typeof places.$inferInsert>
) {
  await requireAdmin();
  const now = Date.now();
  const [place] = await db
    .update(places)
    .set({ ...data, updatedAt: new Date(now) })
    .where(eq(places.id, id))
    .returning();
  return place;
}

export async function deactivatePlace(id: number) {
  await requireAdmin();
  await db
    .update(places)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(places.id, id));
}

export async function activatePlace(id: number) {
  await requireAdmin();
  await db
    .update(places)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(places.id, id));
}
