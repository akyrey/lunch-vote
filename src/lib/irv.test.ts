import { describe, it, expect } from "vitest";
import {
  runIrv,
  leastRecent,
  mostRecent,
  effectiveAge,
  type Candidate,
} from "./irv";

const day = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const c = (id: number, daysAgo: number | null): Candidate => ({
  id,
  lastVisitedAt: daysAgo === null ? null : day(daysAgo),
});

// ── effectiveAge ────────────────────────────────────────────────────────────

describe("effectiveAge", () => {
  it("returns Infinity for never-visited places", () => {
    expect(effectiveAge(c(1, null))).toBe(Infinity);
  });

  it("returns approximately n for a place visited n days ago", () => {
    const age = effectiveAge(c(1, 10));
    expect(age).toBeGreaterThan(9.9);
    expect(age).toBeLessThan(10.1);
  });
});

// ── leastRecent ─────────────────────────────────────────────────────────────

describe("leastRecent", () => {
  it("favors never-visited places", () => {
    const cands = [c(1, 5), c(2, null), c(3, 10)];
    expect(leastRecent([1, 2, 3], cands)).toBe(2);
  });

  it("favors older visits among visited places", () => {
    const cands = [c(1, 5), c(2, 20), c(3, 3)];
    expect(leastRecent([1, 2, 3], cands)).toBe(2);
  });

  it("returns stable result on equal ages (lower id wins)", () => {
    const visited = day(7);
    const cands = [
      { id: 1, lastVisitedAt: visited },
      { id: 2, lastVisitedAt: visited },
    ];
    expect(leastRecent([1, 2], cands)).toBe(1);
  });
});

// ── mostRecent ──────────────────────────────────────────────────────────────

describe("mostRecent", () => {
  it("picks the most recently visited", () => {
    const cands = [c(1, 5), c(2, 20), c(3, 3)];
    expect(mostRecent([1, 2, 3], cands)).toBe(3);
  });

  it("never-visited is considered oldest, not most recent", () => {
    const cands = [c(1, 2), c(2, null), c(3, 8)];
    expect(mostRecent([1, 2, 3], cands)).toBe(1);
  });
});

// ── runIrv ──────────────────────────────────────────────────────────────────

describe("runIrv — basic", () => {
  it("picks the majority winner in one round", () => {
    const cands = [c(1, 10), c(2, 5), c(3, 3)];
    const ballots = [
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
      [2, 1, 3],
      [3, 2, 1],
    ];
    const result = runIrv(ballots, cands);
    expect(result.winner).toBe(1);
    expect(result.rounds).toHaveLength(1);
  });

  it("eliminates and redistributes correctly", () => {
    // 7 ballots, majority = 4
    // Round 1: 1=2, 2=2, 3=3 → no majority (3<4), eliminate 1 or 2 (tied at 2)
    // 1 visited 10d ago, 2 visited 5d ago → mostRecent=2 → 2 eliminated
    // Round 2: after redistribution, 3 gets more votes
    const cands = [c(1, 10), c(2, 5), c(3, 3)];
    const ballots = [
      [3, 1, 2],
      [3, 1, 2],
      [3, 2, 1],
      [1, 3, 2], // 1 then 3
      [1, 3, 2],
      [2, 3, 1], // 2 then 3
      [2, 3, 1],
    ];
    // Round 1: 3=3, 1=2, 2=2 — no majority (need 4), 1&2 tie at 2
    // mostRecent(1,2) = 2 (visited 5d vs 10d) → 2 eliminated
    // Round 2: 1's 2 votes + 2's redistributed 2 → 3=3, 1=2, 2→3 = 5 → wait
    // Actually: ballots [2,3,1] → top of standing (1,3) = 3; so 3 gets both
    // Round 2: 3=3+2=5, 1=2 → 3 wins (5 ≥ 4)
    const result = runIrv(ballots, cands);
    expect(result.winner).toBe(3);
    expect(result.rounds.length).toBeGreaterThanOrEqual(2);
  });

  it("handles single candidate", () => {
    const cands = [c(1, 5)];
    const ballots = [[1], [1], [1]];
    const result = runIrv(ballots, cands);
    expect(result.winner).toBe(1);
  });

  it("handles no ballots — winner by tie-break (least recently visited)", () => {
    const cands = [c(1, 5), c(2, null), c(3, 10)]; // 2 = never visited = oldest
    const result = runIrv([], cands);
    expect(result.winner).toBe(2);
  });
});

// ── runIrv — prototype ballots (exact match from design spec) ───────────────

