import { avatarBg } from "@/lib/utils";

export function Avatar({
  name,
  hue,
  size = 34,
  ring = false,
  image,
}: {
  name: string;
  hue?: number;
  size?: number;
  ring?: boolean;
  image?: string | null;
}) {
  const initial = (name || "?")[0].toUpperCase();
  const bg = hue !== undefined ? avatarBg(hue) : "#857667";
  const ringStyle = ring
    ? { boxShadow: `0 0 0 2px #FBF6EE, 0 0 0 3.5px ${bg}` }
    : {};

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        width={size}
        height={size}
        className="rounded-full flex-shrink-0 object-cover"
        style={{ width: size, height: size, ...ringStyle }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center text-white font-body font-bold"
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: Math.round(size * 0.4),
        ...ringStyle,
      }}
    >
      {initial}
    </div>
  );
}
