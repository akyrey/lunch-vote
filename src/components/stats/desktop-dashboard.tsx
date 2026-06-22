"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, List, BarChart2, Users, Trophy, Flame, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { placeGradient } from "@/lib/utils";
import type { Place, User } from "@/lib/db/schema";

type Range = "30d" | "90d" | "All time";

interface KPIs {
  totalPolls: number;
  avgTurnout: number;
  avgSpend: number;
  currency: string;
  topSpotName: string;
  topSpotWins: number;
}

interface Props {
  mostVisited: (Place & { visitCount: number })[];
  winRates: (Place & { wins: number; appearances: number; winRate: number })[];
  leaderboard: (User & { totalPoints: number; totalVotes: number })[];
  userId: string;
  userName: string;
  isAdmin: boolean;
  kpis: KPIs;
}

const SIDEBAR_NAV = [
  { label: "Overview", icon: BarChart2, active: true },
  { label: "Polls", icon: Home, active: false },
  { label: "Places", icon: List, active: false },
  { label: "People", icon: Users, active: false },
];

export function DesktopDashboard({
  mostVisited,
  winRates,
  leaderboard,
  userId,
  userName,
  isAdmin,
  kpis,
}: Props) {
  const [range, setRange] = useState<Range>("90d");

  const maxVisit = Math.max(1, ...mostVisited.map((p) => p.visitCount));
  const maxWinRate = Math.max(1, ...winRates.map((p) => p.winRate));

  // Simulate weekly spend data
  const spendData = [16, 18, 15, 19, 14, 16, 15, 17];
  const lo = 10,
    hi = 22;
  const W = 300,
    H = 140,
    pad = 8;
  const pts = spendData.map((v, i) => [
    pad + i * ((W - 2 * pad) / (spendData.length - 1)),
    H - pad - ((v - lo) / (hi - lo)) * (H - 2 * pad),
  ]);
  const pathD = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1][0].toFixed(1)} ${H - pad} L ${pad} ${H - pad} Z`;

  // Simulate cuisine diversity
  const CATS = [
    { key: "pizza", label: "Pizza", color: "#E0512F" },
    { key: "italian", label: "Italian", color: "#C98A1E" },
    { key: "healthy", label: "Healthy", color: "#2F7D52" },
    { key: "jp", label: "Japanese", color: "#3E72A8" },
    { key: "other", label: "Other", color: "#8A6FB0" },
  ];
  const weekData = [
    { pizza: 2, italian: 1, healthy: 1, jp: 0, other: 1 },
    { pizza: 1, italian: 2, healthy: 1, jp: 1, other: 0 },
    { pizza: 2, italian: 1, healthy: 0, jp: 1, other: 1 },
    { pizza: 1, italian: 1, healthy: 2, jp: 0, other: 1 },
    { pizza: 0, italian: 2, healthy: 1, jp: 1, other: 1 },
    { pizza: 2, italian: 1, healthy: 1, jp: 1, other: 0 },
    { pizza: 1, italian: 2, healthy: 1, jp: 0, other: 1 },
    { pizza: 1, italian: 1, healthy: 2, jp: 1, other: 0 },
  ];
  const bW = 24, bGap = (W - weekData.length * bW) / (weekData.length - 1);
  const bH = 132;

  return (
    <div
      className="min-h-screen flex font-body text-ink"
      style={{ background: "#FBF6EE" }}
    >
      {/* Sidebar */}
      <aside
        className="w-[204px] flex-shrink-0 border-r border-line flex flex-col gap-1 p-[22px_14px]"
        style={{ minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-[9px] px-2 pb-[18px]">
          <div className="w-[30px] h-[30px] rounded-[9px] bg-accent flex items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3v7M5 3v4a2 2 0 002 2M9 3v4a2 2 0 01-2 2M7 11v10M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4S18.5 3 17 3zM17 13v8" />
            </svg>
          </div>
          <span className="font-display font-bold text-[18px] text-ink">
            LunchVote
          </span>
        </div>

        {SIDEBAR_NAV.map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            className="flex items-center gap-[11px] px-[11px] py-[10px] rounded-[10px] cursor-pointer"
            style={{
              background: active ? "#FBE7DF" : "transparent",
              color: active ? "#B53B20" : "#857667",
              fontWeight: active ? 700 : 600,
              fontSize: 14,
            }}
          >
            <Icon size={18} color={active ? "#B53B20" : "#A89A8B"} strokeWidth={2} />
            {label}
          </div>
        ))}

        <div className="flex-1" />

        {/* User footer */}
        <div
          className="flex items-center gap-[10px] px-2 py-[10px] border-t border-line2"
        >
          <Avatar name={userName} size={32} />
          <div>
            <div className="font-bold text-[13.5px]">{userName}</div>
            <div className="text-[11.5px] text-mut">
              {isAdmin ? "Admin" : "Member"}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-7 py-6 overflow-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-[12px] font-bold tracking-[.1em] uppercase text-accent">
              Statistics
            </div>
            <div className="font-display font-bold text-[28px] text-ink tracking-[-0.02em] mt-[2px]">
              How the team eats
            </div>
          </div>
          {/* Range picker */}
          <div className="flex gap-1 bg-soft rounded-[11px] p-1">
            {(["30d", "90d", "All time"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="border-none cursor-pointer px-[14px] py-[7px] rounded-[8px] font-body font-bold text-[13px] transition-all duration-150"
                style={{
                  background: range === r ? "#fff" : "transparent",
                  color: range === r ? "#221A14" : "#857667",
                  boxShadow: range === r ? "0 1px 3px rgba(34,26,20,.12)" : "none",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-[14px] mb-[14px]">
          {[
            { label: "Polls run", value: String(kpis.totalPolls), sub: "this quarter", icon: Home, color: "#221A14" },
            { label: "Avg turnout", value: `${kpis.avgTurnout}`, sub: "of the team", icon: Users, color: "#2F7D52" },
            { label: "Avg spend", value: `${kpis.currency === "EUR" ? "€" : kpis.currency}${kpis.avgSpend}`, sub: "per lunch", icon: BarChart2, color: "#221A14" },
            { label: "Top spot", value: kpis.topSpotName.split(" ")[0], sub: `${kpis.topSpotWins} wins`, icon: Trophy, color: "#E0512F" },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-card rounded-[16px] border border-line2 shadow-card p-[15px_16px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-mut">{label}</span>
                <Icon size={17} color="#A89A8B" strokeWidth={2} />
              </div>
              <div
                className="font-display font-bold text-[27px] mt-2 leading-none"
                style={{ color }}
              >
                {value}
              </div>
              <div className="text-[12px] text-mut2 mt-1">{sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid gap-[14px] mb-[14px]" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          {/* Most visited */}
          <div className="bg-card rounded-[16px] border border-line2 shadow-card p-[17px_18px]">
            <div className="font-display font-bold text-[16px] text-ink">Most-visited places</div>
            <div className="text-[12px] text-mut2 mt-[1px] mb-[14px]">last 90 days</div>
            {mostVisited.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3" style={{ marginBottom: i < mostVisited.length - 1 ? 12 : 0 }}>
                <span className="text-[13px] font-semibold text-ink whitespace-nowrap overflow-hidden" style={{ width: 118, textOverflow: "ellipsis" }}>
                  {p.name}
                </span>
                <div className="flex-1 h-[14px] rounded-[7px] bg-soft overflow-hidden">
                  <div
                    className="h-full rounded-[7px]"
                    style={{
                      width: `${(p.visitCount / maxVisit) * 100}%`,
                      background: `hsl(${p.colorHue} 46% 52%)`,
                    }}
                  />
                </div>
                <span className="font-display font-bold text-[14px] text-ink" style={{ width: 22, textAlign: "right" }}>
                  {p.visitCount}
                </span>
              </div>
            ))}
          </div>

          {/* Win rate */}
          <div className="bg-card rounded-[16px] border border-line2 shadow-card p-[17px_18px]">
            <div className="font-display font-bold text-[16px] text-ink">Win rate</div>
            <div className="text-[12px] text-mut2 mt-[1px] mb-[14px]">wins ÷ times offered</div>
            {winRates.map((p, i) => (
              <div key={p.id} className="flex items-center gap-[10px]" style={{ marginBottom: i < winRates.length - 1 ? 11 : 0 }}>
                <span className="text-[12.5px] font-semibold text-ink whitespace-nowrap overflow-hidden" style={{ width: 96, textOverflow: "ellipsis" }}>
                  {p.name}
                </span>
                <div className="flex-1 h-[12px] rounded-[6px] bg-soft overflow-hidden">
                  <div
                    className="h-full rounded-[6px] bg-accent"
                    style={{ width: `${(p.winRate / maxWinRate) * 100}%` }}
                  />
                </div>
                <span className="font-bold text-[13px] text-ink" style={{ width: 32, textAlign: "right" }}>
                  {p.winRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          {/* Cuisine diversity */}
          <div className="bg-card rounded-[16px] border border-line2 shadow-card p-[17px_18px]">
            <div className="font-display font-bold text-[16px] text-ink">Cuisine diversity</div>
            <div className="text-[12px] text-mut2 mt-[1px] mb-[14px]">lunches per week, last 8 weeks</div>
            <svg width="100%" viewBox={`0 0 ${W} ${bH + 18}`} style={{ display: "block" }}>
              {weekData.map((w, wi) => {
                const x = wi * (bW + bGap);
                let y = bH;
                const tot = CATS.reduce((a, { key }) => a + (w as Record<string, number>)[key], 0);
                return (
                  <g key={wi}>
                    {CATS.map(({ key, color }) => {
                      const hgt = tot ? ((w as Record<string, number>)[key] / tot) * bH : 0;
                      y -= hgt;
                      const r = Math.max(hgt - 1.5, 0);
                      return <rect key={key} x={x} y={y} width={bW} height={r} rx={1.5} fill={color} />;
                    })}
                    <text x={x + bW / 2} y={bH + 13} textAnchor="middle" fontSize={9} fill="#A89A8B" fontFamily="Hanken Grotesk, sans-serif">
                      w{wi + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap gap-x-[14px] gap-y-[5px] mt-[10px]">
              {CATS.map(({ key, label, color }) => (
                <span key={key} className="flex items-center gap-[5px] text-[11.5px] font-semibold text-mut">
                  <span className="w-[9px] h-[9px] rounded-[3px] inline-block" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Average spend */}
          <div className="bg-card rounded-[16px] border border-line2 shadow-card p-[17px_18px]">
            <div className="font-display font-bold text-[16px] text-ink">Average spend</div>
            <div className="text-[12px] text-mut2 mt-[1px] mb-[14px]">€ per head, weekly</div>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
              {[22, 16, 10].map((g) => {
                const gy = H - pad - ((g - lo) / (hi - lo)) * (H - 2 * pad);
                return (
                  <g key={g}>
                    <line x1={pad} x2={W - pad} y1={gy} y2={gy} stroke="rgba(34,26,20,.06)" strokeWidth={1} />
                    <text x={pad} y={gy - 3} fontSize={9} fill="#A89A8B" fontFamily="Hanken Grotesk, sans-serif">€{g}</text>
                  </g>
                );
              })}
              <path d={areaD} fill="#E0512F" opacity={0.1} />
              <path d={pathD} fill="none" stroke="#E0512F" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
              {pts.map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={3} fill="#fff" stroke="#E0512F" strokeWidth={2} />
              ))}
            </svg>
          </div>
        </div>

        {/* Charts row 3 */}
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          {/* Leaderboard */}
          <div className="bg-card rounded-[16px] border border-line2 shadow-card p-[17px_18px]">
            <div className="font-display font-bold text-[16px] text-ink mb-[1px]">Leaderboard</div>
            <div className="text-[12px] text-mut2 mb-[14px]">points · streak · wins</div>
            {leaderboard.slice(0, 6).map((u, i) => {
              const isYou = u.id === userId;
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-[13px] py-[9px]"
                  style={{ borderTop: i > 0 ? "1px solid rgba(34,26,20,.06)" : "none" }}
                >
                  <span
                    className="font-display font-bold text-[15px]"
                    style={{ width: 18, color: i === 0 ? "#C98A1E" : "#A89A8B" }}
                  >
                    {i + 1}
                  </span>
                  <Avatar name={u.name ?? u.email ?? "?"} image={u.image} size={34} />
                  <div className="flex-1">
                    <div className="font-bold text-[14px] text-ink">
                      {isYou ? "You" : u.name ?? u.email}
                    </div>
                    <div className="text-[12px] text-mut">
                      {u.totalVotes} votes
                    </div>
                  </div>
                  <div className="text-[13px] font-semibold text-mut flex items-center gap-1" style={{ width: 54 }}>
                    <Flame size={13} color="#C98A1E" />
                    —
                  </div>
                  <div
                    className="font-display font-bold text-[17px]"
                    style={{ color: isYou ? "#E0512F" : "#221A14", width: 42, textAlign: "right" }}
                  >
                    {u.totalPoints}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Participation */}
          <div className="bg-card rounded-[16px] border border-line2 shadow-card p-[17px_18px]">
            <div className="font-display font-bold text-[16px] text-ink">Participation</div>
            <div className="text-[12px] text-mut2 mt-[1px] mb-[14px]">check-ins & ballots</div>
            <ParticipationPanel leaderboard={leaderboard} />
          </div>
        </div>
      </main>
    </div>
  );
}

function ParticipationPanel({
  leaderboard,
}: {
  leaderboard: (User & { totalPoints: number; totalVotes: number })[];
}) {
  const pct = 84; // placeholder
  const R = 38;
  const circ = 2 * Math.PI * R;
  const top5 = leaderboard.slice(0, 5);
  const maxVotes = Math.max(1, ...top5.map((u) => u.totalVotes));

  return (
    <div className="flex gap-[18px] items-center">
      {/* Donut */}
      <div className="relative flex-shrink-0" style={{ width: 104, height: 104 }}>
        <svg width={104} height={104} viewBox="0 0 104 104">
          <circle cx={52} cy={52} r={R} fill="none" stroke="#F4ECE0" strokeWidth={12} />
          <circle
            cx={52} cy={52} r={R}
            fill="none" stroke="#2F7D52" strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            transform="rotate(-90 52 52)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-[24px] text-ink">{pct}%</span>
          <span className="text-[10.5px] text-mut">check-in</span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex-1">
        <div className="text-[12px] font-semibold text-mut2 mb-2">Ballots per person</div>
        {top5.map((u, i) => (
          <div key={u.id} className="flex items-center gap-[9px]" style={{ marginBottom: i < 4 ? 7 : 0 }}>
            <span className="text-[12px] font-semibold text-ink" style={{ width: 54 }}>
              {u.name?.split(" ")[0] ?? "—"}
            </span>
            <div className="flex-1 h-[9px] rounded-[5px] bg-soft overflow-hidden">
              <div
                className="h-full rounded-[5px]"
                style={{
                  width: `${(u.totalVotes / maxVotes) * 100}%`,
                  background: `hsl(${(i * 60 + 200) % 360} 46% 54%)`,
                }}
              />
            </div>
            <span className="text-[12px] font-bold text-mut" style={{ width: 18, textAlign: "right" }}>
              {u.totalVotes}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
