export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  const symbols: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${amount}`;
}

export function daysAgo(date: Date | null): number | null {
  if (!date) return null;
  const ms = Date.now() - date.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function placeGradient(hue: number): string {
  return `linear-gradient(150deg, hsl(${hue} 46% 60%), hsl(${hue} 42% 44%))`;
}

export function avatarBg(hue: number): string {
  return `hsl(${hue} 50% 55%)`;
}
