"use client";

import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { placeGradient } from "@/lib/utils";
import type { Place } from "@/lib/db/schema";

interface Props {
  candidates: Place[];
  ranking: number[];
  onChange: (ranking: number[]) => void;
}

export function TapRankList({ candidates, ranking, onChange }: Props) {
  function toggle(id: number) {
    const idx = ranking.indexOf(id);
    if (idx >= 0) {
      onChange(ranking.filter((r) => r !== id));
    } else {
      onChange([...ranking, id]);
    }
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {candidates.map((place) => {
        const rank = ranking.indexOf(place.id);
        const ranked = rank >= 0;
        return (
          <button
            key={place.id}
            onClick={() => toggle(place.id)}
            className="flex items-center gap-[13px] p-[12px_14px] rounded-card border cursor-pointer text-left w-full transition-all duration-150"
            style={{
              background: ranked ? "#FBE7DF" : "#fff",
              border: ranked
                ? "1.5px solid #E0512F"
                : "1px solid rgba(34,26,20,0.06)",
              boxShadow: "0 1px 2px rgba(34,26,20,.05)",
            }}
          >
            {/* Rank badge */}
            <div
              className="w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center font-display font-bold text-[16px] transition-all duration-150"
              style={{
                background: ranked ? "#E0512F" : "#fff",
                color: ranked ? "#fff" : "#A89A8B",
                border: ranked ? "none" : "2px solid rgba(34,26,20,0.10)",
              }}
            >
              {ranked ? rank + 1 : ""}
            </div>

            {/* Thumbnail */}
            <div
              className="w-[38px] h-[38px] rounded-[10px] flex-shrink-0"
              style={{ background: placeGradient(place.colorHue) }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[15px] text-ink truncate">
                {place.name}
              </div>
              <div className="text-[12.5px] text-mut flex items-center gap-[6px] mt-[1px]">
                <span>{place.cuisine}</span>
                <span>·</span>
                <span className="font-bold tracking-[.04em]">
                  <span className="text-accent">{place.priceTier}</span>
                  <span style={{ color: "rgba(34,26,20,0.10)" }}>
                    {"$$$".slice(place.priceTier.length)}
                  </span>
                </span>
              </div>
            </div>

            {ranked ? (
              <X size={18} color="#E0512F" strokeWidth={2.2} />
            ) : (
              <span className="text-[13px] font-bold text-mut2">Tap</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
