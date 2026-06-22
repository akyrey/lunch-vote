import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { polls, pollCandidates, places } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  todayDateStr,
  isWeekday,
  pollTimestampUTC,
  POLL_OPEN_TIME,
  POLL_CLOSE_TIME,
} from "@/lib/config";
import { notifyPollOpen } from "@/lib/slack";

function verifyCron(req: Request): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = todayDateStr();
  if (!isWeekday(date)) {
    return NextResponse.json({ message: "Weekend — no poll" });
  }

  // Idempotency: check if a poll already exists for today
  const [existing] = await db
    .select()
    .from(polls)
    .where(eq(polls.date, date))
    .limit(1);

  if (existing) {
    return NextResponse.json({ message: "Poll already exists", id: existing.id });
  }

  // Fetch active places ordered by last visited (least recent first)
  const activePlaces = await db
    .select()
    .from(places)
    .where(eq(places.isActive, true))
    .orderBy(places.lastVisitedAt); // nulls first in SQLite

  if (activePlaces.length === 0) {
    return NextResponse.json(
      { error: "No active places to create poll" },
      { status: 422 }
    );
  }

  const opensAt = pollTimestampUTC(date, POLL_OPEN_TIME);
  const closesAt = pollTimestampUTC(date, POLL_CLOSE_TIME);

  const [poll] = await db
    .insert(polls)
    .values({ date, status: "open", opensAt, closesAt })
    .returning();

  await db.insert(pollCandidates).values(
    activePlaces.map((p) => ({ pollId: poll.id, placeId: p.id }))
  );

  const appUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  await notifyPollOpen(appUrl);

  return NextResponse.json({ message: "Poll created", id: poll.id });
}
