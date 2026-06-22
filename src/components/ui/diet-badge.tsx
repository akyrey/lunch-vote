const DIET_MAP: Record<string, { label: string; color: string; bg: string }> =
  {
    vegetarian: { label: "V", color: "#2F7D52", bg: "#2F7D521A" },
    vegan: { label: "VG", color: "#2F7D52", bg: "#2F7D521A" },
    glutenFree: { label: "GF", color: "#C98A1E", bg: "#C98A1E1A" },
  };

export function DietBadge({ flag }: { flag: string }) {
  const info = DIET_MAP[flag];
  if (!info) return null;
  return (
    <span
      className="font-body font-bold text-[10.5px] rounded-[5px] px-[5px] py-[2px] leading-none"
      style={{ color: info.color, background: info.bg }}
    >
      {info.label}
    </span>
  );
}
