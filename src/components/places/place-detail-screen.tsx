"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ExternalLink,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DietBadge } from "@/components/ui/diet-badge";
import { placeGradient } from "@/lib/utils";
import type { Place } from "@/lib/db/schema";

interface Props {
  place: Place;
  isAdmin: boolean;
  winRate: number;
  wins: number;
  appearances: number;
  daysAgoVisited: number | null;
}

export function PlaceDetailScreen({
  place,
  isAdmin,
  winRate,
  wins,
  appearances,
  daysAgoVisited,
}: Props) {
  const router = useRouter();
  const isRecent = daysAgoVisited !== null && daysAgoVisited <= 7;

  return (
    <div>
      {/* Hero */}
      <div
        className="relative h-[188px] flex items-end px-5 pb-4"
        style={{ background: placeGradient(place.colorHue) }}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-[54px] left-5 w-[38px] h-[38px] rounded-[11px] border-none bg-white/90 flex items-center justify-center cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft size={19} color="#221A14" strokeWidth={2.2} />
        </button>

        {place.tags && (place.tags as string[]).includes("firstWin") && (
          <span
            className="absolute top-[58px] right-5 flex items-center gap-[5px] text-[11.5px] font-bold text-gold bg-white rounded-full px-[10px] py-[5px]"
          >
            <Sparkles size={14} color="#C98A1E" />
            First-win spot
          </span>
        )}

        <div>
          <div className="text-[12.5px] font-bold text-white/85 tracking-[.04em]">
            {place.cuisine.toUpperCase()}
          </div>
          <div
            className="font-display font-bold text-[28px] text-white leading-[1.05] mt-[2px]"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,.25)" }}
          >
            {place.name}
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-7">
        {/* Recently visited banner */}
        {isRecent && (
          <div className="flex items-center gap-2 text-[13px] font-semibold text-accent-dk bg-accent-bg rounded-[11px] px-[12px] py-[9px] mb-[14px]">
            <Clock size={16} color="#B53B20" strokeWidth={2.2} />
            We went here {daysAgoVisited} days ago
          </div>
        )}

        {/* Quick stats row */}
        <div className="flex items-center gap-3 mb-[14px]">
          <span className="font-bold text-[17px] tracking-[.04em]">
            <span className="text-accent">{place.priceTier}</span>
            <span style={{ color: "rgba(34,26,20,0.10)" }}>
              {"$$$".slice(place.priceTier.length)}
            </span>
          </span>
          <span style={{ color: "rgba(34,26,20,0.10)" }}>|</span>
          {place.avgPrice && (
            <>
              <span className="text-[14.5px] font-semibold text-ink">
                €{place.avgPrice} avg
              </span>
              <span style={{ color: "rgba(34,26,20,0.10)" }}>|</span>
            </>
          )}
          <span className="flex items-center gap-[5px] text-[14.5px] font-semibold text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#857667" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13" cy="4.5" r="2" fill="#857667" stroke="none" />
              <path d="M12.5 8l-1.5 5 2.5 2 1 5M12.5 8l3 1.5 1.5 3M11 13l-2 4.5" />
            </svg>
            {place.walkingMinutes} min
          </span>
        </div>

        {/* Dietary badges */}
        {(place.dietaryFlags as string[]).length > 0 && (
          <div className="flex gap-[6px] mb-[14px]">
            {(place.dietaryFlags as string[]).map((d) => (
              <DietBadge key={d} flag={d} />
            ))}
          </div>
        )}

        {/* Stats card */}
        <div className="bg-card rounded-card border border-line2 shadow-card flex mb-[14px] p-[8px_4px]">
          <div className="flex-1 text-center">
            <div className="font-display font-bold text-[20px] text-ink">
              {wins}
            </div>
            <div className="text-[11.5px] text-mut mt-[2px]">wins</div>
          </div>
          <div className="w-px bg-line2 my-1" />
          <div className="flex-1 text-center">
            <div className="font-display font-bold text-[20px] text-ink">
              {winRate}%
            </div>
            <div className="text-[11.5px] text-mut mt-[2px]">win rate</div>
          </div>
          <div className="w-px bg-line2 my-1" />
          <div className="flex-1 text-center">
            <div className="font-display font-bold text-[20px] text-ink">
              {daysAgoVisited === null
                ? "never"
                : `${daysAgoVisited}d`}
            </div>
            <div className="text-[11.5px] text-mut mt-[2px]">last visit</div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-[11px] mb-4">
          {place.address && (
            <div className="flex items-center gap-[11px] text-[14.5px] text-ink">
              <MapPin size={18} color="#857667" strokeWidth={2} />
              {place.address}
            </div>
          )}
          {place.openingHours && (
            <div className="flex items-center gap-[11px] text-[14.5px] text-ink">
              <Clock size={18} color="#857667" strokeWidth={2} />
              Open {place.openingHours}
            </div>
          )}
          {(place.tags as string[]).length > 0 && (
            <div className="flex flex-wrap gap-[7px]">
              {(place.tags as string[]).map((tag) => (
                <span
                  key={tag}
                  className="text-[12.5px] font-semibold text-mut bg-soft rounded-[8px] px-[10px] py-1"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-[10px] mb-3">
          {place.mapUrl && (
            <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button kind="outline" full icon={<MapPin size={19} color="#221A14" strokeWidth={2} />}>
                Open map
              </Button>
            </a>
          )}
          {place.menuUrl && (
            <a href={place.menuUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button kind="outline" full icon={<ExternalLink size={19} color="#221A14" strokeWidth={2} />}>
                Menu
              </Button>
            </a>
          )}
        </div>

        {/* Admin hint */}
        {isAdmin && (
          <div className="flex items-center justify-center gap-[7px] text-[12.5px] text-mut2 mt-1">
            <Zap size={14} color="#E0512F" strokeWidth={2.1} />
            <a href={`/admin/places/${place.id}`} className="text-accent font-semibold">
              Edit or deactivate this place
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
