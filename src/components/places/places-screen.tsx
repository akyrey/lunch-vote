"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { VisitBadge } from "@/components/ui/visit-badge";
import { DietBadge } from "@/components/ui/diet-badge";
import { placeGradient } from "@/lib/utils";
import type { Place } from "@/lib/db/schema";

const FILTERS = ["All", "$", "$$", "$$$", "Vegan", "< 5 min"] as const;
type Filter = (typeof FILTERS)[number];

interface Props {
  places: Place[];
  isAdmin: boolean;
}

export function PlacesScreen({ places, isAdmin }: Props) {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const filtered = places.filter((p) => {
    const matchesFilter =
      filter === "All"
        ? true
        : filter === "Vegan"
          ? (p.dietaryFlags as string[]).includes("vegan")
          : filter === "< 5 min"
            ? p.walkingMinutes < 5
            : p.priceTier === filter;

    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cuisine.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags as string[]).some((t) =>
        t.toLowerCase().includes(search.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-[58px] pb-2">
        <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent">
          All spots
        </div>
        <div className="font-display font-bold text-[31px] text-ink mt-[5px] leading-[1.04] tracking-[-0.02em]">
          Places
        </div>
        <div className="text-[14px] text-mut mt-[6px]">
          {places.length} places
          {isAdmin && " · admins can add & edit"}
        </div>
      </div>

      <div className="px-5 pt-3 pb-7">
        {/* Search */}
        <div className="flex items-center gap-[9px] bg-card border border-line rounded-[13px] px-[14px] py-[11px] mb-3">
          <Search size={18} color="#A89A8B" strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search places, cuisine, tags…"
            className="flex-1 border-none outline-none bg-transparent text-[14.5px] text-ink placeholder-mut2 font-body"
          />
        </div>

        {/* Filter chips */}
        <div
          className="flex gap-[7px] overflow-x-auto -mx-5 px-5 pb-[2px] mb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-shrink-0 border-none cursor-pointer px-[14px] py-[8px] rounded-full font-body font-bold text-[13px] transition-all"
              style={{
                background: filter === f ? "#221A14" : "#fff",
                color: filter === f ? "#fff" : "#857667",
                boxShadow:
                  filter === f ? "none" : "inset 0 0 0 1px rgba(34,26,20,0.10)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Place list */}
        <div className="flex flex-col gap-[11px]">
          {filtered.map((place) => (
            <Link
              key={place.id}
              href={`/places/${place.id}`}
              className="bg-card rounded-card border border-line2 shadow-card p-3 flex gap-[13px] items-center cursor-pointer"
            >
              {/* Thumbnail */}
              <div
                className="w-[58px] h-[58px] rounded-[13px] flex-shrink-0 relative overflow-hidden flex items-center justify-center"
                style={{ background: placeGradient(place.colorHue) }}
              >
                <span className="font-display font-bold text-[24px] text-white/90">
                  {place.name[0]}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[7px] mb-[3px]">
                  <span className="font-display font-bold text-[16px] text-ink truncate">
                    {place.name}
                  </span>
                  {!place.isActive && (
                    <span className="text-[10px] font-bold text-mut2 border border-line rounded-[5px] px-[5px] py-[1px] whitespace-nowrap">
                      inactive
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-mut flex items-center gap-[7px]">
                  <span>{place.cuisine}</span>
                  <span>·</span>
                  <span className="font-bold tracking-[.04em]">
                    <span className="text-accent">{place.priceTier}</span>
                    <span style={{ color: "rgba(34,26,20,0.10)" }}>
                      {"$$$".slice(place.priceTier.length)}
                    </span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-[3px]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A89A8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="13" cy="4.5" r="2" fill="#A89A8B" stroke="none" />
                      <path d="M12.5 8l-1.5 5 2.5 2 1 5M12.5 8l3 1.5 1.5 3M11 13l-2 4.5" />
                    </svg>
                    {place.walkingMinutes}m
                  </span>
                </div>
                <div className="flex items-center gap-[6px] mt-[7px]">
                  <VisitBadge lastVisitedAt={place.lastVisitedAt} />
                  {(place.dietaryFlags as string[]).length > 0 && (
                    <span className="flex gap-1">
                      {(place.dietaryFlags as string[]).map((d) => (
                        <DietBadge key={d} flag={d} />
                      ))}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight size={18} color="#A89A8B" strokeWidth={2} />
            </Link>
          ))}

          {filtered.length === 0 && (
            <p className="text-mut text-center py-8 text-[14px]">
              No places match your filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
