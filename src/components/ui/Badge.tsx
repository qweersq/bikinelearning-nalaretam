type BadgeVariant = "teal" | "amber" | "neutral" | "green" | "red" | "violet";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  teal:    "bg-blue-100 text-blue-800 border border-blue-200",
  amber:   "bg-amber-100 text-amber-800 border border-amber-200",
  neutral: "bg-stone-100 text-stone-600 border border-stone-200",
  green:   "bg-emerald-100 text-emerald-800 border border-emerald-200",
  red:     "bg-red-100 text-red-700 border border-red-200",
  violet:  "bg-violet-100 text-violet-800 border border-violet-200",
};

export default function Badge({ variant = "teal", children, className = "", dot }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  );
}
