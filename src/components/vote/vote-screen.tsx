"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TapRankList } from "./tap-rank-list";
import { DragRankList } from "./drag-rank-list";
import { submitBallot } from "@/lib/actions";
import type { Place } from "@/lib/db/schema";

type VoteStyle = "tap" | "drag";

interface VoteScreenProps {
  pollId: number;
  candidates: Place[];
  isCheckedIn: boolean;
  existingRanking: number[];
}

export function VoteScreen({
  pollId,
  candidates,
  isCheckedIn,
  existingRanking,
}: VoteScreenProps) {
  const router = useRouter();
  const [voteStyle, setVoteStyle] = useState<VoteStyle>("tap");
  const [tapRanking, setTapRanking] = useState<number[]>(existingRanking);
  const [dragOrder, setDragOrder] = useState<number[]>(
    existingRanking.length > 0
      ? existingRanking
      : candidates.map((c) => c.id)
  );
  const [isPending, startTransition] = useTransition();

  const canSubmit = voteStyle === "tap" ? tapRanking.length > 0 : true;

  function handleSubmit() {
    const ranking = voteStyle === "tap" ? tapRanking : dragOrder;
    startTransition(async () => {
      await submitBallot(pollId, ranking);
      router.push("/results");
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-[56px] pb-[6px] flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="border border-line bg-card rounded-[11px] w-[38px] h-[38px] flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={19} color="#221A14" strokeWidth={2.2} />
        </button>
        <div>
          <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent">
            Your ballot
          </div>
          <div className="font-display font-bold text-[25px] text-ink leading-none mt-[3px]">
            Rank your picks
          </div>
        </div>
      </div>

      <div className="px-5 pt-3 pb-7">
        {/* Style switcher */}
        <div className="flex gap-1 bg-soft rounded-[13px] p-1 mb-2">
          {(["tap", "drag"] as const).map((style) => (
            <button
              key={style}
              onClick={() => setVoteStyle(style)}
              className="flex-1 py-[9px] px-[6px] rounded-[10px] font-body font-bold text-[13.5px] cursor-pointer border-none transition-all duration-150"
              style={{
                background: voteStyle === style ? "#fff" : "transparent",
                color: voteStyle === style ? "#221A14" : "#857667",
                boxShadow:
                  voteStyle === style
                    ? "0 1px 3px rgba(34,26,20,.12)"
                    : "none",
              }}
            >
              {style === "tap" ? "Tap to rank" : "Drag to reorder"}
            </button>
          ))}
        </div>

        {/* Helper copy */}
        <p className="text-[13px] text-mut mb-[14px] leading-[1.45]">
          {voteStyle === "tap"
            ? "Tap spots in order of preference. You can rank just a few — the rest count last."
            : "Drag (or nudge) to set your order. All six count, top to bottom."}
        </p>

        {/* Candidate list */}
        {voteStyle === "tap" ? (
          <TapRankList
            candidates={candidates}
            ranking={tapRanking}
            onChange={setTapRanking}
          />
        ) : (
          <DragRankList
            candidates={candidates}
            order={dragOrder}
            onChange={setDragOrder}
          />
        )}

        {/* Submit */}
        <div className="mt-[18px]">
          <Button
            disabled={!canSubmit || isPending}
            icon={
              canSubmit ? (
                <CheckCircle2 size={19} color="#fff" strokeWidth={2.2} />
              ) : undefined
            }
            onClick={handleSubmit}
          >
            {isPending
              ? "Submitting…"
              : canSubmit
                ? "Submit ballot"
                : "Rank at least one spot"}
          </Button>
        </div>

        <p className="text-center text-[12px] text-mut2 mt-[10px]">
          {isCheckedIn
            ? "Submitting as you · counts in today's tally"
            : "You're not checked in — this ballot won't count"}
        </p>
      </div>
    </div>
  );
}
