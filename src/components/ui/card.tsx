import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-card border border-line2 shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
