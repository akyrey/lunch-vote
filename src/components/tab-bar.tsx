"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, BarChart2 } from "lucide-react";

const TABS = [
  { label: "Today", href: "/", icon: Home, match: ["/", "/vote", "/results"] },
  { label: "Places", href: "/places", icon: List, match: ["/places"] },
  { label: "Stats", href: "/stats", icon: BarChart2, match: ["/stats"] },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex-shrink-0 flex gap-1 px-[14px] pb-[26px] pt-[9px] border-t border-line2"
      style={{
        background: "rgba(251,246,238,.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {TABS.map(({ label, href, icon: Icon, match }) => {
        const active =
          match.some((m) => pathname === m) ||
          (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-1 select-none"
            style={{
              color: active ? "#E0512F" : "#A89A8B",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Icon
              size={24}
              strokeWidth={active ? 2.3 : 1.9}
              color={active ? "#E0512F" : "#A89A8B"}
            />
            <span
              className="text-[11px]"
              style={{ fontWeight: active ? 700 : 600 }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