describe("runIrv — prototype scenario", () => {
  // From design README:
  // Places 1-6 are candidates with days since last visit: 11, 3, 24, 18, 6, 14
  // Team ballots as specified
  // Expected winner: Mercato Centrale (place 5)

  const candidates: Candidate[] = [
    c(1, 11), // Trattoria da Enzo
    c(2, 3),  // Pizzeria ai Marmi
    c(3, 24), // Bonci Pizzarium
    c(4, 18), // Sushi Sen
    c(5, 6),  // Mercato Centrale
    c(6, 14), // Ginger Sapori
  ];

  const teamBallots: number[][] = [
    [2, 3, 1, 5, 6, 4], // Giulia
    [2, 1, 5, 3, 6, 4], // Luca
    [2, 5, 1, 3, 4, 6], // Sofia
    [5, 6, 1, 2, 3, 4], // Matteo
    [5, 1, 2, 6, 4, 3], // Chiara
    [1, 2, 5, 3, 6, 4], // Lorenzo
    [1, 5, 2, 6, 4, 3], // Aurora
    [3, 2, 5, 1, 4, 6], // Davide
    [6, 5, 1, 2, 4, 3], // Elena
    [4, 5, 1, 2, 6, 3], // Francesco
  ];

  it("produces Mercato Centrale as winner with 10 team ballots", () => {
    const result = runIrv(teamBallots, candidates);
    expect(result.winner).toBe(5);
  });

  it("has multiple rounds (not a first-round majority)", () => {
    const result = runIrv(teamBallots, candidates);
    expect(result.rounds.length).toBeGreaterThan(1);
  });

  it("final round has winner set and eliminated null", () => {
    const result = runIrv(teamBallots, candidates);
    const finalRound = result.rounds[result.rounds.length - 1];
    expect(finalRound.winner).toBe(5);
    expect(finalRound.eliminated).toBeNull();
  });

  it("first round has no winner and has an eliminated candidate", () => {
    const result = runIrv(teamBallots, candidates);
    const firstRound = result.rounds[0];
    expect(firstRound.winner).toBeNull();
    expect(firstRound.eliminated).not.toBeNull();
  });
});

// ── runIrv — tie-break scenarios ───────────────────────────────────────────

describe("runIrv — tie-breaks", () => {
  it("winner tie: least-recently-visited among tied winners", () => {
    // Two candidates each get 50% — tie-break favors older
    const cands = [c(1, 5), c(2, 20)]; // 2 is older
    const ballots = [
      [1, 2],
      [2, 1],
    ];
    const result = runIrv(ballots, cands);
    expect(result.winner).toBe(2);
  });

  it("elimination tie: most-recently-visited gets eliminated", () => {
    // Place 3 visited 2 days ago, place 4 visited 30 days ago — both get 0 first-choice votes
    // 3 is more recent → gets eliminated first
    const cands = [c(1, 10), c(2, 8), c(3, 2), c(4, 30)];
    const ballots = [
      [1, 3, 4, 2], // 2 first-choice votes for 1
      [1, 4, 3, 2],
      [2, 3, 4, 1], // 2 first-choice votes for 2
      [2, 4, 3, 1],
      // 3 and 4 each get 0 first-choice → tie; 3 (2d) is most recent → eliminated
    ];
    const result = runIrv(ballots, cands);
    // First round should eliminate 3 (most recently visited of the tied pair)
    const firstRound = result.rounds[0];
    expect(firstRound.eliminated).toBe(3);
    expect(firstRound.isTieBreak).toBe(true);
  });

  it("never-visited place wins winner tie over recently-visited", () => {
    const cands = [c(1, 5), c(2, null)]; // 2 = never visited
    const ballots = [
      [1, 2],
      [2, 1],
    ];
    const result = runIrv(ballots, cands);
    expect(result.winner).toBe(2);
  });
});

// ── runIrv — edge cases ────────────────────────────────────────────────────

describe("runIrv — edge cases", () => {
  it("handles partial ballots (some voters skip candidates)", () => {
    const cands = [c(1, 10), c(2, 5), c(3, 3)];
    const ballots = [
      [1], // only voted for 1
      [2, 3], // skipped 1
      [1, 2],
      [3],
      [1],
    ];
    const result = runIrv(ballots, cands);
    expect(result.winner).toBeDefined();
    expect([1, 2, 3]).toContain(result.winner);
  });

  it("ballots with unrelated ids (unknown candidates) are skipped gracefully", () => {
    const cands = [c(1, 5), c(2, 3)];
    const ballots = [
      [99, 1, 2], // 99 is not a candidate — skipped
      [1, 2],
      [2, 1],
    ];
    const result = runIrv(ballots, cands);
    expect(result.winner).toBeDefined();
  });
});
