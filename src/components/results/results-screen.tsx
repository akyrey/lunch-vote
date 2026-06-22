"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Zap, Sparkles, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { placeGradient } from "@/lib/utils";
import type { Place, Poll } from "@/lib/db/schema";
import type { IrvRound } from "@/lib/irv";

interface ResultsScreenProps {
  poll: Poll;
  candidates: Place[];
  rounds: IrvRound[];
  winner: number | null;
  winnerPlace: Place | null;
  userTopPick: number | null;
  totalBallots: number;
}

export function ResultsScreen({
  poll,
  candidates,
  rounds,
  winner,
  winnerPlace,
  userTopPick,
  totalBallots,
}: ResultsScreenProps) {
  const router = useRouter();
  const [revealRound, setRevealRound] = useState(0);
  const [revealDone, setRevealDone] = useState(
    rounds.length <= 1 || poll.status === "closed"
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startReveal() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (rounds.length <= 1) {
      setRevealDone(true);
      return;
    }
    setRevealRound(0);
    setRevealDone(false);
    intervalRef.current = setInterval(() => {
      setRevealRound((prev) => {
        const next = prev + 1;
        if (next >= rounds.length - 1) {
          clearInterval(intervalRef.current!);
          setTimeout(() => setRevealDone(true), 100);
          return rounds.length - 1;
        }
        return next;
      });
    }, 1500);
  }

  useEffect(() => {
    if (rounds.length > 1 && poll.status !== "closed") startReveal();
    else setRevealDone(true);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function replay() {
    startReveal();
  }

  const ri = Math.min(revealRound, rounds.length - 1);
  const round = rounds[ri];
  const wonMine = winner !== null && userTopPick === winner;

  if (!round) {
    return (
      <div className="px-5 pt-14 pb-8">
        <p className="text-mut">No results yet. Check back after the poll closes.</p>
      </div>
    );
  }

  const candidateOrder = candidates.map((c) => c.id);
  const placeMap = new Map(candidates.map((p) => [p.id, p]));

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-[58px] pb-2">
        <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent">
          Live tally
        </div>
        <div className="font-display font-bold text-[31px] text-ink mt-[5px] leading-[1.04] tracking-[-0.02em]">
          Instant-runoff
        </div>
      </div>

      <div className="px-5 pt-[10px] pb-7">
        {/* Winner banner */}
        {revealDone && winnerPlace && (
          <Card
            className="p-[18px] mb-4 relative overflow-hidden animate-lvpop"
            style={{
              border: "1.5px solid #2F7D52",
              background: "#E5F0E6",
            }}
          >
            {/* Confetti */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span
                key={i}
                className="absolute animate-lvconf rounded-[2px]"
                style={{
                  top: -6,
                  left: `${8 + i * 12}%`,
                  width: 7,
                  height: 11,
                  background: ["#E0512F", "#C98A1E", "#2F7D52", "#3E72A8"][i % 4],
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${1.1 + i * 0.13}s`,
                }}
              />
            ))}

            <div className="flex items-center gap-[7px] text-[12px] font-bold text-green tracking-[.06em]">
              <Trophy size={16} color="#2F7D52" strokeWidth={2.1} />
              TODAY'S WINNER
            </div>

            <div className="flex items-center gap-[13px] mt-[10px]">
              <div
                className="w-[54px] h-[54px] rounded-[14px] flex-shrink-0"
                style={{ background: placeGradient(winnerPlace.colorHue) }}
              />
              <div className="flex-1">
                <div className="font-display font-bold text-[23px] text-ink leading-[1.05]">
                  {winnerPlace.name}
                </div>
                <div className="text-[13px] text-mut mt-[2px]">
                  {winnerPlace.cuisine} · {winnerPlace.walkingMinutes} min walk
                </div>
              </div>
            </div>

            <div
              className="mt-[13px] text-[13px] rounded-[10px] p-[9px_12px]"
              style={{ color: "#3a4a3f", background: "rgba(47,125,82,.1)" }}
            >
              Marked as today's spot · last-visited updated to today
            </div>

            {wonMine && (
              <div className="mt-2 flex items-center gap-[7px] text-[13px] font-bold text-gold">
                <Sparkles size={16} color="#C98A1E" />
                +15 points — your top pick won!
              </div>
            )}
          </Card>
        )}

        {/* Round stepper */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-[5px]">
            {rounds.map((_, i) => (
              <div
                key={i}
                className="h-[8px] rounded-[6px] transition-all duration-300"
                style={{
                  width: i === ri ? 22 : 8,
                  background:
                    i === ri ? "#E0512F" : i < ri ? "#D6BBAE" : "#F4ECE0",
                }}
              />
            ))}
          </div>
          <div className="text-[13px] font-bold text-mut">
            Round {ri + 1} / {rounds.length}
          </div>
        </div>

        {/* Round caption */}
        <div
          className="min-h-[38px] text-[13.5px] leading-[1.4] text-ink rounded-[12px] px-[13px] py-[10px] mb-[14px] flex items-center gap-2"
          style={{ background: round.isTieBreak ? "#FBF0D8" : "#F4ECE0" }}
        >
          {round.isTieBreak && (
            <Zap size={16} color="#C98A1E" className="flex-shrink-0" />
          )}
          {round.caption}
        </div>

        {/* Bars */}
        <Card className="p-[16px_16px_12px] relative">
          <div className="relative">
            {candidateOrder.map((id) => {
              const place = placeMap.get(id);
              if (!place) return null;
              const active = round.standing.includes(id);
              const cnt = active ? (round.tallies[id] ?? 0) : 0;
              const isElim = id === round.eliminated;
              const isWin = id === round.winner;
              const pct =
                round.totalBallots > 0
                  ? Math.round((cnt / round.totalBallots) * 100)
                  : 0;
              const barColor = isWin
                ? "#2F7D52"
                : isElim
                  ? "#C97A66"
                  : "#E0512F";

              return (
                <div
                  key={id}
                  className="mb-[11px] transition-opacity duration-[400ms]"
                  style={{ opacity: active ? 1 : 0.4 }}
                >
                  <div className="flex justify-between items-center gap-2 mb-[5px]">
                    <span
                      className="text-[13.5px] font-bold flex-1 min-w-0 truncate"
                      style={{
                        color: isElim ? "#857667" : "#221A14",
                        textDecoration: !active ? "line-through" : "none",
                      }}
                    >
                      {place.name}
                      {isWin && (
                        <span className="ml-[6px] text-green">✓</span>
                      )}
                    </span>
                    <span
                      className="text-[13px] font-bold flex-shrink-0"
                      style={{ color: active ? "#221A14" : "#A89A8B" }}
                    >
                      {active ? cnt : "out"}
                    </span>
                  </div>
                  <div className="h-[9px] rounded-[6px] bg-soft overflow-hidden">
                    <div
                      className="h-full rounded-[6px] transition-all duration-[800ms]"
                      style={{
                        width: `${active ? Math.max(pct, pct > 0 ? 3 : 0) : 0}%`,
                        background: barColor,
                        transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Majority line */}
            <div
              className="absolute top-[-2px] bottom-[8px]"
              style={{
                left: "calc(50% + 2px)",
                width: 2,
                borderLeft: "2px dashed #A89A8B",
                opacity: 0.5,
              }}
            />
          </div>
          <div className="text-right text-[11px] text-mut2 font-semibold mt-[2px]">
            majority = {round.majority} votes
          </div>
        </Card>

        {/* Controls */}
        <div className="flex gap-[10px] mt-[14px]">
          <Button kind="ghost" onClick={replay} full>
            <RotateCcw size={16} color="#221A14" className="mr-1" />
            Replay
          </Button>
          <Button kind="outline" onClick={() => router.push("/vote")} full>
            Edit ballot
          </Button>
        </div>
      </div>
    </div>
  );
}
