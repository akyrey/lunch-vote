export function Price({
  tier,
  size = 13,
}: {
  tier: string;
  size?: number;
}) {
  const filled = tier;
  const empty = "$$$".slice(tier.length);
  return (
    <span
      className="font-body font-bold tracking-[0.04em]"
      style={{ fontSize: size }}
    >
      <span className="text-accent">{filled}</span>
      <span style={{ color: "rgba(34,26,20,0.10)" }}>{empty}</span>
    </span>
  );
}
