"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  BarChart2,
  Clock,
  MapPin,
  Dices,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { placeGradient, daysAgo } from "@/lib/utils";
import { checkIn, checkOut } from "@/lib/actions";
import type { Place, Poll, User } from "@/lib/db/schema";

interface TodayScreenProps {
  poll: Poll;
  candidates: Place[];
  isCheckedIn: boolean;
  hasVoted: boolean;
  attendees: User[];
  userId: string;
  dateDisplay: string;
  pollOpenTime: string;
  pollCloseTime: string;
}

export function TodayScreen({
  poll,
  candidates,
  isCheckedIn: initialCheckedIn,
  hasVoted,
  attendees,
  userId,
  dateDisplay,
  pollOpenTime,
  pollCloseTime,
}: TodayScreenProps) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [isPending, startTransition] = useTransition();
  const [diceSpinning, setDiceSpinning] = useState(false);
  const [dicePick, setDicePick] = useState<Place | null>(null);

  const totalAttendees = attendees.length + (checkedIn ? 1 : 0);
  const isClosed = poll.status === "closed";
  const now = new Date();
  const opensAt = new Date(poll.opensAt);
  const closesAt = new Date(poll.closesAt);
  const isOpen = poll.status === "open";

  const minutesLeft = Math.max(
    0,
    Math.round((closesAt.getTime() - now.getTime()) / 60000)
  );
  const totalMin = (closesAt.getTime() - opensAt.getTime()) / 60000;
  const elapsedMin = Math.max(0, (now.getTime() - opensAt.getTime()) / 60000);
  const progressPct = Math.min(100, Math.round((elapsedMin / totalMin) * 100));

  function toggleCheckIn() {
    startTransition(async () => {
      if (checkedIn) {
        await checkOut(poll.id);
        setCheckedIn(false);
      } else {
        await checkIn(poll.id);
        setCheckedIn(true);
      }
    });
  }

  function rollDice() {
    if (diceSpinning) return;
    const pool = candidates.filter((p) => {
      const d = daysAgo(p.lastVisitedAt);
      return d === null || d > 7;
    });
    if (pool.length === 0) return;
    setDiceSpinning(true);
    setDicePick(null);
    setTimeout(() => {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setDiceSpinning(false);
      setDicePick(pick);
    }, 950);
  }

  return (
    <div>
      {/* Page header */}
      <div className="px-5 pt-[58px] pb-2">
        <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent">
          {dateDisplay}
        </div>
        <div className="font-display font-bold text-[31px] text-ink mt-[5px] leading-[1.04] tracking-[-0.02em]">
          Where to lunch?
        </div>
        <div className="text-[14px] text-mut mt-[6px] leading-[1.45]">
          Poll closes {pollCloseTime}. Rank your picks before then.
        </div>
      </div>

      <div className="px-5 pt-[14px] pb-[30px] flex flex-col gap-[14px]">
        {/* Poll status card */}
        <Card className="p-[18px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[9px]">
              {isOpen && (
                <span className="relative w-[10px] h-[10px] flex-shrink-0">
                  <span className="absolute inset-0 rounded-full bg-green" />
                  <span className="absolute -inset-[3px] rounded-full bg-green animate-lvpulse" />
                </span>
              )}
              <span className="font-display font-bold text-[17px] text-ink">
                {isClosed
                  ? "Poll closed"
                  : isOpen
                    ? "Poll is open"
                    : `Opens at ${pollOpenTime}`}
              </span>
            </div>
            <span
              className="flex items-center gap-[5px] text-[13px] font-semibold text-accent rounded-full px-[11px] py-[5px]"
              style={{ background: "#FBE7DF" }}
            >
              <Clock size={14} color="#E0512F" strokeWidth={2.2} />
              {isClosed ? "closed" : `closes ${pollCloseTime}`}
            </span>
          </div>

          {isOpen && (
            <>
              <div className="mt-[14px] h-[7px] rounded-[6px] bg-soft overflow-hidden">
                <div
                  className="h-full rounded-[6px] bg-accent transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-[7px] flex justify-between text-[11.5px] text-mut2 font-semibold">
                <span>opened {pollOpenTime}</span>
                <span>{minutesLeft} min left</span>
              </div>
            </>
          )}

          {isClosed && poll.winningPlaceId && (
            <div className="mt-3 text-[13px] text-green font-semibold">
              Winner: check results →
            </div>
          )}
        </Card>

        {/* Check-in card */}
        <Card
          className="p-[15px] flex items-center gap-[13px] transition-colors duration-200"
          style={{
            border: checkedIn
              ? "1px solid #2F7D52"
              : "1px solid rgba(34,26,20,0.06)",
            background: checkedIn ? "#E5F0E6" : "#fff",
          }}
        >
          <div
            className="w-[42px] h-[42px] rounded-[12px] flex-shrink-0 flex items-center justify-center transition-colors duration-200"
            style={{
              background: checkedIn ? "#2F7D52" : "#F4ECE0",
              color: checkedIn ? "#fff" : "#857667",
            }}
          >
            {checkedIn ? (
              <CheckCircle2 size={22} color="#fff" strokeWidth={2.2} />
            ) : (
              <MapPin size={22} color="#857667" strokeWidth={2.2} />
            )}
          </div>
          <div className="flex-1">
            <div className="font-bold text-[15px] text-ink">
              {checkedIn ? "You're in the office" : "In the office today?"}
            </div>
            <div
              className="text-[12.5px] mt-[1px]"
              style={{ color: checkedIn ? "#2F7D52" : "#857667" }}
            >
              {checkedIn
                ? "Your ballot will count"
                : "Only checked-in ballots count"}
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={toggleCheckIn}
            disabled={isPending}
            className="relative flex-shrink-0 w-[50px] h-[30px] rounded-full border-none cursor-pointer transition-colors duration-200"
            style={{ background: checkedIn ? "#2F7D52" : "#D9CFC0" }}
            aria-label={checkedIn ? "Check out" : "Check in"}
          >
            <span
              className="absolute top-[3px] w-[24px] h-[24px] rounded-full bg-white transition-all duration-200"
              style={{
                left: checkedIn ? "23px" : "3px",
                boxShadow: "0 1px 3px rgba(0,0,0,.25)",
              }}
            />
          </button>
        </Card>

        {/* Primary CTA */}
        {isClosed ? (
          <Link href="/results">
            <Button icon={<BarChart2 size={19} color="#fff" strokeWidth={2.2} />}>
              See today's result
            </Button>
          </Link>
        ) : !checkedIn ? (
          <Button
            kind="green"
            icon={<CheckCircle2 size={19} color="#fff" strokeWidth={2.2} />}
            onClick={toggleCheckIn}
            disabled={isPending}
          >
            Check in to unlock voting
          </Button>
        ) : !hasVoted ? (
          <Link href="/vote">
            <Button icon={<ChevronRight size={19} color="#fff" strokeWidth={2.2} />}>
              Rank today's {candidates.length} spots
            </Button>
          </Link>
        ) : (
          <Link href="/results">
            <Button icon={<BarChart2 size={19} color="#fff" strokeWidth={2.2} />}>
              See the live runoff
            </Button>
          </Link>
        )}

        {hasVoted && (
          <div className="flex items-center justify-center gap-[7px] text-[13px] text-green font-semibold -mt-[4px]">
            <CheckCircle2 size={16} color="#2F7D52" strokeWidth={2.4} />
            Ballot submitted · +10 points
          </div>
        )}

        {/* Today's lineup */}
        <div className="mt-[6px]">
          <div className="flex justify-between items-baseline mb-[10px]">
            <div className="font-display font-bold text-[16px] text-ink">
              Today's lineup
            </div>
            <div className="text-[12.5px] text-mut2 font-semibold">
              {candidates.length} spots
            </div>
          </div>
          <div
            className="flex gap-[11px] overflow-x-auto pb-[6px] -mx-5 px-5"
            style={{ scrollbarWidth: "none" }}
          >
            {candidates.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="flex-shrink-0 w-[128px] cursor-pointer"
              >
                <div
                  className="h-[80px] rounded-[14px] relative overflow-hidden flex items-end p-[9px]"
                  style={{ background: placeGradient(place.colorHue) }}
                >
                  <span className="absolute top-[8px] right-[8px] text-[10.5px] font-bold text-white rounded-full px-[7px] py-[2px] bg-black/20">
                    {place.priceTier}
                  </span>
                  <span className="font-display font-bold text-[13px] text-white leading-[1.1] drop-shadow-sm">
                    {place.name}
                  </span>
                </div>
                <div className="text-[11.5px] text-mut mt-[6px] flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A89A8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13" cy="4.5" r="2" fill="#A89A8B" stroke="none" />
                    <path d="M12.5 8l-1.5 5 2.5 2 1 5M12.5 8l3 1.5 1.5 3M11 13l-2 4.5" />
                  </svg>
                  {place.walkingMinutes} min · {place.cuisine.split(" ")[0]}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Participation card */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-[15px] text-ink">
                {totalAttendees} of {attendees.length + 1} checked in
              </div>
              <div className="text-[12.5px] text-mut mt-[1px]">
                ballots cast so far
              </div>
            </div>
            <div className="flex">
              {attendees.slice(0, 5).map((user, i) => (
                <div key={user.id} style={{ marginLeft: i > 0 ? -9 : 0 }}>
                  <Avatar
                    name={user.name ?? user.email ?? "?"}
                    image={user.image}
                    size={30}
                    ring
                  />
                </div>
              ))}
              {totalAttendees > 5 && (
                <div
                  className="w-[30px] h-[30px] rounded-full bg-soft flex items-center justify-center text-[11px] font-bold text-mut"
                  style={{
                    marginLeft: -9,
                    boxShadow: "0 0 0 2px #FBF6EE",
                  }}
                >
                  +{totalAttendees - 5}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Roll the dice */}
        <div>
          <Button
            kind="outline"
            full
            icon={<Dices size={19} color="#221A14" strokeWidth={2.1} />}
            onClick={rollDice}
            disabled={diceSpinning}
          >
            {diceSpinning ? "Rolling…" : "Can't decide? Roll the dice"}
          </Button>

          {dicePick && (
            <Card
              className="mt-[11px] p-[14px] flex items-center gap-[12px] animate-lvpop"
              style={{ border: "1px solid #E0512F" }}
            >
              <div
                className="w-[46px] h-[46px] rounded-[12px] flex-shrink-0"
                style={{ background: placeGradient(dicePick.colorHue) }}
              />
              <div className="flex-1">
                <div className="text-[12px] text-accent font-bold tracking-[.04em]">
                  THE DICE SAY
                </div>
                <div className="font-display font-bold text-[18px] text-ink">
                  {dicePick.name}
                </div>
                <div className="text-[12.5px] text-mut">
                  {dicePick.walkingMinutes} min walk · {dicePick.cuisine}
                </div>
              </div>
              <button
                onClick={rollDice}
                className="border-none bg-soft rounded-[10px] p-[9px] cursor-pointer"
              >
                <Dices size={20} color="#E0512F" strokeWidth={2.1} />
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
