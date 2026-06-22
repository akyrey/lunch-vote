import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ── Auth.js adapter tables ─────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    uniqueIndex("accounts_provider_account_idx").on(
      t.provider,
      t.providerAccountId
    ),
  ]
);

export const sessions = sqliteTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    uniqueIndex("vt_identifier_token_idx").on(t.identifier, t.token),
  ]
);

// ── App tables ─────────────────────────────────────────────────────────────

export const places = sqliteTable("places", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address"),
  mapUrl: text("map_url"),
  cuisine: text("cuisine").notNull(),
  priceTier: text("price_tier", { enum: ["$", "$$", "$$$"] }).notNull(),
  avgPrice: real("avg_price"),
  walkingMinutes: integer("walking_minutes").notNull().default(0),
  dietaryFlags: text("dietary_flags", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  openingHours: text("opening_hours"),
  menuUrl: text("menu_url"),
  photoUrl: text("photo_url"),
  colorHue: integer("color_hue").notNull().default(0),
  tags: text("tags", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastVisitedAt: integer("last_visited_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const polls = sqliteTable(
  "polls",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(), // YYYY-MM-DD
    status: text("status", { enum: ["open", "closed"] })
      .notNull()
      .default("open"),
    opensAt: integer("opens_at", { mode: "timestamp_ms" }).notNull(),
    closesAt: integer("closes_at", { mode: "timestamp_ms" }).notNull(),
    winningPlaceId: integer("winning_place_id").references(() => places.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("polls_date_idx").on(t.date)]
);

export const pollCandidates = sqliteTable(
  "poll_candidates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pollId: integer("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    placeId: integer("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("poll_candidates_poll_place_idx").on(t.pollId, t.placeId),
    index("poll_candidates_poll_idx").on(t.pollId),
  ]
);

export const attendance = sqliteTable(
  "attendance",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pollId: integer("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    checkedInAt: integer("checked_in_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("attendance_poll_user_idx").on(t.pollId, t.userId),
    index("attendance_poll_idx").on(t.pollId),
  ]
);

export const ballots = sqliteTable(
  "ballots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pollId: integer("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("ballots_poll_user_idx").on(t.pollId, t.userId),
    index("ballots_poll_idx").on(t.pollId),
  ]
);

export const ballotRankings = sqliteTable(
  "ballot_rankings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ballotId: integer("ballot_id")
      .notNull()
      .references(() => ballots.id, { onDelete: "cascade" }),
    placeId: integer("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(), // 1 = top choice
  },
  (t) => [
    index("ballot_rankings_ballot_idx").on(t.ballotId),
    uniqueIndex("ballot_rankings_ballot_place_idx").on(t.ballotId, t.placeId),
  ]
);

// ── Gamification ───────────────────────────────────────────────────────────

export const points = sqliteTable(
  "points",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pollId: integer("poll_id").references(() => polls.id, {
      onDelete: "set null",
    }),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(), // 'check_in' | 'vote' | 'top_pick_won'
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("points_user_idx").on(t.userId)]
);

// ── Types ──────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Place = typeof places.$inferSelect;
export type Poll = typeof polls.$inferSelect;
export type PollCandidate = typeof pollCandidates.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Ballot = typeof ballots.$inferSelect;
export type BallotRanking = typeof ballotRankings.$inferSelect;
export type Points = typeof points.$inferSelect;
