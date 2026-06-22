"use client";

import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { placeGradient } from "@/lib/utils";
import type { Place } from "@/lib/db/schema";

interface Props {
  candidates: Place[];
  order: number[];
  onChange: (order: number[]) => void;
}

export function DragRankList({ candidates, order, onChange }: Props) {
  const placeMap = new Map(candidates.map((c) => [c.id, c]));

  function move(id: number, dir: -1 | 1) {
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-[9px]">
      {order.map((id, i) => {
        const place = placeMap.get(id);
        if (!place) return null;
        return (
          <div
            key={id}
            className="flex items-center gap-[11px] bg-card rounded-card border border-line2 shadow-card p-[11px_12px_11px_14px]"
          >
            {/* Grip */}
            <span className="text-mut2 flex cursor-grab">
              <GripVertical size={20} color="#A89A8B" strokeWidth={1.9} />
            </span>

            {/* Position badge */}
            <div
              className="w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center font-display font-bold text-[15px]"
              style={{
                background: i === 0 ? "#E0512F" : "#F4ECE0",
                color: i === 0 ? "#fff" : "#221A14",
              }}
            >
              {i + 1}
            </div>

            {/* Thumbnail */}
            <div
              className="w-[34px] h-[34px] rounded-[9px] flex-shrink-0"
              style={{ background: placeGradient(place.colorHue) }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14.5px] text-ink truncate">
                {place.name}
              </div>
              <div className="text-[12px] text-mut">{place.cuisine}</div>
            </div>

            {/* Nudge buttons */}
            <div className="flex flex-col gap-[2px]">
              <button
                onClick={() => move(id, -1)}
                disabled={i === 0}
                className="border-none bg-transparent p-[2px] cursor-pointer disabled:cursor-default disabled:opacity-25"
              >
                <ChevronUp size={18} color="#221A14" strokeWidth={2.2} />
              </button>
              <button
                onClick={() => move(id, 1)}
                disabled={i === order.length - 1}
                className="border-none bg-transparent p-[2px] cursor-pointer disabled:cursor-default disabled:opacity-25"
              >
                <ChevronDown size={18} color="#221A14" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
