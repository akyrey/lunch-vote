import { daysAgo } from "@/lib/utils";

export function VisitBadge({ lastVisitedAt }: { lastVisitedAt: Date | null }) {
  const days = daysAgo(lastVisitedAt);

  if (days === null) {
    return (
      <span className="text-[11px] font-semibold text-mut bg-soft rounded-full px-2 py-[3px] whitespace-nowrap">
        Never visited
      </span>
    );
  }

  if (days <= 7) {
    return (
      <span className="text-[11px] font-bold text-accent bg-accent-bg rounded-full px-2 py-[3px] whitespace-nowrap">
        Recent · {days}d
      </span>
    );
  }

  return (
    <span className="text-[11px] font-semibold text-mut bg-soft rounded-full px-2 py-[3px] whitespace-nowrap">
      {days}d ago
    </span>
  );
}
