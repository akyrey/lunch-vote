import Link from "next/link";
import { Flame, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { placeGradient } from "@/lib/utils";
import type { Place, User } from "@/lib/db/schema";

interface MobileStatsProps {
  mostVisited: (Place & { visitCount: number })[];
  leaderboard: (User & { totalPoints: number; totalVotes: number })[];
  userStreak: number;
  userId: string;
}

export function MobileStats({
  mostVisited,
  leaderboard,
  userStreak,
  userId,
}: MobileStatsProps) {
  const maxVisits = Math.max(1, ...mostVisited.map((p) => p.visitCount));
  const userEntry = leaderboard.find((u) => u.id === userId);
  const userPoints = userEntry?.totalPoints ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-[58px] pb-2">
        <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent">
          Team
        </div>
        <div className="font-display font-bold text-[31px] text-ink mt-[5px] leading-[1.04] tracking-[-0.02em]">
          Stats
        </div>
        <div className="text-[14px] text-mut mt-[6px]">
          How we've been eating
        </div>
      </div>

      <div className="px-5 pt-3 pb-7 flex flex-col gap-[14px]">
        {/* Streak card */}
        <Card
          className="p-[18px] flex items-center gap-[15px]"
          style={{
            background: "linear-gradient(135deg, #fff, #FBF0D8)",
          }}
        >
          <div className="w-[54px] h-[54px] rounded-[15px] flex-shrink-0 flex items-center justify-center bg-gold-bg">
            <Flame size={30} color="#C98A1E" />
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-[24px] text-ink">
              {userStreak}-day streak
            </div>
            <div className="text-[13px] text-mut mt-[1px]">
              {userStreak > 0
                ? "You've been voting consistently"
                : "Vote today to start a streak!"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-[20px] text-accent">
              {userPoints}
            </div>
            <div className="text-[11px] text-mut">points</div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-[16px_16px_8px]">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} color="#C98A1E" strokeWidth={2.1} />
            <span className="font-display font-bold text-[16px] text-ink">
              Leaderboard
            </span>
          </div>
          {leaderboard.slice(0, 5).map((user, i) => {
            const isYou = user.id === userId;
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 py-2"
                style={{
                  borderTop: i > 0 ? "1px solid rgba(34,26,20,0.06)" : "none",
                }}
              >
                <span
                  className="w-5 font-display font-bold text-[15px] text-center"
                  style={{ color: i === 0 ? "#C98A1E" : "#A89A8B" }}
                >
                  {i + 1}
                </span>
                <Avatar
                  name={user.name ?? user.email ?? "?"}
                  image={user.image}
                  size={34}
                />
                <div className="flex-1">
                  <div className="font-bold text-[14.5px] text-ink">
                    {isYou ? "You" : user.name ?? user.email}
                  </div>
                  <div className="text-[12px] text-mut flex items-center gap-1">
                    <Flame size={12} color="#C98A1E" />
                    {user.totalVotes} votes
                  </div>
                </div>
                <div
                  className="font-display font-bold text-[16px]"
                  style={{ color: isYou ? "#E0512F" : "#221A14" }}
                >
                  {user.totalPoints}
                </div>
              </div>
            );
          })}
        </Card>

        {/* Most visited */}
        <Card className="p-4">
          <div className="font-display font-bold text-[16px] text-ink mb-[13px]">
            Most-visited · 90 days
          </div>
          {mostVisited.map((place, i) => (
            <div
              key={place.id}
              className="flex items-center gap-3"
              style={{ marginBottom: i < mostVisited.length - 1 ? 11 : 0 }}
            >
              <div
                className="w-[10px] h-[10px] rounded-[2px] flex-shrink-0"
                style={{
                  background: `hsl(${place.colorHue} 46% 52%)`,
                }}
              />
              <div className="flex justify-between text-[13px] mb-[5px] w-full">
                <span className="font-semibold text-ink">{place.name}</span>
                <span className="font-bold text-mut">{place.visitCount}</span>
              </div>
            </div>
          ))}
          {mostVisited.map((place, i) => (
            <div key={`bar-${place.id}`} className="mb-[11px]">
              <div className="h-[9px] rounded-[6px] bg-soft overflow-hidden">
                <div
                  className="h-full rounded-[6px]"
                  style={{
                    width: `${(place.visitCount / maxVisits) * 100}%`,
                    background: `hsl(${place.colorHue} 46% 52%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </Card>

        {/* Desktop CTA */}
        <Link
          href="/dashboard"
          className="text-center text-[13px] font-bold text-accent py-1"
        >
          Full dashboard on desktop →
        </Link>
      </div>
    </div>
  );
}
